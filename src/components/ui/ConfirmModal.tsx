'use client';

import styles from './ConfirmModal.module.css';

interface Props {
	message: React.ReactNode;
	confirmLabel?: string;
	onConfirm: () => void;
	onClose: () => void;
}

export function ConfirmModal({ message, confirmLabel = 'Confirm', onConfirm, onClose }: Props) {
	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
				<p className={styles.message}>{message}</p>
				<div className={styles.actions}>
					<button type="button" className={styles.cancelBtn} onClick={onClose}>
						Cancel
					</button>
					<button type="button" className={styles.confirmBtn} onClick={onConfirm}>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
