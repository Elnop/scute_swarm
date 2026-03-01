'use client';

import Link from 'next/link';
import { useCollection } from '@/hooks/useCollection';
import { CollectionGrid } from '@/components/collection/CollectionGrid';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function CollectionPage() {
	const { entries, isLoaded, decrementCard, getStats } = useCollection();
	const stats = getStats();

	if (!isLoaded) {
		return (
			<div className={styles.page}>
				<header className={styles.header}>
					<Link href="/" className={styles.logo}>
						MTG Snap
					</Link>
					<nav className={styles.nav}>
						<Link href="/search" className={styles.navLink}>
							Search
						</Link>
					</nav>
				</header>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<Link href="/" className={styles.logo}>
					MTG Snap
				</Link>
				<nav className={styles.nav}>
					<Link href="/search" className={styles.navLink}>
						Search
					</Link>
				</nav>
			</header>

			<main className={styles.main}>
				<div className={styles.titleSection}>
					<h1 className={styles.title}>My Collection</h1>
					{entries.length > 0 && (
						<p className={styles.statsLine}>
							{stats.totalCards} card{stats.totalCards !== 1 ? 's' : ''} &middot;{' '}
							{stats.uniqueCards} unique &middot; {stats.setCount} set
							{stats.setCount !== 1 ? 's' : ''}
						</p>
					)}
				</div>

				{entries.length === 0 ? (
					<div className={styles.emptyState}>
						<h2>Your collection is empty</h2>
						<p>Search for cards and add them to your collection.</p>
						<Link href="/search">
							<Button variant="primary">Search for cards</Button>
						</Link>
					</div>
				) : (
					<CollectionGrid entries={entries} onDecrement={decrementCard} />
				)}
			</main>
		</div>
	);
}
