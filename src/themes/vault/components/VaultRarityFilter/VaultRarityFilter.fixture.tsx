'use client';

import { useState } from 'react';
import { VaultRarityFilter } from './VaultRarityFilter';

function Interactive() {
	const [value, setValue] = useState<string[]>([]);
	return <VaultRarityFilter value={value} onChange={setValue} />;
}

function Preselected() {
	const [value, setValue] = useState<string[]>(['rare', 'mythic']);
	return <VaultRarityFilter value={value} onChange={setValue} />;
}

const fixtures = { Interactive, Preselected };

export default fixtures;
