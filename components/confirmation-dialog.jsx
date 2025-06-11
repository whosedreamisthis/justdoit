// components/ConfirmationDialog.jsx
import React from 'react';
import styles from '@/styles/goal-card.module.css';

export default function ConfirmationDialog({
	title,
	message,
	onConfirm,
	onCancel,
	isOpen,
}) {
	// Only render if isOpen is true
	if (!isOpen) return null;

	return (
		// This div is the full-screen overlay, must be fixed position
		<div
			className={styles.modalOverlay}
			data-is-open={isOpen ? 'true' : 'false'}
		>
			{/* This div is the actual popup box, centered within the overlay */}
			<div className={styles.modalContent}>
				<h3 className={styles.modalTitle}>{title}</h3>
				<p className={styles.modalMessage}>{message}</p>
				<div className={styles.modalActions}>
					<button
						onClick={onConfirm}
						className={`${styles.modalButton} ${styles.confirmButton}`}
					>
						Confirm
					</button>
					<button
						onClick={onCancel}
						className={`${styles.modalButton} ${styles.cancelButton}`}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
