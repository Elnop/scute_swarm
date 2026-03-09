'use client';

import { createContext, useContext } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useImport } from '@/hooks/useImport';

type ImportContextValue = ReturnType<typeof useImport>;

const ImportContext = createContext<ImportContextValue | null>(null);

export function ImportProvider({ children }: { children: React.ReactNode }) {
	const { importCards } = useCollection();
	const importValue = useImport(importCards);

	return <ImportContext value={importValue}>{children}</ImportContext>;
}

export function useImportContext(): ImportContextValue {
	const ctx = useContext(ImportContext);
	if (!ctx) {
		throw new Error('useImportContext must be used within an ImportProvider');
	}
	return ctx;
}
