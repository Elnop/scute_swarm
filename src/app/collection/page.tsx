'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionCards } from '@/hooks/useCollectionCards';
import { useImportContext } from '@/contexts/ImportContext';
import { useCollectionFilters, defaultCollectionFilters } from '@/hooks/useCollectionFilters';
import type { CollectionFilters } from '@/hooks/useCollectionFilters';
import { useScryfallSets } from '@/lib/scryfall/hooks/useScryfallSets';
import { serializeToMoxfieldCSV, downloadCSV } from '@/lib/moxfield/serialize';
import { CollectionGrid } from '@/components/collection/CollectionGrid';
import { CollectionFiltersAside } from '@/components/collection/CollectionFiltersAside';
import { ImportPreviewModal } from '@/components/collection/ImportPreviewModal';
import { CardCollectionModal } from '@/components/collection/CardCollectionModal';
import { Button } from '@/components/ui/Button';
import { putCardsInCache } from '@/lib/card-cache';
import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import { SCRYFALL_CODE_TO_LANGUAGE } from '@/lib/mtg/languages';
import type { Card, CollectionEntry, CollectionStats } from '@/types/card';
import styles from './page.module.css';

function computeStats(cards: Card[]): CollectionStats {
	const sets = new Set<string>();
	const rarityDistribution: Record<string, number> = {};
	let totalCards = 0;

	for (const card of cards) {
		const qty = card.quantity;
		totalCards += qty;
		sets.add(card.set);
		rarityDistribution[card.rarity] = (rarityDistribution[card.rarity] ?? 0) + qty;
	}

	return {
		totalCards,
		uniqueCards: cards.length,
		uniqueByEdition: cards.length,
		setCount: sets.size,
		rarityDistribution,
	};
}

