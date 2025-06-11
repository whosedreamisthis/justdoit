// minimizable-goal-card.jsx
import { useState, useEffect, useRef } from 'react';
import ScrollOnExpand from '../hooks/scroll-on-expand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrashCan,
	faPencil,
	faSquarePlus,
	faSquareCheck,
	faFloppyDisk,
	faXmarkCircle,
	faEllipsis,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import ColorSquares from './color-squares';
import styles from '@/styles/goal-card.module.css';

export default function MinimizableGoalCard({
	goal,
	onEdit, // Not used in this component, but keeping for reference if needed
	isExpanded,
	onExpand, // This is the function to expand/collapse the card
	onDelete,
	onUpdateGoal, // This is the function to update the goal object (e.g., progress, title, description, color)
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(goal.title);
	const [editedDescription, setEditedDescription] = useState(
		goal.description || ''
	);
	const [editedColor, setEditedColor] = useState(goal.color);

	const titleInputRef = useRef(null);
	const cardRef = ScrollOnExpand(isExpanded); // Hook for scrolling card into view when expanded

	// Effect to reset edit state and inputs when goal or expansion state changes
	useEffect(() => {
		setEditedTitle(goal.title);
		setEditedDescription(goal.description || '');
		setEditedColor(goal.color);
		setIsEditing(false); // Reset editing state
	}, [goal.id, goal.title, goal.description, goal.color, isExpanded]);

	// Effect to focus title input when editing mode is enabled
	useEffect(() => {
		if (isEditing && titleInputRef.current) {
			titleInputRef.current.focus();
			// Set cursor at the beginning for better UX when starting edit
			titleInputRef.current.setSelectionRange(0, 0);
		}
	}, [isEditing]);

	// Handler for deleting the goal
	const handleDelete = (e) => {
		e.stopPropagation(); // Prevent card click behavior
		onDelete(goal.id); // Call the onDelete prop from parent (GoalsTab)
	};

	// Handler for saving edited goal details
	const handleSaveEdit = (e) => {
		e.stopPropagation(); // Prevent card click behavior

		if (!editedTitle.trim()) {
			toast.error('Title cannot be empty.');
			return;
		}

		// Create an updated goal object with new values
		const updatedGoal = {
			...goal,
			title: editedTitle.trim(),
			description: editedDescription.trim(),
			color: editedColor,
		};
		// Call the onUpdateGoal prop from parent (GoalsTab)
		onUpdateGoal(updatedGoal); // Pass the entire updated goal object
		setIsEditing(false); // Exit editing mode
		toast.success('Goal updated successfully!');
	};

	// Handler for canceling edit mode and reverting changes
	const handleCancelEdit = (e) => {
		e.stopPropagation(); // Prevent card click behavior
		// Revert to original goal values
		setEditedTitle(goal.title);
		setEditedDescription(goal.description || '');
		setEditedColor(goal.color);
		setIsEditing(false); // Exit editing mode
	};

	// Handler for toggling goal progress (between 0 and 100)
	const toggleProgress = (e) => {
		if (isEditing) return; // Do not toggle progress if in editing mode
		e.stopPropagation(); // Prevent event bubbling up to parent div and affecting other elements

		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1; // getMonth() is zero-based, so add 1
		const day = now.getDate();

		let newProgress = goal.progress === 100 ? 0 : 100; // Toggle between 0 and 100
		let newCompletedDays = { ...goal.completedDays }; // Create a mutable copy

		if (newProgress === 100) {
			// Mark today's date as completed
			if (!newCompletedDays[year]) newCompletedDays[year] = {};
			if (!newCompletedDays[year][month])
				newCompletedDays[year][month] = {};
			newCompletedDays[year][month][day] = true;
		} else {
			// Remove today's date if toggled off
			if (newCompletedDays[year]?.[month]?.[day]) {
				delete newCompletedDays[year][month][day];

				// Cleanup empty month/year objects for cleaner data
				if (Object.keys(newCompletedDays[year][month]).length === 0) {
					delete newCompletedDays[year][month];
				}
				if (Object.keys(newCompletedDays[year]).length === 0) {
					delete newCompletedDays[year];
				}
			}
		}

		// Create an updated goal object
		const updatedGoal = {
			...goal,
			progress: newProgress,
			isCompleted: newProgress >= 100,
			completedDays: newCompletedDays,
		};

		// Call the onUpdateGoal prop from parent (GoalsTab)
		onUpdateGoal(updatedGoal); // Pass the entire updated goal object
	};

	return (
		<div
			ref={cardRef} // Ref for scrolling hook
			className={`card rounded-lg p-4 transition-all relative ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10' // Expanded style
					: 'max-h-32 overflow-hidden z-0 shadow-none' // Collapsed style
			}`}
			// Background color changes based on editing mode
			style={{ backgroundColor: isEditing ? editedColor : goal.color }}
			// The main card area (excluding the ellipsis button) triggers progress toggle
			onClick={toggleProgress} // This is the core fix: Attach toggleProgress here
		>
			{/* Progress Bar */}
			<div
				className="absolute inset-0 transition-all h-full"
				style={{
					width: `${goal.progress}%`,
					backgroundColor: '#A7C7E7', // Progress bar color
					borderRadius: 'inherit', // Inherit rounded corners from parent div
				}}
			></div>

			{/* Title & Description (Conditional Rendering based on editing mode) */}
			{isEditing ? (
				<div className="relative text-gray-700 text-sm z-10">
					{/* Editable Title Input */}
					<div className="mb-3">
						<label
							htmlFor="goal-title"
							className="block text-sm font-medium text-gray-700"
						>
							Goal Title:
						</label>
						<input
							type="text"
							id="goal-title"
							value={editedTitle}
							onChange={(e) => setEditedTitle(e.target.value)}
							// Stop propagation to prevent outer click from affecting input
							onClick={(e) => e.stopPropagation()}
							className="text-lg text-gray-500 p-1 rounded w-full"
							style={{ backgroundColor: '#f0f0f0' }}
							placeholder="Goal Title"
							ref={titleInputRef} // Attach ref for focusing
						/>
					</div>

					{/* Editable Description Input */}
					<div className="mb-4">
						<label
							htmlFor="goal-description"
							className="block text-sm font-medium text-gray-700"
						>
							Description:
						</label>
						<textarea
							id="goal-description"
							value={editedDescription}
							onChange={(e) =>
								setEditedDescription(e.target.value)
							}
							onClick={(e) => e.stopPropagation()}
							className="mt-1 p-1 w-full rounded text-gray-500"
							style={{ backgroundColor: '#f0f0f0' }}
							rows="3"
							placeholder="Add a description for your goal (optional)"
						></textarea>
					</div>

					{/* Color Selection (only if not completed) */}
					{!goal.isCompleted && (
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700">
								Card Color:
							</label>
							<ColorSquares
								setColor={setEditedColor}
								selectedColor={editedColor}
							/>
						</div>
					)}
				</div>
			) : (
				// Display mode (not editing)
				<>
					<h2 className="relative text-lg font-bold text-gray-800">
						{goal.title}
					</h2>
					<p className="relative text-gray-600 text-sm">
						{goal.description}
					</p>
				</>
			)}

			{/* Action Buttons (Edit/Save/Cancel/Delete) - only visible when expanded or editing */}
			{isExpanded && ( // Only show buttons when expanded
				<div className="flex flex-col h-full rounded-lg">
					<div className="flex flex-row justify-end items-end gap-2 mt-auto relative z-20">
						{' '}
						{/* z-20 ensures icons are clickable */}
						{isEditing ? (
							<>
								{/* Save Button */}
								<FontAwesomeIcon
									icon={faFloppyDisk}
									className={`far ${styles.goalCardIcon} z-20 text-green-600 hover:text-green-800 cursor-pointer`}
									onClick={handleSaveEdit}
									title="Save Changes"
								/>
								{/* Cancel Button */}
								<FontAwesomeIcon
									icon={faXmarkCircle}
									className={`far ${styles.goalCardIcon} z-20 text-red-600 hover:text-red-800 cursor-pointer`}
									onClick={handleCancelEdit}
									title="Cancel Edit"
								/>
							</>
						) : (
							// Edit Button
							<FontAwesomeIcon
								icon={faPencil}
								className={`far ${styles.goalCardIcon} z-20 cursor-pointer`}
								onClick={(e) => {
									e.stopPropagation(); // Prevent card click from toggling progress
									setIsEditing(true); // Enter editing mode
								}}
								title="Edit Goal"
							/>
						)}
						{/* Delete Button */}
						<FontAwesomeIcon
							icon={faTrashCan}
							className={`far ${styles.goalCardIcon} z-20 cursor-pointer`}
							onClick={handleDelete}
							title="Delete Goal"
						/>
					</div>
				</div>
			)}

			{/* Expand/Collapse Button (Ellipsis icon) - Always visible unless editing */}
			{!isEditing && (
				<div
					className="absolute top-2 right-2 z-20" // Positioning and z-index for visibility
				>
					<FontAwesomeIcon
						icon={faEllipsis}
						className={`far ${styles.goalCardIcon} cursor-pointer ${
							isExpanded
								? styles.progressComplete
								: styles.progressIncomplete
						}`}
						onClick={(e) => {
							e.stopPropagation(); // Crucial: Prevent card's onClick (toggleProgress) from firing
							onExpand(); // Call the onExpand prop from parent (GoalsTab)
						}}
						title={isExpanded ? 'Collapse Card' : 'Expand Card'}
					/>
				</div>
			)}
		</div>
	);
}
