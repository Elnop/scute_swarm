# Spec : CardList — Feature Sections + PrintsTab par langue

**Date :** 2026-03-28

## Contexte

`PrintsTab` affiche toutes les éditions d'une carte Magic, toutes langues confondues, via `CardList`. L'API Scryfall retourne intentionnellement les prints multilingues (`include_multilingual=true`). Sans groupement, les cartes japonaises, françaises, etc. sont mélangées dans la même liste.

L'objectif est d'ajouter à `CardList` une capacité de rendu par sections, puis d'utiliser cette feature dans `PrintsTab` pour séparer les prints par langue avec un header collapsible par langue.

## Décisions

- **API polymorphe** : `cards` passe de `AnyCard[]` à `AnyCard[] | CardListSection[]`. Détection du mode en runtime via type guard. Rétrocompatibilité totale.
- **Toggle unique** : un seul toggle grille/tableau, rendu au-dessus de toutes les sections.
- **Collapsible** : chaque section est réductible, toutes ouvertes par défaut.
- **Ordre des sections dans PrintsTab** : langue de la carte affichée en premier, reste trié alphabétiquement par nom de langue en français (`Intl.DisplayNames`).
- **Label** : `"Japonais (12)"` — nom localisé en français + compteur.

## Types

```ts
// Dans CardList.tsx
export interface CardListSection {
	label: string;
	cards: AnyCard[];
}

type CardListCards = AnyCard[] | CardListSection[];

function isSections(cards: CardListCards): cards is CardListSection[] {
	return cards.length > 0 && 'label' in (cards[0] as object);
}
```

`CardListProps.cards` devient `CardListCards`.

## Fichiers concernés

| Action | Fichier                                          | Rôle                                                                                   |
| ------ | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Modify | `src/components/ui/CardList/CardList.tsx`        | Type `CardListSection`, type guard, rendu sections                                     |
| Modify | `src/components/ui/CardList/CardList.module.css` | Classes `.sectionHeader`, `.sectionLabel`, `.sectionCount`, `.chevron`, `.sectionBody` |
| Modify | `src/components/cards/tabs/PrintsTab.tsx`        | Fonction `groupPrintsByLang`, passage de `sections` à `CardList`                       |

## Design — CardList.tsx

### Nouveau type et type guard

```ts
export interface CardListSection {
	label: string;
	cards: AnyCard[];
}

type CardListCards = AnyCard[] | CardListSection[];

function isSections(cards: CardListCards): cards is CardListSection[] {
	return cards.length > 0 && 'label' in (cards[0] as object);
}
```

### Props modifiée

```ts
export interface CardListProps {
	cards: CardListCards; // était AnyCard[]
	// ... reste identique
}
```

### State supplémentaire

```ts
const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

function toggleSection(label: string) {
	setCollapsedSections((prev) => {
		const next = new Set(prev);
		if (next.has(label)) next.delete(label);
		else next.add(label);
		return next;
	});
}
```

### Rendu en mode sections

Quand `isSections(cards)` est true :

1. Toggle grille/tableau rendu **une seule fois** en haut (identique à aujourd'hui)
2. Boucle sur `cards` (les sections) :
   - Header `<button>` : label + chevron (↓ ouvert, → fermé)
   - Si non-collapsed : rendu du contenu de la section dans le `viewMode` courant

Le rendu du contenu d'une section réutilise la logique existante de grille et de tableau (factorisation en fonctions internes `renderGrid(cards)` et `renderTable(cards)`).

**Cas tableau en mode sections :** chaque section a son propre `<div class="tableContainer"><table>…</table></div>` avec le même header de colonnes. Pas de tableau fusionné entre sections.

### État vide en mode sections

Si `cards` est un tableau vide, `isSections([])` retourne `false` (fallback sur mode flat) — comportement identique à aujourd'hui (retourne `null`).

### Rétrocompatibilité

Tous les usages existants passant `cards={someAnyCardArray}` fonctionnent sans modification. `isSections` retourne `false` pour `AnyCard[]` (les éléments n'ont pas de propriété `label`).

## Design — CardList.module.css

Classes à ajouter :

```css
.sectionHeader {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	padding: 10px 0 6px;
	background: none;
	border: none;
	border-bottom: 1px solid var(--border);
	cursor: pointer;
	color: var(--foreground);
	font-size: 14px;
	font-weight: 600;
	text-align: left;
	margin-top: 24px;
}

.sectionHeader:first-child {
	margin-top: 0;
}

.sectionCount {
	font-size: 12px;
	color: var(--text-muted);
	font-weight: 400;
}

.chevron {
	margin-left: auto;
	font-size: 12px;
	color: var(--text-muted);
	transition: transform 0.2s;
}

.chevronCollapsed {
	transform: rotate(-90deg);
}

.sectionBody {
	margin-top: 12px;
}
```

## Design — PrintsTab.tsx

### Fonction de groupement

```ts
const LANG_DISPLAY = new Intl.DisplayNames('fr', { type: 'language' });

function getLangLabel(lang: string, count: number): string {
	const name = LANG_DISPLAY.of(lang) ?? lang.toUpperCase();
	return `${name.charAt(0).toUpperCase() + name.slice(1)} (${count})`;
}

function groupPrintsByLang(
	prints: ScryfallCard[],
	currentLang: string
): { label: string; cards: ScryfallCard[] }[] {
	const map = new Map<string, ScryfallCard[]>();
	for (const print of prints) {
		const group = map.get(print.lang) ?? [];
		group.push(print);
		map.set(print.lang, group);
	}

	const entries = [...map.entries()];
	entries.sort(([a], [b]) => {
		if (a === currentLang) return -1;
		if (b === currentLang) return 1;
		return getLangLabel(a, 0).localeCompare(getLangLabel(b, 0), 'fr');
	});

	return entries.map(([lang, cards]) => ({
		label: getLangLabel(lang, cards.length),
		cards,
	}));
}
```

### Usage dans PrintsTab

```tsx
const sections = groupPrintsByLang(prints, card.lang);

<CardList
  cards={sections}
  isLoading={loading}
  pageSize={false}
  renderOverlay={...}
  tableColumns={[...]}
/>
```

`groupPrintsByLang` est définie localement dans `PrintsTab.tsx`, pas exportée.

## Vérification

1. Ouvrir une page carte → onglet "Prints & Prix"
2. Vérifier que les prints sont groupés par langue avec un header par langue
3. La langue de la carte affichée apparaît en premier
4. Cliquer un header → la section se réduit (chevron change d'orientation)
5. Cliquer à nouveau → la section s'ouvre
6. Toggle grille/tableau : un seul toggle affecte toutes les sections simultanément
7. Vérifier un usage existant de `CardList` (ex: page collection) — comportement identique à avant
8. `npm run check` passe sans erreur TypeScript/ESLint
