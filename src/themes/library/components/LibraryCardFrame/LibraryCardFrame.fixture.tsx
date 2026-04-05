'use client';

import { LibraryCardFrame } from './LibraryCardFrame';
import { MOCK_CARDS } from '@/themes/_shared/mockData';

const fixtures = {
	'Single Card': <LibraryCardFrame src={MOCK_CARDS[0].src} alt={MOCK_CARDS[0].name} />,
	'Small Card': (
		<LibraryCardFrame src={MOCK_CARDS[2].src} alt={MOCK_CARDS[2].name} width={146} height={204} />
	),
};

export default fixtures;
