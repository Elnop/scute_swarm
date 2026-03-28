# PrintsTab → CardList Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le rendu manuel de `PrintsTab` par le composant `CardList` avec toggle grille/tableau, skeleton loading, et actions "Ajouter"/"Affiché" via `renderOverlay` et `tableColumns`.

**Architecture:** `PrintsTab` conserve son hook `useCardPrints` et son état `addingCard`. Le rendu manuel est remplacé par `<CardList>` qui gère grille/tableau nativement. Trois sous-composants locaux (`MiniThumb`, `SetInfo`, `PrintAction`) sont définis dans le même fichier pour les cellules custom.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules — `CardList` (`src/components/ui/CardList/CardList.tsx`), `useCardPrints` (`src/lib/scryfall/hooks/useCardPrints.ts`), `CopyEditModal`.

---

## File Map

| Action | Fichier                                          | Rôle                                                                               |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Modify | `src/components/cards/tabs/PrintsTab.tsx`        | Refactoring principal                                                              |
| Modify | `src/components/cards/tabs/PrintsTab.module.css` | Suppression classes obsolètes, conservation `.addBtn` / `.currentBadge` / `.thumb` |

---

### Task 1 : Réécrire PrintsTab.tsx

**Files:**

- Modify: `src/components/cards/tabs/PrintsTab.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat src/components/cards/tabs/PrintsTab.tsx
```

- [ ] **Step 2 : Remplacer le contenu complet du fichier**

