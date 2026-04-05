'use client';

import { LibraryCardGrid } from './LibraryCardGrid';
import { LibraryCardFrame } from '../LibraryCardFrame/LibraryCardFrame';
import { MOCK_CARDS } from '@/themes/_shared/mockData';

const fixtures = {
	'4 Columns': (
		<LibraryCardGrid columns={4}>
			{MOCK_CARDS.map((card) => (
				<LibraryCardFrame key={card.name} src={card.src} alt={card.name} width={220} height={307} />
			))}
		</LibraryCardGrid>
	),
};

export default fixtures;
