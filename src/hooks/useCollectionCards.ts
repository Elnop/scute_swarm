'use client';

import { useState, useEffect } from 'react';
import { getCardCollection } from '@/lib/scryfall/endpoints/cards';
import { getCardsFromCache, putCardsInCache } from '@/lib/card-cache';
import type { CollectionEntry, Card } from '@/types/card';

const BATCH_SIZE = 75;

export function useCollectionCards(entries: CollectionEntry[]): {
	cards: Card[];
	isLoading: boolean;
	totalExpected: number;
} {
	const [cards, setCards] = useState<Card[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Stable key representing the current set of IDs so we only re-fetch on actual changes
	const idsKey = entries
		.map((e) => e.id)
		.sort()
		.join(',');

	useEffect(() => {
		if (entries.length === 0) {
			setCards([]);
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setIsLoading(true);

		async function hydrate() {
			// Build a lookup map from id → CollectionEntry for fast merge
			const entryMap = new Map<string, CollectionEntry>();
			for (const entry of entries) {
				entryMap.set(entry.id, entry);
			}

			const allIds = entries.map((e) => e.id);

			// Phase 1: read from IndexedDB cache (~20-50ms)
			const cachedMap = await getCardsFromCache(allIds);
			if (cancelled) return;

			const missIds = allIds.filter((id) => !cachedMap.has(id));

			// Build cards from cache hits
			const cachedCards: Card[] = [];
			for (const [id, scryfallCard] of cachedMap) {
				const entry = entryMap.get(id);
				if (entry) cachedCards.push({ ...scryfallCard, ...entry });
			}

			// If everything is cached, we're done
			if (missIds.length === 0) {
				if (!cancelled) {
					setCards(cachedCards);
					setIsLoading(false);
				}
				return;
			}

			// Show cached cards immediately while fetching the rest
			if (cachedCards.length > 0 && !cancelled) {
				setCards(cachedCards);
			}

			// Phase 2: fetch only the cache misses from the network
			const identifiers = missIds.map((id) => ({ id }));
			const chunks: (typeof identifiers)[] = [];
			for (let i = 0; i < identifiers.length; i += BATCH_SIZE) {
				chunks.push(identifiers.slice(i, i + BATCH_SIZE));
			}

			// Launch all batches concurrently — they self-sequence via the rate-limiter
			const settled = await Promise.allSettled(chunks.map((chunk) => getCardCollection(chunk)));
			if (cancelled) return;

			const fetchedScryfallCards = [];
			for (const result of settled) {
				if (result.status === 'rejected') {
					console.error('[useCollectionCards] batch failed:', result.reason);
					continue;
				}
				for (const scryfallCard of result.value.data) {
					fetchedScryfallCards.push(scryfallCard);
				}
			}

			// Persist new cards to the cache (fire-and-forget)
			void putCardsInCache(fetchedScryfallCards);

			const fetchedCards: Card[] = [];
			for (const scryfallCard of fetchedScryfallCards) {
				const entry = entryMap.get(scryfallCard.id);
				if (entry) fetchedCards.push({ ...scryfallCard, ...entry });
			}

			if (!cancelled) {
				setCards([...cachedCards, ...fetchedCards]);
				setIsLoading(false);
			}
		}

		hydrate().catch((err) => {
			if (!cancelled) {
				console.error('[useCollectionCards] hydration failed:', err);
				setIsLoading(false);
			}
		});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [idsKey]);

	return { cards, isLoading, totalExpected: entries.length };
}