Écrire le fichier suivant (remplace intégralement l'existant) :

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import type { CardEntry } from '@/types/cards';
import type { AnyCard } from '@/components/ui/CardList/CardList';
import { useCardPrints } from '@/lib/scryfall/hooks/useCardPrints';
import { CardList } from '@/components/ui/CardList/CardList';
import { CopyEditModal } from '@/lib/collection/CardCollectionModal/components/CopyEditModal/CopyEditModal';
import { useCollectionContext } from '@/lib/collection/context/CollectionContext';
import styles from './PrintsTab.module.css';

interface Props {
	card: ScryfallCard;
}

function MiniThumb({ card }: { card: ScryfallCard }): ReactNode {
	const src = card.image_uris?.small ?? card.card_faces?.[0]?.image_uris?.small;
	if (!src) return null;
	return <Image src={src} alt={card.name} width={40} height={56} className={styles.thumb} />;
}

function SetInfo({ card }: { card: ScryfallCard }): ReactNode {
	return (
		<>
			<div className={styles.printName}>{card.set_name}</div>
			<div className={styles.printMeta}>
				#{card.collector_number} · {card.rarity}
			</div>
		</>
	);
}

function PrintAction({
	print,
	currentId,
	onAdd,
}: {
	print: ScryfallCard;
	currentId: string;
	onAdd: (print: ScryfallCard) => void;
}): ReactNode {
	if (print.id === currentId) {
		return <span className={styles.currentBadge}>Affiché</span>;
	}
	return (
		<button
			type="button"
			className={styles.addBtn}
			onClick={(e) => {
				e.stopPropagation();
				onAdd(print);
			}}
		>
			Ajouter
		</button>
	);
}

export function PrintsTab({ card }: Props) {
	const { prints, loading } = useCardPrints(card.prints_search_uri);
	const [addingCard, setAddingCard] = useState<ScryfallCard | null>(null);
	const { addCard } = useCollectionContext();

	function handleAdd(print: ScryfallCard, entry: Partial<CardEntry>) {
		addCard(print, entry);
		setAddingCard(null);
	}

	return (
		<>
			<CardList
				cards={prints}
				isLoading={loading}
				pageSize={false}
				renderOverlay={(p: AnyCard) => (
					<PrintAction print={p as ScryfallCard} currentId={card.id} onAdd={setAddingCard} />
				)}
				tableColumns={[
					{
						key: 'image',
						label: '',
						render: (p: AnyCard) => <MiniThumb card={p as ScryfallCard} />,
					},
					{
						key: 'set',
						label: 'Édition',
						render: (p: AnyCard) => <SetInfo card={p as ScryfallCard} />,
					},
					{
						key: 'rarity',
						label: 'Rareté',
						render: (p: AnyCard) =>
							((p as ScryfallCard).rarity ?? '').charAt(0).toUpperCase() +
							((p as ScryfallCard).rarity ?? '').slice(1),
					},
					{
						key: 'action',
						label: '',
						render: (p: AnyCard) => (
							<PrintAction print={p as ScryfallCard} currentId={card.id} onAdd={setAddingCard} />
						),
					},
				]}
			/>

			{addingCard && (
				<CopyEditModal
					mode="add"
					scryfallCard={addingCard}
					onAdd={(selectedPrint, entry) => handleAdd(selectedPrint, entry)}
					onClose={() => setAddingCard(null)}
				/>
			)}
		</>
	);
}
```

- [ ] **Step 3 : Vérifier que `AnyCard` est bien exporté depuis CardList**

```bash
grep "export.*AnyCard" src/components/ui/CardList/CardList.tsx
```

Si `AnyCard` n'est pas exporté, remplacer l'import `AnyCard` par une définition locale dans `PrintsTab.tsx` :

```tsx
import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';
import type { Card } from '@/types/cards';
type AnyCard = ScryfallCard | Card;
```

Et supprimer la ligne `import type { AnyCard } from '@/components/ui/CardList/CardList';`.

- [ ] **Step 4 : Lancer le check TypeScript**

```bash
npm run check
```

Résultat attendu : aucune erreur TypeScript dans `PrintsTab.tsx`. Si des erreurs de type apparaissent sur les casts `as ScryfallCard`, vérifier que `ScryfallCard` possède bien les propriétés `image_uris`, `card_faces`, `set_name`, `collector_number`, `rarity`, `id`.

---

### Task 2 : Nettoyer PrintsTab.module.css

**Files:**

- Modify: `src/components/cards/tabs/PrintsTab.module.css`

- [ ] **Step 1 : Remplacer le contenu du CSS**

Écrire le fichier suivant (supprime les classes obsolètes, conserve uniquement ce qui est utilisé) :

```css
.thumb {
	width: 40px;
	height: 56px;
	object-fit: contain;
	border-radius: 3px;
	flex-shrink: 0;
	background: var(--background);
}

.printName {
	font-size: 14px;
	font-weight: 500;
	color: var(--foreground);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.printMeta {
	font-size: 12px;
	color: var(--text-muted);
	margin-top: 2px;
}

.addBtn {
	flex-shrink: 0;
	font-size: 13px;
	padding: 6px 12px;
	border-radius: 6px;
	background: var(--primary);
	color: #fff;
	border: none;
	cursor: pointer;
	transition: opacity 0.15s;
}

.addBtn:hover {
	opacity: 0.85;
}

.currentBadge {
	flex-shrink: 0;
	font-size: 11px;
	padding: 3px 8px;
	border-radius: 10px;
	background: var(--primary);
	color: #fff;
}
```

- [ ] **Step 2 : Lancer le check**

```bash
npm run check
```

Résultat attendu : aucune erreur ESLint (classes CSS inutilisées non signalées par ESLint dans ce projet).

---

### Task 3 : Commit et vérification finale

**Files:** aucun fichier supplémentaire

- [ ] **Step 1 : Vérifier visuellement dans le navigateur**

Démarrer le dev server si ce n'est pas déjà fait :

```bash
npm run dev
```

Naviguer vers une page carte (ex. `/card/<id>`) → onglet "Prints".

Checklist :

- [ ] Toggle "Grille" / "Tableau" visible et fonctionnel
- [ ] Vue grille : cartes affichées avec overlay "Ajouter" ou badge "Affiché" sur l'édition courante
- [ ] Vue tableau : 4 colonnes (image, édition, rareté, action)
- [ ] Cliquer "Ajouter" → `CopyEditModal` s'ouvre
- [ ] État de chargement : skeleton loaders visibles (si réseau lent, throttle dans DevTools)
- [ ] Aucun prix visible (USD/EUR/foil supprimés)

- [ ] **Step 2 : Lancer le check final**

```bash
npm run check
```

Résultat attendu : `✓ No errors`

- [ ] **Step 3 : Commiter**

```bash
git add src/components/cards/tabs/PrintsTab.tsx src/components/cards/tabs/PrintsTab.module.css
git commit -m "refactor(prints): replace manual render with CardList component"
```
