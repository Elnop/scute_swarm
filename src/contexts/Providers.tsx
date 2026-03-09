'use client';

import { ImportProvider } from './ImportContext';

export function Providers({ children }: { children: React.ReactNode }) {
	return <ImportProvider>{children}</ImportProvider>;
}
