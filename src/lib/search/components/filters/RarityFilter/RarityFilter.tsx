'use client';

import styles from './RarityFilter.module.css';

const rarities: { id: string; name: string }[] = [
	{ id: 'common', name: 'Common' },
	{ id: 'uncommon', name: 'Uncommon' },
	{ id: 'rare', name: 'Rare' },
	{ id: 'mythic', name: 'Mythic' },
];

function RarityIcon({ rarity }: { rarity: string }) {
	switch (rarity) {
		case 'common':
			return (
				<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
					<circle cx="6" cy="6" r="5" fill="#9e9e9e" />
				</svg>
			);
		case 'uncommon':
			return (
				<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
					<circle cx="6" cy="6" r="5" fill="#b0c4de" />
				</svg>
			);
		case 'rare':
			return (
				<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
					<polygon points="6,1 11,6 6,11 1,6" fill="#c9a84c" />
				</svg>
			);
		case 'mythic':
			return (
				<svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
					<ellipse cx="6" cy="7" rx="5" ry="6" fill="#e8671b" />
				</svg>
			);
		default:
			return null;
	}
}

export interface RarityFilterProps {
	value: string[];
	onChange: (v: string[]) => void;
}

export function RarityFilter({ value, onChange }: RarityFilterProps) {
	const handleToggle = (id: string) => {
		if (value.includes(id)) {
			onChange(value.filter((r) => r !== id));
		} else {
			onChange([...value, id]);
		}
	};

	return (
		<div className={styles.container}>
			<span className={styles.label}>Rareté</span>
			<div className={styles.rarities}>
				{rarities.map((rarity) => (
					<button
						key={rarity.id}
						type="button"
						className={`${styles.rarityButton} ${value.includes(rarity.id) ? styles.selected : ''}`}
						data-rarity={rarity.id}
						onClick={() => handleToggle(rarity.id)}
						aria-pressed={value.includes(rarity.id)}
					>
						<RarityIcon rarity={rarity.id} />
						{rarity.name}
					</button>
				))}
			</div>
		</div>
	);
}
