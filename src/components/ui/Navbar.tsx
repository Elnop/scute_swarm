'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import { useImportContext } from '@/contexts/ImportContext';
import styles from './Navbar.module.css';

export function Navbar() {
	const pathname = usePathname();
	const { entries } = useCollection();
	const { status } = useImportContext();

	const totalCollectionCards = entries.reduce((sum, e) => sum + e.quantity, 0);
	const isImporting = status === 'fetching' || status === 'merging';

	return (
		<header className={styles.navbar}>
			<Link href="/" className={styles.logo}>
				MTG Snap
			</Link>
			<nav className={styles.nav}>
				<Link
					href="/search"
					className={`${styles.navLink} ${pathname === '/search' ? styles.navLinkActive : ''}`}
				>
					Search
				</Link>
				<Link
					href="/collection"
					className={`${styles.navLink} ${pathname === '/collection' ? styles.navLinkActive : ''}`}
				>
					Collection
					{isImporting && <span className={styles.spinner} />}
					{totalCollectionCards > 0 && <span className={styles.badge}>{totalCollectionCards}</span>}
				</Link>
			</nav>
		</header>
	);
}