export default function CollectionPage() {
	const {
		entries,
		isLoaded,
		decrementCard,
		removeCard,
		updateEntry,
		changePrint,
		clearCollection,
	} = useCollection();
	const { cards, isLoading: isHydrating, totalExpected } = useCollectionCards(entries);
	const {
		status,
		progress,
		preview,
		fetchedCards,
		isLoadingPreview,
		openModal,
		selectFile,
		submitText,
		changeFormat,
		confirm: confirmImport,
		cancel,
		reset,
		updateRow,
		removeRow,
		formatRegistry,
	} = useImportContext();
	const { sets, isLoading: setsLoading } = useScryfallSets();

	const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
	const [pendingScryfallCard, setPendingScryfallCard] = useState<ScryfallCard | null>(null);

	const cardFromCollection = selectedCardId
		? (cards.find((c) => c.id === selectedCardId) ?? null)
		: null;
	const selectedCard: Card | null = (() => {
		if (!selectedCardId) return null;
		if (cardFromCollection) return cardFromCollection;
		// After a print change, useCollectionCards hasn't re-hydrated yet — use the
		// ScryfallCard we already have from the picker, merged with the collection entry.
		if (pendingScryfallCard && pendingScryfallCard.id === selectedCardId) {
			const entry = entries.find((e) => e.id === selectedCardId);
			if (entry) return { ...pendingScryfallCard, ...entry };
		}
		return null;
	})();
	const [filters, setFilters] = useState<CollectionFilters>(defaultCollectionFilters);
	const filteredCards = useCollectionFilters(cards, filters);

	const stats = computeStats(filteredCards);

	const activeFilterCount =
		filters.colors.length +
		(filters.type ? 1 : 0) +
		(filters.set ? 1 : 0) +
		(filters.order !== 'name' || filters.dir !== 'auto' ? 1 : 0) +
		filters.rarities.length +
		(filters.oracleText ? 1 : 0) +
		(filters.cmc ? 1 : 0) +
		(filters.name ? 1 : 0);

	function handleClearCollection() {
		if (confirm('Effacer toute la collection ? Cette action est irréversible.')) {
			clearCollection();
		}
	}

	function handleExport() {
		downloadCSV(serializeToMoxfieldCSV(cards), 'my-collection.csv');
	}

	if (!isLoaded) {
		return <div className={styles.page} />;
	}

	const isImporting = status === 'fetching' || status === 'merging';
	const isBusy = status === 'previewing' || isImporting;

	return (
		<div className={styles.page}>
			<div className={styles.layout}>
				<CollectionFiltersAside
					filters={filters}
					onChange={setFilters}
					sets={sets}
					setsLoading={setsLoading}
					activeFilterCount={activeFilterCount}
				/>

				<main className={styles.main}>
					<div className={styles.titleSection}>
						<div className={styles.titleLeft}>
							<h1 className={styles.title}>My Collection</h1>
							{entries.length > 0 && !isHydrating && (
								<p className={styles.statsLine}>
									{stats.totalCards} card{stats.totalCards !== 1 ? 's' : ''} &middot;{' '}
									{stats.uniqueCards} unique &middot; {stats.setCount} set
									{stats.setCount !== 1 ? 's' : ''}
								</p>
							)}
						</div>
						<div className={styles.actions}>
							{entries.length > 0 && (
								<>
									<Button
										variant="secondary"
										onClick={handleExport}
										disabled={isBusy || isHydrating}
									>
										Export CSV
									</Button>
									<Button variant="danger" onClick={handleClearCollection} disabled={isBusy}>
										Clear Collection
									</Button>
								</>
							)}
							<Button variant="primary" onClick={openModal} disabled={isBusy}>
								{isBusy ? 'Importing…' : 'Import'}
							</Button>
						</div>
					</div>

					{isImporting ? (
						<div className={styles.importingOverlay}>
							<div className={styles.spinner} />
							<p className={styles.importingText}>
								{status === 'fetching'
									? `Récupération des cartes…${progress.total > 0 ? ` (${progress.current}/${progress.total})` : ''}`
									: 'Ajout à la collection…'}
							</p>
						</div>
					) : entries.length === 0 ? (
						<div className={styles.emptyState}>
							<h2>Your collection is empty</h2>
							<p>Search for cards or import a collection file to get started.</p>
							<Link href="/search">
								<Button variant="primary">Search for cards</Button>
							</Link>
						</div>
					) : (
						<CollectionGrid
							entries={filteredCards}
							onDecrement={decrementCard}
							onCardClick={(card) => setSelectedCardId(card.id)}
							isLoading={isHydrating}
							totalExpected={totalExpected}
						/>
					)}
				</main>
			</div>

			<ImportPreviewModal
				isOpen={status === 'selecting' || status === 'previewing'}
				preview={preview}
				formatRegistry={formatRegistry}
				fetchedCards={fetchedCards}
				isLoadingPreview={isLoadingPreview}
				sets={sets}
				setsLoading={setsLoading}
				onFileSelect={selectFile}
				onTextSubmit={submitText}
				onChangeFormat={changeFormat}
				onConfirm={async () => {
					await confirmImport();
					reset();
				}}
				onCancel={cancel}
				onUpdateRow={updateRow}
				onRemoveRow={removeRow}
			/>
			<CardCollectionModal
				card={selectedCard}
				onClose={() => {
					setSelectedCardId(null);
					setPendingScryfallCard(null);
				}}
				onSave={(cardId, updates: Partial<CollectionEntry>) => {
					updateEntry(cardId, updates);
				}}
				onRemove={(cardId) => {
					removeCard(cardId);
					setSelectedCardId(null);
					setPendingScryfallCard(null);
				}}
				onChangePrint={(oldCardId, newCard) => {
					void putCardsInCache([newCard]);
					setPendingScryfallCard(newCard);
					changePrint(oldCardId, newCard.id);
					if (newCard.lang) {
						const language = SCRYFALL_CODE_TO_LANGUAGE[newCard.lang];
						updateEntry(newCard.id, { language });
					}
					setSelectedCardId(newCard.id);
				}}
			/>
		</div>
	);
}
