// components/editable-habit-card.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import ScrollOnExpand from '../hooks/scroll-on-expand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '@/styles/goal-card.module.css';
import {
	faTrashCan,
	faPencil,
	faFloppyDisk,
	faXmarkCircle,
	faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import ColorSquares from './color-squares';
import { useUser } from '@clerk/nextjs'; // Import useUser
import ConfirmationDialog from './confirmation-dialog'; // Import ConfirmationDialog
import Portal from './portal'; // Import Portal for robust modal display

/**
 * EditableHabitCard component for user-created habits.
 * Shows title and description when expanded,
 * supports editing (title, description, color),
 * deleting, and adding to goals list.
 */
export default function EditableHabitCard({
	habit,
	onSelect,
	onDelete,
	onUpdateHabit,
	isExpanded,
	onExpand,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(habit.title);
	const [description, setDescription] = useState(habit.description);
	const [color, setColor] = useState(habit.color);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // New state for delete confirmation

	const cardRef = ScrollOnExpand(isExpanded);
	const titleRef = useRef(null);
	const { isSignedIn } = useUser();

	// Reset state when habit or expanded changes
	useEffect(() => {
		setTitle(habit.title);
		setDescription(habit.description);
		setColor(habit.color);
		setIsEditing(false);
		setShowDeleteConfirm(false); // Reset confirmation dialog state
	}, [habit, isExpanded]);

	// Focus input on edit
	useEffect(() => {
		if (isEditing && titleRef.current) titleRef.current.focus();
	}, [isEditing]);

	const handleSave = (e) => {
		e.stopPropagation();
		if (!title.trim()) {
			toast.error('Title cannot be empty');
			return;
		}
		onUpdateHabit(habit.id, {
			...habit,
			title: title.trim(),
			description: description.trim(),
			color,
		});
		setIsEditing(false);
	};

	const handleCancel = (e) => {
		e.stopPropagation();
		setIsEditing(false);
		setTitle(habit.title);
		setDescription(habit.description);
		setColor(habit.color);
	};

	const handleAddToGoals = (e, habit) => {
		if (!e || !habit) {
			console.error('Missing parameters in handleAddToGoals:', {
				e,
				habit,
			});
			return;
		}

		e.stopPropagation(); // Ensure event object exists before calling this
		if (!isSignedIn) {
			// Check if user is signed in
			toast.error('You need to sign in before adding goals.');
			return;
		}
		onSelect?.(habit); // Pass the valid habit object
		return habit;
	};
	const test = (e) => {
		console.log('Test function called with event:', e);
	};
	// New: Request confirmation for deletion
	const requestDeleteConfirmation = (e) => {
		console.log('Requesting delete confirmation for habit:', habit);
		e.stopPropagation(); // Prevent card click behavior
		setShowDeleteConfirm(true); // Show the confirmation dialog
	};

	// New: Confirm deletion
	const confirmDelete = () => {
		onDelete(habit.id); // Call the onDelete prop with habit.id
		setShowDeleteConfirm(false); // Close the dialog
	};

	// New: Cancel deletion
	const cancelDelete = () => {
		setShowDeleteConfirm(false); // Close the dialog
	};

	return (
		<div
			ref={cardRef}
			className={`card rounded-lg p-4 transition-all relative ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0'
			}`}
			style={{ backgroundColor: isEditing ? color : habit.color }}
			onClick={() => !isEditing && onExpand()}
		>
			{isEditing ? (
				<div className="relative z-10">
					<input
						ref={titleRef}
						className="w-full p-1 mb-2 rounded bg-gray-100 text-black"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onClick={(e) => e.stopPropagation()}
					/>
					<textarea
						className="w-full p-1 mb-2 rounded bg-gray-100 text-black"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						onClick={(e) => e.stopPropagation()}
					/>
					<ColorSquares selectedColor={color} setColor={setColor} />
				</div>
			) : (
				<>
					<h2 className="text-lg font-bold text-gray-800">
						{habit.title}
					</h2>
					{isExpanded && (
						<p className="mt-1 text-gray-600 text-sm">
							{habit.description}
						</p>
					)}
				</>
			)}

			{isExpanded && (
				<div className="flex justify-end items-center gap-2 mt-auto z-20">
					{isEditing ? (
						<>
							<FontAwesomeIcon
								icon={faFloppyDisk}
								className={styles.goalCardIcon}
								onClick={handleSave}
								title="Save"
							/>
							<FontAwesomeIcon
								icon={faXmarkCircle}
								className={styles.goalCardIcon}
								onClick={handleCancel}
								title="Cancel"
							/>
						</>
					) : (
						<FontAwesomeIcon
							icon={faPencil}
							className={styles.goalCardIcon}
							onClick={(e) => {
								e.stopPropagation();
								setIsEditing(true);
							}}
							title="Edit"
						/>
					)}
					<FontAwesomeIcon
						icon={faTrashCan}
						className={styles.goalCardIcon}
						onClick={requestDeleteConfirmation} //requestDeleteConfirmation} // <--- THIS IS THE CRUCIAL CHANGE
						title="Delete"
					/>

					{isExpanded &&
						!isEditing && ( // This nested `isExpanded` check might be redundant if the parent div already checks it
							<div className="flex flex-col h-full rounded-lg">
								<div
									className={`${styles.addButtonContainer} flex flex-row justify-end items-end gap-2`}
								>
									<button
										className={`addButton`}
										onClick={(e) => {
											e.stopPropagation(); // Prevent card collapse
											const habitData = handleAddToGoals(
												e,
												habit
											); // Call the function
											// Pass the actual data
										}}
									>
										Add
									</button>
								</div>
							</div>
						)}
				</div>
			)}

			{/* Confirmation Dialog - NOW WRAPPED IN A PORTAL */}
			{showDeleteConfirm && ( // Only render Portal if dialog is open
				<Portal>
					<ConfirmationDialog
						isOpen={showDeleteConfirm}
						title="Confirm Habit Deletion"
						message={`Are you sure you want to delete "${habit.title}"? This action cannot be undone.`}
						onConfirm={confirmDelete}
						onCancel={cancelDelete}
					/>
				</Portal>
			)}
		</div>
	);
}
