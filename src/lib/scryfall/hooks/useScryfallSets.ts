'use client';

import { useEffect } from 'react';
import type { ScryfallSet } from '@/lib/scryfall/types/scryfall';
import { useScryfallStore } from '@/lib/scryfall/store/scryfall-store';

export function useScryfallSets(): {
	sets: ScryfallSet[];
	isLoading: boolean;
	error: Error | null;
} {
	const sets = useScryfallStore((s) => s.sets);
	const isLoadingSets = useScryfallStore((s) => s.isLoadingSets);
	const setsError = useScryfallStore((s) => s.setsError);
	const fetchSets = useScryfallStore((s) => s.fetchSets);

	useEffect(() => {
		fetchSets();
	}, [fetchSets]);

	return {
		sets,
		isLoading: isLoadingSets,
		error: setsError !== null ? new Error(setsError) : null,
	};
}
