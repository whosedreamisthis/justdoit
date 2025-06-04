// minimizable-goal-card.jsx
import { useState, useEffect, useRef } from 'react';
import ScrollOnExpand from '../hooks/scroll-on-expand'; // <--- ADD THIS IMPORT
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrashCan,
	faPencil,
	faSquarePlus,
	faSquareCheck,
	faFloppyDisk,
	faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

export default function MinimizableGoalCard({
	goal,
	onEdit, // This prop isn't directly used internally but kept for API consistency
	isExpanded, // This prop is passed to the hook
	onExpand,
	onComplete,
	onProgressChange,
	updateProgress,
	updateDaysProgress,
	onDelete,
	onUpdateGoal,
	currentDayIndex,
}) {
	const pastelColors = [
		'#FFD1DC', // Light Pink
		'#FFDAB9', // Peach Puff
		'#FFFACD', // Lemon Chiffon
		'#A7B39E', // Light Pastely Olive Green
		'#E0BBE4', // Lavender
		'#D3D3D3', // Light Gray
		'#EBD6D0', // Light Terracotta / Rose-Brown
		'#FFA07A', // Light Salmon
	];

	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(goal.title);
	const [editedShortDescription, setEditedShortDescription] = useState(
		goal.shortDescription || ''
	);
	const [editedColor, setEditedColor] = useState(goal.color);

	const titleInputRef = useRef(null);
	const cardRef = ScrollOnExpand(isExpanded); // <--- USE THE CUSTOM HOOK HERE!

	// This useEffect ensures that when the goal prop changes,
	// our internal editing states are reset and populated from the new goal.
	useEffect(() => {
		setEditedTitle(goal.title);
		setEditedShortDescription(goal.shortDescription || ''); // Ensures editedShortDescription is synced
		setEditedColor(goal.color);
		setIsEditing(false); // Crucially resets editing mode when goal or expansion changes
	}, [goal.id, goal.title, goal.shortDescription, goal.color, isExpanded]);

	// Focus on title input when entering edit mode
	useEffect(() => {
		if (isEditing && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.setSelectionRange(0, 0); // Place cursor at the beginning
		}
	}, [isEditing]);

	const completedSquareColorClass = 'bg-deep-olive';

	const daySquares = goal.completedDays.map((day, index) => {
		const shouldFill = day;
		const squareClass = `day-square ${
			shouldFill ? completedSquareColorClass : ''
		}`;
		return <div key={index} className={squareClass}></div>;
	});

	const handleDelete = (e) => {
		e.stopPropagation();
		onDelete(goal.id);
	};

	const decreaseProgress = (e) => {
		e.stopPropagation();

		const validProgress =
			typeof goal.progress === 'number' ? goal.progress : 0;
		const newProgress = Math.max(
			validProgress - 100 / goal.totalSegments,
			0
		);

		updateProgress(goal.id, newProgress);
		if (goal.progress === 100 && newProgress < 100) {
			onProgressChange(goal.id);
		}
	};

	const increaseProgress = (e) => {
		e.stopPropagation();

		const validProgress =
			typeof goal.progress === 'number' ? goal.progress : 0;
		let newProgress = Math.min(
			validProgress + 100 / goal.totalSegments,
			100
		);

		if (goal.progress === 100) {
			newProgress = 0;
			const newDays = [...goal.completedDays];
			newDays[currentDayIndex] = false;
			updateDaysProgress(goal.id, newDays);
		}

		updateProgress(goal.id, newProgress);

		if (newProgress === 100) {
			onComplete(goal.id);
			const newDays = [...goal.completedDays];
			newDays[currentDayIndex] = true;
			updateDaysProgress(goal.id, newDays);
		}
	};

	const handleSaveEdit = (e) => {
		e.stopPropagation();

		if (!editedTitle.trim()) {
			toast.error('Title cannot be empty.');
			return;
		}

		const updatedGoal = {
			...goal,
			title: editedTitle.trim(),
			shortDescription: editedShortDescription.trim(),
			color: editedColor,
		};
		onUpdateGoal(updatedGoal);
		setIsEditing(false);
		toast.success('Goal updated!');
	};

	const handleCancelEdit = (e) => {
		e.stopPropagation();
		setEditedTitle(goal.title);
		setEditedShortDescription(goal.shortDescription || ''); // Reset to original goal.shortDescription
		setEditedColor(goal.color);
		setIsEditing(false);
	};

	return (
		<div
			ref={cardRef} // <--- ATTACH THE REF FROM THE CUSTOM HOOK HERE!
			className={`
                ${goal.progress >= 100 ? 'completed-card' : 'card'}
                relative rounded-lg p-4 cursor-pointer transition-all flex flex-col
                ${isExpanded ? 'h-auto' : 'h-25'}
            `}
			style={{
				backgroundColor: isEditing ? editedColor : goal.color,
				overflow: 'visible',
				borderRadius: '8px',
			}}
			onClick={() => {
				// Only allow expansion/collapse if not in editing mode
				if (!isEditing) {
					onExpand();
				}
			}}
		>
			<div
				className={`absolute inset-0 bg-blue-earth transition-all h-full w-full ${
					goal.progress === 100 ? 'rounded-lg' : 'rounded-l-lg'
				}`}
				style={{ width: `${goal.progress}%` }}
			>
				{' '}
			</div>

			<div className="card-container relative flex justify-between items-start z-10">
				{/* Left side: Content that changes based on expand/edit state */}
				<div className="flex-grow pr-12 min-w-0">
					{/* Display Mode (Expanded, Not Editing) */}
					{isExpanded && !isEditing && (
						<>
							<h2 className="text-lg font-bold text-gray-800 break-words">
								{goal.title}
							</h2>
							{goal.shortDescription && (
								<p className="text-sm text-gray-700 mt-1 mb-2 break-words">
									{goal.shortDescription}
								</p>
							)}
						</>
					)}

					{/* Collapsed Mode (Not Expanded) */}
					{!isExpanded && (
						<>
							<h2 className="text-lg font-bold text-gray-800 break-words">
								{goal.title}
							</h2>
							<div className="day-squares-container gap-10 pb-4">
								{daySquares}
							</div>
						</>
					)}

					{/* EDIT MODE (Expanded, Editing) - This is the consolidated block */}
					{isExpanded && isEditing && (
						<>
							{/* Title Label and Input */}
							<div className="mb-2">
								<label
									htmlFor="goal-title"
									className="block text-base font-medium text-gray-700 font-bold"
								>
									Goal Title:
								</label>
								<input
									id="goal-title"
									type="text"
									value={editedTitle}
									onChange={(e) =>
										setEditedTitle(e.target.value)
									}
									onClick={(e) => e.stopPropagation()}
									ref={titleInputRef}
									className="text-lg text-gray-500 p-1 rounded w-full"
									style={{ backgroundColor: '#f3dac4' }}
									placeholder="Goal Title"
								/>
							</div>

							{/* Short Description Label and Input */}
							<div className="mb-4">
								<label
									htmlFor="goal-short-description"
									className="block text-base font-medium text-gray-700 font-bold"
								>
									Short Description:
								</label>
								<textarea
									id="goal-short-description"
									value={editedShortDescription}
									onChange={(e) =>
										setEditedShortDescription(
											e.target.value
										)
									}
									onClick={(e) => e.stopPropagation()}
									className="mt-1 p-1 w-full rounded text-gray-500"
									style={{ backgroundColor: '#f3dac4' }}
									rows="3"
									placeholder="Add a short description for your goal (optional)"
								></textarea>
							</div>

							{/* Color Picker - ONLY SHOW FOR INCOMPLETE GOALS WHEN EDITING */}
							{goal.progress < 100 && (
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700">
										Card Color:
									</label>
									<div className="grid grid-cols-8 gap-2 mt-1">
										{pastelColors.map((color, idx) => (
											<div
												key={idx}
												className={`w-8 h-8 rounded-md cursor-pointer border-2 ${
													editedColor === color
														? 'border-indigo-500'
														: 'border-gray-300'
												}`}
												style={{
													backgroundColor: color,
												}}
												onClick={(e) => {
													e.stopPropagation();
													setEditedColor(color);
												}}
												title={color}
											></div>
										))}
									</div>
								</div>
							)}
						</>
					)}
				</div>

				{/* Right side: Progress Icon (absolute position) */}
				<div className="absolute top-1 right-1">
					<FontAwesomeIcon
						icon={
							goal.progress === 100 ? faSquareCheck : faSquarePlus
						}
						className="far goal-card-icon z-20"
						onClick={increaseProgress}
					></FontAwesomeIcon>
				</div>
			</div>

			{/* Control buttons (Edit/Save/Cancel/Delete) always at the bottom of expanded view */}
			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					{/* CONTROL BUTTONS (Edit/Save/Cancel/Delete) */}
					<div className="flex flex-row justify-end items-end gap-2 mt-auto">
						{isEditing ? (
							<>
								<FontAwesomeIcon
									icon={faFloppyDisk}
									className="far goal-card-icon z-20 text-green-600 hover:text-green-800"
									onClick={handleSaveEdit}
									title="Save Changes"
								></FontAwesomeIcon>
								<FontAwesomeIcon
									icon={faXmarkCircle}
									className="far goal-card-icon z-20 text-red-600 hover:text-red-800"
									onClick={handleCancelEdit}
									title="Cancel Edit"
								></FontAwesomeIcon>
							</>
						) : (
							<FontAwesomeIcon
								icon={faPencil}
								className="far goal-card-icon z-20"
								onClick={(e) => {
									e.stopPropagation();
									setIsEditing(true); // Set isEditing to true to reveal edit fields
								}}
							></FontAwesomeIcon>
						)}
						<FontAwesomeIcon
							icon={faTrashCan}
							className="far goal-card-icon z-20"
							onClick={handleDelete}
						></FontAwesomeIcon>
					</div>
				</div>
			)}
		</div>
	);
}
