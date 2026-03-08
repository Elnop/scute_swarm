export const MTG_LANGUAGES = [
	'English',
	'French',
	'German',
	'Spanish',
	'Italian',
	'Portuguese',
	'Japanese',
	'Korean',
	'Russian',
	'Simplified Chinese',
	'Traditional Chinese',
	'Hebrew',
	'Latin',
	'Ancient Greek',
	'Arabic',
	'Sanskrit',
	'Phyrexian',
] as const;

export type MtgLanguage = (typeof MTG_LANGUAGES)[number];

export const LANGUAGE_TO_SCRYFALL_CODE: Partial<Record<MtgLanguage, string>> = {
	English: 'en',
	French: 'fr',
	German: 'de',
	Spanish: 'es',
	Italian: 'it',
	Portuguese: 'pt',
	Japanese: 'ja',
	Korean: 'ko',
	Russian: 'ru',
	'Simplified Chinese': 'zhs',
	'Traditional Chinese': 'zht',
};
