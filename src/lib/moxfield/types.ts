// Format "Collection" export (full)
export const MOXFIELD_COLLECTION_HEADERS = [
	'Count',
	'Tradelist Count',
	'Name',
	'Edition',
	'Condition',
	'Language',
	'Foil',
	'Tags',
	'Last Modified',
	'Collector Number',
	'Alter',
	'Proxy',
	'Purchase Price',
] as const;

// Export header used when serializing (Collection format)
export const MOXFIELD_CSV_HEADERS = MOXFIELD_COLLECTION_HEADERS;

export type MoxfieldFoilType = '' | 'foil' | 'etched';

export interface MoxfieldRow {
	count: number;
	tradelistCount: number;
	name: string;
	edition: string;
	condition: string;
	language: string;
	foil: MoxfieldFoilType;
	tags: string[];
	collectorNumber: string;
	alter: boolean;
	proxy: boolean;
	purchasePrice: string;
}
