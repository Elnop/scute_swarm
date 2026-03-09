import type { ImportFormatId, ImportFormatDescriptor, FormatParser } from '../types';
import { parseMoxfield, moxfieldDescriptor } from './moxfield';
import { parseMTGA, mtgaDescriptor } from './mtga';

export const FORMAT_REGISTRY: ImportFormatDescriptor[] = [moxfieldDescriptor, mtgaDescriptor];

const PARSERS: Record<ImportFormatId, FormatParser> = {
	moxfield: parseMoxfield,
	mtga: parseMTGA,
};

export function getParser(formatId: ImportFormatId): FormatParser {
	return PARSERS[formatId];
}
