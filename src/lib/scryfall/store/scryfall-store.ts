'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScryfallSet, ScryfallCardSymbol } from '@/lib/scryfall/types/scryfall';
import { getAllSets } from '@/lib/scryfall/endpoints/sets';
import { createSymbolDictionary } from '@/lib/scryfall/endpoints/symbols';

const SETS_TTL = 3_600_000; // 1 hour
const SYMBOLS_TTL = 86_400_000; // 24 hours

const STORAGE_KEY = 'scryfall-store';

type ScryfallStoreState = {
	sets: ScryfallSet[];
	symbols: Record<string, ScryfallCardSymbol>;
	setsLoadedAt: number | null;
	symbolsLoadedAt: number | null;
	isLoadingSets: boolean;
	isLoadingSymbols: boolean;
	setsError: string | null;
	symbolsError: string | null;
};

type ScryfallStoreActions = {
	fetchSets: () => Promise<void>;
	fetchSymbols: () => Promise<void>;
};

export const useScryfallStore = create<ScryfallStoreState & ScryfallStoreActions>()(
	persist(
		(set, get) => ({
			sets: [],
			symbols: {},
			setsLoadedAt: null,
			symbolsLoadedAt: null,
			isLoadingSets: false,
			isLoadingSymbols: false,
			setsError: null,
			symbolsError: null,

			fetchSets: async () => {
				const { sets, setsLoadedAt } = get();
				if (sets.length > 0 && setsLoadedAt !== null && Date.now() - setsLoadedAt < SETS_TTL) {
					return;
				}

				set({ isLoadingSets: true, setsError: null });

				try {
					const result = await getAllSets();
					const filtered = result.data
						.filter((s) => s.set_type !== 'token' && s.set_type !== 'memorabilia')
						.sort((a, b) => {
							const dateA = new Date(a.released_at ?? '').getTime();
							const dateB = new Date(b.released_at ?? '').getTime();
							return dateB - dateA;
						});
					set({ sets: filtered, setsLoadedAt: Date.now(), isLoadingSets: false });
				} catch (err) {
					set({
						setsError: err instanceof Error ? err.message : 'Failed to fetch sets',
						isLoadingSets: false,
					});
				}
			},

			fetchSymbols: async () => {
				const { symbols, symbolsLoadedAt } = get();
				if (
					Object.keys(symbols).length > 0 &&
					symbolsLoadedAt !== null &&
					Date.now() - symbolsLoadedAt < SYMBOLS_TTL
				) {
					return;
				}

				set({ isLoadingSymbols: true, symbolsError: null });

				try {
					const dictionary = await createSymbolDictionary();
					set({ symbols: dictionary, symbolsLoadedAt: Date.now(), isLoadingSymbols: false });
				} catch (err) {
					set({
						symbolsError: err instanceof Error ? err.message : 'Failed to fetch symbols',
						isLoadingSymbols: false,
					});
				}
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				sets: state.sets,
				symbols: state.symbols,
				setsLoadedAt: state.setsLoadedAt,
				symbolsLoadedAt: state.symbolsLoadedAt,
			}),
		}
	)
);
