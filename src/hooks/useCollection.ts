'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import type { CollectionStats } from '@/lib/scryfall/types/card';

const STORAGE_KEY = 'mtg-snap-collection';

interface CollectionEntry {
	card: ScryfallCard;
	quantity: number;
	dateAdded: string;
}

type CollectionData = Record<string, CollectionEntry>;

const EMPTY: CollectionData = {};
let listeners: Array<() => void> = [];
let cachedSnapshot: CollectionData | null = null;

function getSnapshot(): CollectionData {
	if (cachedSnapshot !== null) return cachedSnapshot;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			cachedSnapshot = EMPTY;
			return EMPTY;
		}
		cachedSnapshot = JSON.parse(raw) as CollectionData;
		return cachedSnapshot;
	} catch {
		cachedSnapshot = EMPTY;
		return EMPTY;
	}
}

function getServerSnapshot(): CollectionData {
	return EMPTY;
}

function emitChange() {
	cachedSnapshot = null;
	for (const listener of listeners) {
		listener();
	}
}

function subscribe(listener: () => void) {
	listeners = [...listeners, listener];
	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
}

function saveCollection(data: CollectionData): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// localStorage quota exceeded or unavailable
	}
	emitChange();
}

export function useCollection() {
	const collection = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	const addCard = useCallback((card: ScryfallCard) => {
		const current = getSnapshot();
		const existing = current[card.id];
		saveCollection({
			...current,
			[card.id]: {
				card,
				quantity: existing ? existing.quantity + 1 : 1,
				dateAdded: existing?.dateAdded ?? new Date().toISOString(),
			},
		});
	}, []);

	const removeCard = useCallback((cardId: string) => {
		const current = getSnapshot();
		const next = { ...current };
		delete next[cardId];
		saveCollection(next);
	}, []);

	const decrementCard = useCallback((cardId: string) => {
		const current = getSnapshot();
		const existing = current[cardId];
		if (!existing) return;
		if (existing.quantity <= 1) {
			const next = { ...current };
			delete next[cardId];
			saveCollection(next);
		} else {
			saveCollection({
				...current,
				[cardId]: { ...existing, quantity: existing.quantity - 1 },
			});
		}
	}, []);

	const getQuantity = useCallback(
		(cardId: string): number => {
			return collection[cardId]?.quantity ?? 0;
		},
		[collection]
	);

	const getStats = useCallback((): CollectionStats => {
		const entries = Object.values(collection);
		const sets = new Set<string>();
		const rarityDistribution: Record<string, number> = {};
		let totalCards = 0;

		for (const entry of entries) {
			totalCards += entry.quantity;
			sets.add(entry.card.set);
			const rarity = entry.card.rarity;
			rarityDistribution[rarity] = (rarityDistribution[rarity] ?? 0) + entry.quantity;
		}

		return {
			totalCards,
			uniqueCards: entries.length,
			uniqueByEdition: entries.length,
			setCount: sets.size,
			rarityDistribution,
		};
	}, [collection]);

	const clearCollection = useCallback(() => {
		saveCollection({});
	}, []);

	const entries = Object.values(collection);

	return {
		collection,
		entries,
		isLoaded: true,
		addCard,
		removeCard,
		decrementCard,
		getQuantity,
		getStats,
		clearCollection,
	};
}
