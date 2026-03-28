# Spec : Rubrique Prints — Migration vers CardList

**Date :** 2026-03-28

## Contexte

La rubrique "Prints" de la page carte (`PrintsTab`) affiche toutes les éditions d'une carte Magic via un rendu manuel en lignes horizontales. Ce rendu est isolé et n'utilise pas le composant `CardList` déjà présent dans l'app, qui offre un toggle grille/tableau natif, des skeleton loaders, et une API `renderOverlay`/`tableColumns` pour les actions custom. L'objectif est de migrer `PrintsTab` vers `CardList` pour gagner en cohérence visuelle et supprimer du code dupliqué.

## Décisions

- **Pas de prix** : les colonnes USD/EUR/foil sont supprimées.
- **Toggle grille/tableau** : les deux modes sont disponibles via le toggle natif de `CardList`.
- **Actions conservées** : badge "Affiché" pour l'édition courante, bouton "Ajouter" pour les autres (déclenche `CopyEditModal`).

## Fichiers concernés

- `src/components/cards/tabs/PrintsTab.tsx` — refactoring principal
- `src/components/cards/tabs/PrintsTab.module.css` — nettoyage des classes obsolètes

## Design

### PrintsTab.tsx

Le composant conserve :

- `useCardPrints` pour la récupération des données
- `useState<ScryfallCard | null>` pour `addingCard`
- `useCollectionContext()` pour `addCard`
- `CopyEditModal` pour l'ajout à la collection

Le rendu manuel (boucle sur `prints`) est remplacé par `<CardList>` avec :

```tsx
<CardList
	cards={prints}
	isLoading={loading}
	pageSize={false}
	renderOverlay={(print) => (
		<PrintAction print={print as ScryfallCard} currentId={card.id} onAdd={setAddingCard} />
	)}
	tableColumns={[
		{ key: 'image', label: '', render: (p) => <MiniThumb card={p as ScryfallCard} /> },
		{ key: 'set', label: 'Édition', render: (p) => <SetInfo card={p as ScryfallCard} /> },
		{ key: 'rarity', label: 'Rareté', render: (p) => capitalize((p as ScryfallCard).rarity) },
		{
			key: 'action',
			label: '',
			render: (p) => (
				<PrintAction print={p as ScryfallCard} currentId={card.id} onAdd={setAddingCard} />
			),
		},
	]}
/>
```

`PrintAction`, `MiniThumb`, `SetInfo` sont des sous-composants locaux dans le même fichier (pas de nouveaux fichiers).

### PrintsTab.module.css

Classes à **supprimer** : `.container`, `.loading`, `.empty`, `.printRow`, `.thumb`, `.printInfo`, `.printName`, `.printMeta`, `.prices`, `.priceItem`, `.priceLabel`, `.priceValue`, et le media query associé.

Classes à **conserver** (réutilisées dans les sous-composants locaux) :

- `.addBtn` — bouton "Ajouter"
- `.currentBadge` — badge "Affiché"

Nouvelles classes à **ajouter** si besoin (miniature en tableau) :

- `.thumb` — optionnel, peut rester pour le rendu en tableau (40×56px)

## Compatibilité de types

`useCardPrints` retourne `ScryfallCard[]`. `CardList` attend `AnyCard[]` (= `ScryfallCard | Card`). Aucune transformation nécessaire — `ScryfallCard` est assignable à `AnyCard`.

## Vérification

1. Ouvrir une page carte (ex. `/card/[id]`) et naviguer vers l'onglet "Prints"
2. Vérifier que le toggle grille/tableau fonctionne
3. En grille : cliquer "Ajouter" sur une édition → `CopyEditModal` s'ouvre
4. En grille : l'édition courante affiche le badge "Affiché" sans bouton
5. En tableau : les 4 colonnes sont présentes (image, édition, rareté, action)
6. État de chargement : skeleton loaders visibles pendant le fetch
7. `npm run check` passe sans erreur TypeScript/ESLint
