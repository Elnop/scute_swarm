'use client';

import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import { CardImage } from './CardImage';
import styles from '@/lib/collection/styles/lightbox.module.css';

interface Props {
	card: ScryfallCard;
	onClose: () => void;
}

export function CardLightbox({ card, onClose }: Props) {
	return (
		<div className={styles.lightbox} onClick={onClose}>
			<button type="button" onClick={onClose} aria-label="Fermer" className={styles.closeButton}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M2 2l12 12M14 2L2 14"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					/>
				</svg>
			</button>
			<div className={styles.lightboxCard} onClick={(e) => e.stopPropagation()}>
				<CardImage card={card} size="large" priority />
			</div>
		</div>
	);
}
