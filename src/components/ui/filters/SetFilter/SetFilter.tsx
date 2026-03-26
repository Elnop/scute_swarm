'use client';

import { useState, useRef, useEffect } from 'react';
import type { ScryfallSet } from '@/lib/scryfall/types/scryfall';
import styles from './SetFilter.module.css';

export interface SetFilterProps {
	value: string;
	onChange: (value: string) => void;
	sets: ScryfallSet[];
	isLoading?: boolean;
}

export function SetFilter({ value, onChange, sets, isLoading }: SetFilterProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedSet = sets.find((s) => s.code === value);

	const filtered = search
		? sets.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
		: sets;

	useEffect(() => {
		if (!open) return;
		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open]);

	function handleSelect(code: string) {
		onChange(code);
		setOpen(false);
		setSearch('');
	}

	return (
		<div className={styles.filterGroup} ref={containerRef}>
			<label className={styles.label}>Set</label>
			<button
				type="button"
				className={styles.trigger}
				onClick={() => !isLoading && setOpen((v) => !v)}
				disabled={isLoading}
				aria-haspopup="listbox"
				aria-expanded={open}
			>
				{selectedSet ? (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={selectedSet.icon_svg_uri} alt="" className={styles.setIcon} />
						<span className={styles.triggerText}>{selectedSet.name}</span>
					</>
				) : (
					<span className={styles.triggerText}>All Sets</span>
				)}
				<svg
					className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>

			{open && (
				<div className={styles.dropdown} role="listbox">
					<div className={styles.searchWrapper}>
						<input
							type="text"
							className={styles.searchInput}
							placeholder="Search sets..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
					<ul className={styles.list}>
						<li
							className={`${styles.option} ${!value ? styles.optionSelected : ''}`}
							role="option"
							aria-selected={!value}
							onClick={() => handleSelect('')}
						>
							<span className={styles.optionText}>All Sets</span>
						</li>
						{filtered.map((set) => (
							<li
								key={set.code}
								className={`${styles.option} ${value === set.code ? styles.optionSelected : ''}`}
								role="option"
								aria-selected={value === set.code}
								onClick={() => handleSelect(set.code)}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={set.icon_svg_uri} alt="" className={styles.setIcon} />
								<span className={styles.optionText}>{set.name}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
