'use client';

import { useState, useEffect } from 'react';
import { LANGUAGE_TO_SCRYFALL_CODE } from '@/lib/mtg/languages';
import { getCardBySetNumberAndLang } from '@/lib/scryfall/endpoints/cards';
import type { MtgLanguage } from '@/lib/mtg/languages';
import type { ScryfallImageUris, ScryfallCardFace } from '@/lib/scryfall/types/scryfall';

interface LocalizedImageResult {
	image_uris?: ScryfallImageUris;
	card_faces?: ScryfallCardFace[];
}

// Module-level negative cache: URLs that returned 404 — never re-fetch these
const notFound = new Set<string>();

export function useLocalizedImage(
	card: { set: string; collector_number: string; language?: string; entry?: { language?: string } },
	enabled: boolean
): LocalizedImageResult | null {
	const [result, setResult] = useState<LocalizedImageResult | null>(null);

	const language = card.entry?.language ?? card.language;
	const lang = language ? LANGUAGE_TO_SCRYFALL_CODE[language as MtgLanguage] : undefined;
	const cacheKey = `${card.set}/${card.collector_number}/${lang}`;
	const needsFetch = enabled && !!lang && lang !== 'en' && !notFound.has(cacheKey);

	useEffect(() => {
		if (!needsFetch) return;
		let cancelled = false;

		getCardBySetNumberAndLang(card.set, card.collector_number, lang!)
			.then((localized) => {
				if (!cancelled)
					setResult({ image_uris: localized.image_uris, card_faces: localized.card_faces });
			})
			.catch(() => {
				notFound.add(cacheKey);
				/* 404 or rate-limit → keep English image */
			});

		return () => {
			cancelled = true;
		};
	}, [card.set, card.collector_number, lang, needsFetch, cacheKey]);

	return result;
}
