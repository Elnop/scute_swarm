'use client';

import { useRouter } from 'next/navigation';
import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import { CardImage } from '@/components/cards/CardImage';
import styles from './CollectionGrid.module.css';

interface CollectionEntry {
	card: ScryfallCard;
	quantity: number;
	dateAdded: string;
}

export interface CollectionGridProps {
	entries: CollectionEntry[];
	onDecrement: (cardId: string) => void;
}

export function CollectionGrid({ entries, onDecrement }: CollectionGridProps) {
	const router = useRouter();

	return (
		<div className={styles.grid}>
			{entries.map((entry) => (
				<div key={entry.card.id} className={styles.item}>
					<div className={styles.imageWrapper}>
						<CardImage
							card={entry.card}
							size="normal"
							onClick={() => router.push(`/card/${entry.card.id}`)}
						/>
						{entry.quantity > 1 && <span className={styles.badge}>x{entry.quantity}</span>}
						<button
							type="button"
							className={styles.removeButton}
							onClick={(e) => {
								e.stopPropagation();
								onDecrement(entry.card.id);
							}}
							aria-label={`Remove one ${entry.card.name}`}
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
								<path
									d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6 6.5v3M8 6.5v3M3 4l.5 7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1L11 4"
									stroke="currentColor"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<p className={styles.cardName}>{entry.card.name}</p>
				</div>
			))}
		</div>
	);
}
