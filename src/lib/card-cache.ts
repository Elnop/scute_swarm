// Persistent IndexedDB cache for ScryfallCard data.
// Silently falls back to no-op if IndexedDB is unavailable (private mode, etc.).

import type { ScryfallCard } from '@/lib/scryfall/types/scryfall';

interface CachedCard {
	id: string; // ScryfallUUID — keyPath of the object store
	data: ScryfallCard;
	cachedAt: number; // Date.now()
}

const DB_NAME = 'mtg-snap-cache';
const STORE_NAME = 'scryfall-cards';
const TTL_MS = 86_400_000; // 24 hours

// Lazily opened DB promise — only one IDBDatabase instance across the module lifetime
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
	if (dbPromise) return dbPromise;

	dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};

		request.onsuccess = () => {
			const db = request.result;
			// Purge expired entries asynchronously — don't block the open
			void purgeExpired(db);
			resolve(db);
		};

		request.onerror = () => reject(request.error);
		request.onblocked = () => reject(new Error('IndexedDB blocked'));
	});

	// If the DB open fails, clear the cached promise so subsequent calls retry
	dbPromise.catch(() => {
		dbPromise = null;
	});

	return dbPromise;
}

function purgeExpired(db: IDBDatabase): Promise<void> {
	return new Promise<void>((resolve) => {
		try {
			const tx = db.transaction(STORE_NAME, 'readwrite');
			const store = tx.objectStore(STORE_NAME);
			const request = store.openCursor();
			const cutoff = Date.now() - TTL_MS;

			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor) {
					resolve();
					return;
				}
				const entry = cursor.value as CachedCard;
				if (entry.cachedAt < cutoff) {
					cursor.delete();
				}
				cursor.continue();
			};

			request.onerror = () => resolve(); // non-critical, ignore errors
			tx.oncomplete = () => resolve();
		} catch {
			resolve();
		}
	});
}

/** Read a batch of cards from the cache. Returns a Map of id → ScryfallCard for hits only. */
export async function getCardsFromCache(ids: string[]): Promise<Map<string, ScryfallCard>> {
	const result = new Map<string, ScryfallCard>();
	if (ids.length === 0) return result;

	try {
		const db = await openDB();
		return new Promise<Map<string, ScryfallCard>>((resolve) => {
			try {
				const tx = db.transaction(STORE_NAME, 'readonly');
				const store = tx.objectStore(STORE_NAME);
				const cutoff = Date.now() - TTL_MS;
				let pending = ids.length;

				for (const id of ids) {
					const req = store.get(id);
					req.onsuccess = () => {
						const entry = req.result as CachedCard | undefined;
						if (entry && entry.cachedAt >= cutoff) {
							result.set(id, entry.data);
						}
						pending--;
						if (pending === 0) resolve(result);
					};
					req.onerror = () => {
						pending--;
						if (pending === 0) resolve(result);
					};
				}
			} catch {
				resolve(result);
			}
		});
	} catch {
		// IndexedDB unavailable — return empty map (fallback to network)
		return result;
	}
}

/** Write a batch of ScryfallCards to the cache. */
export async function putCardsInCache(cards: ScryfallCard[]): Promise<void> {
	if (cards.length === 0) return;

	try {
		const db = await openDB();
		return new Promise<void>((resolve) => {
			try {
				const tx = db.transaction(STORE_NAME, 'readwrite');
				const store = tx.objectStore(STORE_NAME);
				const now = Date.now();

				for (const card of cards) {
					const entry: CachedCard = { id: card.id, data: card, cachedAt: now };
					store.put(entry);
				}

				tx.oncomplete = () => resolve();
				tx.onerror = () => resolve(); // non-critical
			} catch {
				resolve();
			}
		});
	} catch {
		// IndexedDB unavailable — silently skip
	}
}
