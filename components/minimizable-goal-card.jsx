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
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import ColorSquares from './color-squares';

export default function MinimizableGoalCard({
	goal,
	onEdit,
	isExpanded,
	onExpand,
	// Removed: onComplete, // No longer needed for explicit re-sort trigger
	// Removed: onProgressChange, // No longer needed for explicit re-sort trigger
	updateProgress, // This prop is now less critical for the primary update flow
	onDelete,
	onUpdateGoal, // This is the key prop from page.js
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(goal.title);
	const [editedDescription, setEditedDescription] = useState(
		goal.description || ''
	);
	const [editedColor, setEditedColor] = useState(goal.color);

	const titleInputRef = useRef(null);
	const cardRef = ScrollOnExpand(isExpanded);

	const prevProgressRef = useRef(goal.progress);

	useEffect(() => {
		setEditedTitle(goal.title);
		setEditedDescription(goal.description || '');
		setEditedColor(goal.color);
		setIsEditing(false);
	}, [goal.id, goal.title, goal.description, goal.color, isExpanded]);

	useEffect(() => {
		if (isEditing && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.setSelectionRange(0, 0);
		}
	}, [isEditing]);

	useEffect(() => {
		if (goal.progress === 100 && prevProgressRef.current < 100) {
			if (cardRef.current) {
				cardRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}
		prevProgressRef.current = goal.progress;
	}, [goal.progress, cardRef]);

	const handleDelete = (e) => {
		e.stopPropagation();
		onDelete(goal.id);
	};

	const decreaseProgress = (e) => {
		e.stopPropagation();

		const validProgress =
			typeof goal.progress === 'number' ? goal.progress : 0;
		const newProgress = Math.max(
			validProgress - 100, // Changed from (goal.totalSegments ? 100 / goal.totalSegments : 25) to 100
			0
		);

		const today = new Date().toISOString().split('T')[0];
		const newCompletedDays = { ...goal.completedDays };
		if (newProgress === 0) {
			delete newCompletedDays[today]; // Remove if progress is reset to 0
		}

		const updatedGoal = {
			...goal,
			progress: newProgress,
			isCompleted: newProgress >= 100,
			completedDays: newCompletedDays,
		};
		console.log(
			'MinimizableGoalCard: Decreasing progress for',
			goal.id,
			'to',
			newProgress
		);
		onUpdateGoal(goal.id, updatedGoal);

		// Removed redundant re-sort triggers:
		// if (goal.progress === 100 && newProgress < 100) {
		// 	onProgressChange(goal.id);
		// }
	};

	const increaseProgress = (e) => {
		e.stopPropagation();

		const validProgress =
			typeof goal.progress === 'number' ? goal.progress : 0;
		let newProgress = Math.min(
			validProgress + 100, // Changed from (goal.totalSegments ? 100 / goal.totalSegments : 25) to 100
			100
		);

		if (goal.progress === 100) {
			newProgress = 0; // Reset progress to 0 if already complete
		}

		const today = new Date().toISOString().split('T')[0];
		const newCompletedDays = { ...goal.completedDays };

		if (newProgress > 0 && newProgress < 100) {
			newCompletedDays[today] = true;
		} else if (newProgress === 100) {
			newCompletedDays[today] = true;
		} else if (newProgress === 0) {
			delete newCompletedDays[today];
		}

		const updatedGoal = {
			...goal,
			progress: newProgress,
			isCompleted: newProgress >= 100,
			completedDays: newCompletedDays,
		};

		console.log(
			'MinimizableGoalCard: Increasing progress for',
			goal.id,
			'to',
			newProgress
		);
		onUpdateGoal(goal.id, updatedGoal);

		// Removed redundant re-sort triggers:
		// if (newProgress === 100) {
		// 	onComplete(goal.id);
		// }
		toast.success(`${goal.title} progress updated!`);
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
			description: editedDescription.trim(),
			color: editedColor,
		};
		console.log(
			'MinimizableGoalCard: Saving edit for goal',
			goal.id,
			'with updated data:',
			updatedGoal
		);
		onUpdateGoal(goal.id, updatedGoal);
		setIsEditing(false);
		toast.success('Goal updated!');
	};

	const handleCancelEdit = (e) => {
		e.stopPropagation();
		setEditedTitle(goal.title);
		setEditedDescription(goal.description || '');
		setEditedColor(goal.color);
		setIsEditing(false);
	};
	return (
		<div
			ref={cardRef}
			className={`
				${goal.progress >= 100 ? 'completed-card' : 'card'}
				relative rounded-lg p-4 transition-all
				
				${
					isExpanded
						? 'max-h-[500px] overflow-auto z-10'
						: 'max-h-32 overflow-hidden z-0 shadow-none'
				}
			`}
			style={{
				backgroundColor: isEditing ? editedColor : goal.color,
			}}
			onClick={() => {
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

			<div className="relative flex justify-between items-start z-10">
				<div className="flex-grow min-w-0">
					{isExpanded && !isEditing && (
						<>
							<h2 className="title text-lg font-bold text-gray-800">
								{goal.title}
							</h2>

							{goal.description && (
								<p className="description text-sm text-gray-700 mt-1 mb-2 break-words">
									{goal.description}
								</p>
							)}
						</>
					)}

					{!isExpanded && (
						<>
							<div className="flex flex-col items-start">
								<h2 className="text-lg font-bold text-gray-800 break-words truncate">
									{goal.title.length > 25
										? `${goal.title.slice(0, 22)}...`
										: goal.title}
								</h2>
							</div>
						</>
					)}

					{isExpanded && isEditing && (
						<>
							<div className="my-2">
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
									style={{ backgroundColor: '#f0f0f0' }}
									placeholder="Goal Title"
								/>
							</div>

							<div className="my-4">
								<label
									htmlFor="goal-short-description"
									className="block text-base font-medium text-gray-700 font-bold"
								>
									Description:
								</label>
								<textarea
									id="goal-short-description"
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
							{goal.progress < 100 && (
								<div className="mb-4">
									<label className="block font-medium text-gray-700">
										Card Color:
									</label>
									<ColorSquares
										setColor={setEditedColor}
										selectedColor={editedColor}
									/>
								</div>
							)}
						</>
					)}
				</div>

				{!isEditing && (
					<div className="absolute top-0 right-0">
						<FontAwesomeIcon
							icon={
								goal.progress === 100
									? faSquareCheck
									: faSquarePlus
							}
							className={`far goal-card-icon z-20 ${
								goal.progress === 100
									? 'progress-complete'
									: 'progress-incomplete'
							}`}
							onClick={increaseProgress}
						></FontAwesomeIcon>
					</div>
				)}
			</div>

			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
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
									setIsEditing(true);
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
