'use client';

import type { ScryfallCardSymbol } from '@/lib/scryfall/types/scryfall';
import type { DeckMeta } from '@/types/decks';
import type { DeckSummary } from '../../hooks/useDeckSummaries';
import { ManaSymbol } from '@/lib/scryfall/components/ManaSymbol/ManaSymbol';
import { MiniManaCurve } from './MiniManaCurve';
import styles from './DeckCard.module.css';

type Props = {
	deck: DeckMeta;
	summary?: DeckSummary;
	symbolMap: Record<string, ScryfallCardSymbol>;
	onClick: () => void;
	onDelete: () => void;
};

function formatRelativeDate(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHours = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 30) {
		const diffMonths = Math.floor(diffDays / 30);
		return diffMonths === 1 ? 'il y a 1 mois' : `il y a ${diffMonths} mois`;
	}
	if (diffDays > 0) {
		return diffDays === 1 ? 'il y a 1 jour' : `il y a ${diffDays} jours`;
	}
	if (diffHours > 0) {
		return diffHours === 1 ? 'il y a 1 heure' : `il y a ${diffHours} heures`;
	}
	if (diffMin > 0) {
		return diffMin === 1 ? 'il y a 1 min' : `il y a ${diffMin} min`;
	}
	return "à l'instant";
}

export function DeckCard({ deck, summary, symbolMap, onClick, onDelete }: Props) {
	const colors = summary?.colors;
	const hasManaCurve = summary?.manaCurve && Object.keys(summary.manaCurve).length > 0;

	return (
		<div
			role="button"
			tabIndex={0}
			className={styles.card}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter') onClick();
			}}
		>
			{/* ── Header bar ── */}
			<div className={styles.header}>
				<h3 className={styles.name}>{deck.name}</h3>
				<div className={styles.headerRight}>
					{colors && colors.length > 0 && (
						<div className={styles.colors}>
							{colors.map((color) => (
								<ManaSymbol key={color} symbol={`{${color}}`} symbolMap={symbolMap} />
							))}
						</div>
					)}
					<button
						type="button"
						className={styles.deleteBtn}
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						aria-label="Delete deck"
					>
						&times;
					</button>
				</div>
			</div>

			{/* ── Image zone ── */}
			<div className={styles.imageZone}>
				{summary?.artCropUrl && (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={summary.artCropUrl} alt="" className={styles.artCrop} />
						<div className={styles.artOverlay} />
					</>
				)}
				{hasManaCurve && (
					<div className={styles.curveOverlay}>
						<MiniManaCurve curve={summary!.manaCurve} />
					</div>
				)}
			</div>

			{/* ── Body zone ── */}
			<div className={styles.body}>
				{summary?.commanderName && <p className={styles.commanderName}>{summary.commanderName}</p>}
				<div className={styles.metaRow}>
					{deck.format && <span className={styles.format}>{deck.format}</span>}
					{summary && deck.format && summary.warningCount > 0 && (
						<span className={styles.warningBadge}>
							{summary.warningCount} warning{summary.warningCount !== 1 ? 's' : ''}
							<span className={styles.warningTooltip}>
								{summary.warnings.map((msg, i) => (
									<span key={i} className={styles.warningTooltipItem}>
										{msg}
									</span>
								))}
							</span>
						</span>
					)}
				</div>
				{deck.description && <p className={styles.description}>{deck.description}</p>}
				<div className={styles.footer}>
					{summary && summary.totalCards > 0 ? (
						<div className={styles.statsRow}>
							<span className={styles.stat}>
								{summary.targetCards !== null
									? `${summary.totalCards}/${summary.targetCards}`
									: summary.totalCards}{' '}
								cards
							</span>
							<span className={styles.statSep}>·</span>
							<span className={styles.stat}>{summary.landCount} lands</span>
							<span className={styles.statSep}>·</span>
							<span className={styles.stat}>{summary.averageCmc.toFixed(1)} CMC</span>
						</div>
					) : (
						<div />
					)}
					<span className={styles.updatedAt}>{formatRelativeDate(deck.updatedAt)}</span>
				</div>
			</div>
		</div>
	);
}
