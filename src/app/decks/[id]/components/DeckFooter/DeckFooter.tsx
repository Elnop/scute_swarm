'use client';

import type { DeckStats } from '@/lib/deck/utils/deck-stats';
import type { DeckFormat } from '@/types/decks';
import { getFormatRules } from '@/lib/deck/utils/format-rules';
import styles from './DeckFooter.module.css';

type Props = {
	stats: DeckStats;
	format: DeckFormat | null;
};

export function DeckFooter({ stats, format }: Props) {
	const rules = format ? getFormatRules(format) : null;
	const target = rules ? rules.minMainboard + rules.commanderCount : null;
	const current = stats.mainboardCount + stats.commanderCount;
	const isValid = target !== null && current >= target;

	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				{target !== null ? (
					<div className={`${styles.item} ${isValid ? styles.valid : styles.invalid}`}>
						<span className={styles.value}>
							{current}/{target}
						</span>
						<span className={styles.label}>Cards</span>
					</div>
				) : (
					<div className={styles.item}>
						<span className={styles.value}>{stats.totalCards}</span>
						<span className={styles.label}>Total</span>
					</div>
				)}

				<div className={styles.separator} />

				<div className={styles.item}>
					<span className={styles.value}>{stats.mainboardCount}</span>
					<span className={styles.label}>Main</span>
				</div>

				{stats.sideboardCount > 0 && (
					<>
						<div className={styles.separator} />
						<div className={styles.item}>
							<span className={styles.value}>{stats.sideboardCount}</span>
							<span className={styles.label}>Side</span>
						</div>
					</>
				)}

				{stats.commanderCount > 0 && (
					<>
						<div className={styles.separator} />
						<div className={styles.item}>
							<span className={styles.value}>{stats.commanderCount}</span>
							<span className={styles.label}>Cmdr</span>
						</div>
					</>
				)}

				<div className={styles.separator} />

				<div className={styles.item}>
					<span className={styles.value}>{stats.averageCmc.toFixed(1)}</span>
					<span className={styles.label}>CMC</span>
				</div>
			</div>
		</footer>
	);
}
