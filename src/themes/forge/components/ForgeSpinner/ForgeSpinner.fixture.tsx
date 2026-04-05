'use client';

import { ForgeSpinner } from './ForgeSpinner';

const fixtures = {
	'All Sizes': (
		<div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
			<ForgeSpinner size="sm" />
			<ForgeSpinner size="md" />
			<ForgeSpinner size="lg" />
		</div>
	),
};

export default fixtures;
