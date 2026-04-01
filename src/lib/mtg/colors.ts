import type { ScryfallColor } from '@/lib/scryfall/types/scryfall';

export const MTG_COLORS: { id: ScryfallColor; name: string; symbol: string }[] = [
	{ id: 'W', name: 'White', symbol: 'W' },
	{ id: 'U', name: 'Blue', symbol: 'U' },
	{ id: 'B', name: 'Black', symbol: 'B' },
	{ id: 'R', name: 'Red', symbol: 'R' },
	{ id: 'G', name: 'Green', symbol: 'G' },
];
