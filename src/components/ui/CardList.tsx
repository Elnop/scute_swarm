'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import type { Card } from '@/types/cards';
import { CardImage } from '@/components/cards/CardImage';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import styles from './CardList.module.css';

type AnyCard = ScryfallCard | Card;

export interface CardListColumn {
	key: string;
	label: string;
	render?: (card: AnyCard) => ReactNode;
}

export interface CardListProps {
	cards: AnyCard[];
	// Pagination intégrée
	isLoading?: boolean;
	isLoadingMore?: boolean;
	hasMore?: boolean;
	onLoadMore?: () => void;
	skeletonCount?: number;
	// Interactions
	onCardClick?: (card: AnyCard) => void;
	renderOverlay?: (card: AnyCard) => ReactNode;
	// Table
	tableColumns?: CardListColumn[];
	// Grille : nombre de cartes par ligne (fixe la taille des cartes)
	cardsPerLine?: number;
	className?: string;
}

const DEFAULT_SKELETON_COUNT = 12;

// CSS class names intended for use inside renderOverlay
export const cardListOverlayStyles = {
	removeButton: styles.cardRemoveBtn,
};

export function CardList({
	cards,
	isLoading = false,
	isLoadingMore = false,
	hasMore = false,
	onLoadMore,
	skeletonCount = DEFAULT_SKELETON_COUNT,
	onCardClick,
	renderOverlay,
	tableColumns,
	cardsPerLine,
	className,
}: CardListProps) {
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

	const { sentinelRef } = useInfiniteScroll({
		onLoadMore: onLoadMore ?? (() => {}),
		hasMore: hasMore && !!onLoadMore,
		isLoading: isLoading || isLoadingMore,
	});

	const toggle = (
		<div className={styles.viewToggle}>
			<button
				type="button"
				className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleBtnActive : ''}`}
				onClick={() => setViewMode('grid')}
			>
				Grille
			</button>
			<button
				type="button"
				className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.toggleBtnActive : ''}`}
				onClick={() => setViewMode('table')}
			>
				Tableau
			</button>
		</div>
	);

	if (viewMode === 'table') {
		const columns = tableColumns ?? [];
		return (
			<>
				{toggle}
				<div className={styles.tableContainer}>
					<table className={styles.table}>
						<thead>
							<tr>
								{columns.map((col) => (
									<th key={col.key}>{col.label}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{cards.map((card) => (
								<tr
									key={card.id}
									className={onCardClick ? styles.clickableRow : undefined}
									onClick={onCardClick ? () => onCardClick(card) : undefined}
								>
									{columns.map((col) => (
										<td key={col.key}>
											{col.render
												? col.render(card)
												: String((card as unknown as Record<string, unknown>)[col.key] ?? '')}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{hasMore && onLoadMore && <div ref={sentinelRef} />}
			</>
		);
	}

	// Grid view
	const gridClass = [cardsPerLine ? styles.gridFixed : styles.grid, className]
		.filter(Boolean)
		.join(' ');
	const gridStyle = cardsPerLine
		? ({ '--cards-per-line': cardsPerLine } as React.CSSProperties)
		: undefined;

	const showInitialSkeletons = isLoading && cards.length === 0;

	if (showInitialSkeletons) {
		return (
			<>
				{toggle}
				<div className={gridClass} style={gridStyle}>
					{Array.from({ length: skeletonCount }).map((_, i) => (
						<div key={`sk-${i}`} className={styles.item}>
							<div className={styles.skeletonImage} />
							<div className={styles.skeletonName} />
						</div>
					))}
				</div>
			</>
		);
	}

	if (!isLoading && cards.length === 0) {
		return (
			<>
				{toggle}
				<div className={styles.empty}>
					<p>Aucune carte</p>
				</div>
			</>
		);
	}

	return (
		<>
			{toggle}
			<div className={gridClass} style={gridStyle}>
				{cards.map((card) => (
					<div
						key={card.id}
						className={[styles.item, onCardClick ? styles.itemClickable : undefined]
							.filter(Boolean)
							.join(' ')}
						onClick={onCardClick ? () => onCardClick(card) : undefined}
					>
						<div className={styles.imageWrapper}>
							<CardImage card={card} size="normal" />
							{renderOverlay?.(card)}
						</div>
						<p className={styles.cardName}>{card.name}</p>
					</div>
				))}
				{isLoadingMore &&
					Array.from({ length: skeletonCount }).map((_, i) => (
						<div key={`skmore-${i}`} className={styles.item}>
							<div className={styles.skeletonImage} />
							<div className={styles.skeletonName} />
						</div>
					))}
			</div>
			{hasMore && onLoadMore && <div ref={sentinelRef} />}
		</>
	);
}
