// Application-level card types for collection management

import type {
	ScryfallSet,
	ScryfallCard,
	ScryfallUUID,
	ScryfallColors,
	ScryfallLegalities,
	ScryfallImageUris,
	ScryfallPrices,
	ScryfallLayout,
	ScryfallCardFace,
	ScryfallRelatedCard,
	ScryfallGame,
	ScryfallBorderColor,
	ScryfallFrame,
	ScryfallFrameEffect,
} from './scryfall';

export type MTGCardRarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus';

export interface MTGCard {
	id: string;
	name: string;
	set: string;
	set_name?: string;
	collector_number?: string;
	rarity?: MTGCardRarity;
	mana_cost?: string;
	cmc?: number;
	type_line: string;
	power?: string;
	toughness?: string;
	oracle_text?: string;
	flavor_text?: string;
	imageUrl?: string;
	prices?: {
		usd?: string;
		eur?: string;
	};

	// Scryfall extensions (optional)
	scryfallId?: ScryfallUUID;
	oracleId?: ScryfallUUID;
	colors?: ScryfallColors;
	color_identity?: ScryfallColors;
	keywords?: string[];
	legalities?: ScryfallLegalities;
	scryfallData?: ScryfallCard;

	// Custom metadata from SQL import
	condition?: string;
	tags?: string[];
	dateAdded?: string;
	isFoil?: boolean;
	isEtched?: boolean;
	lang?: string;
}

export interface EnhancedMTGCard extends Omit<MTGCard, 'scryfallData'> {
	scryfallData: ScryfallCard;
	// Computed properties from Scryfall
	imageUris?: ScryfallImageUris;
	allPrices?: ScryfallPrices;
	artist?: string;
	released?: string;
	fullArt?: boolean;
	foil?: boolean;
	nonfoil?: boolean;
	reserved?: boolean;
	etched?: boolean;
	layout?: ScryfallLayout;
	card_faces?: ScryfallCardFace[];
	all_parts?: ScryfallRelatedCard[];
	games?: ScryfallGame[];
	finishes?: string[];
	border_color?: ScryfallBorderColor;
	frame?: ScryfallFrame;
	frame_effects?: ScryfallFrameEffect[];
	promo?: boolean;
	reprint?: boolean;
	loyalty?: string;
	defense?: string;
	edhrec_rank?: number;
	related_uris?: Record<string, string>;
}

export interface MTGSet {
	code: string;
	name: string;
	releaseDate: string;
	totalCards: number;
	iconUrl?: string;

	// Scryfall extensions (optional)
	scryfallId?: ScryfallUUID;
	setType?: string;
	digital?: boolean;
	foilOnly?: boolean;
	scryfallData?: ScryfallSet;
}

export interface EnhancedMTGSet extends Omit<MTGSet, 'scryfallData'> {
	scryfallData: ScryfallSet;
	parentSetCode?: string;
	block?: string;
	printedSize?: number;
}

export interface CollectionStats {
	totalCards: number;
	uniqueCards: number;
	uniqueByEdition: number;
	setCount: number;
	rarityDistribution: Record<string, number>;
	colorDistribution?: Record<string, number>;
	typeDistribution?: Record<string, number>;
}

export interface StackedCard extends MTGCard {
	quantity: number;
	instanceIds: string[];
}
