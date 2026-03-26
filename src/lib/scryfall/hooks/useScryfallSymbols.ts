'use client';

import { useEffect } from 'react';
import { useScryfallStore } from '@/lib/scryfall/store/scryfall-store';
import type { ScryfallCardSymbol } from '@/lib/scryfall/types/scryfall';

export function useScryfallSymbols(): Record<string, ScryfallCardSymbol> {
	const symbols = useScryfallStore((s) => s.symbols);
	const fetchSymbols = useScryfallStore((s) => s.fetchSymbols);

	useEffect(() => {
		fetchSymbols();
	}, [fetchSymbols]);

	return symbols;
}
