// Shared rate limiter for Scryfall API requests (100ms between requests)
// Uses promise chaining to guarantee sequential spacing even under concurrent load.

const REQUEST_DELAY = 100; // ms
let queue = Promise.resolve();

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function enforceRateLimit(): Promise<void> {
	queue = queue.then(() => delay(REQUEST_DELAY));
	return queue;
}
