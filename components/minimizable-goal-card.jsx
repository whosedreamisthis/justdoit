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
import DaySquares from './day-squares';
import ColorSquares from './color-squares';
export default function MinimizableGoalCard({
	goal,
	onEdit,
	isExpanded,
	onExpand,
	onComplete,
	onProgressChange,
	updateProgress,
	updateDaysProgress,
	onDelete,
	onUpdateGoal,
	currentDayIndex,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(goal.title);
	const [editedDescription, setEditedDescription] = useState(
		goal.description || ''
	);
	const [editedColor, setEditedColor] = useState(goal.color);

	const titleInputRef = useRef(null);
	const cardRef = ScrollOnExpand(isExpanded); // This hook handles scroll on expand

	// --- NEW: Ref to store previous progress for detecting completion ---
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

	// --- NEW: Effect to scroll into view when goal is completed ---
	useEffect(() => {
		// Check if the goal *just* became 100% completed
		if (goal.progress === 100 && prevProgressRef.current < 100) {
			if (cardRef.current) {
				// Scroll the card into view with smooth behavior
				cardRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}
		// Update the previous progress ref for the next render
		prevProgressRef.current = goal.progress;
	}, [goal.progress, cardRef]); // Dependencies: Re-run when goal.progress changes or cardRef changes

	// -----------------------------------------------------------------

	const completedSquareColorClass = 'day-square-filled-green';

	// MODIFICATION HERE: Making the day squares slightly larger
	// const daySquares = goal.completedDays.map((day, index) => {
	// 	const shouldFill = day;
	// 	const squareClass = `day-square ${
	// 		shouldFill ? completedSquareColorClass : ''
	// 	} w-8 h-8`; // ADDED: w-8 h-8 for a larger size (32px by default in Tailwind)
	// 	return <div key={index} className={squareClass}></div>;
	// });

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
			description: editedDescription.trim(),
			color: editedColor,
		};
		onUpdateGoal(updatedGoal);
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
	//  ${isExpanded ? 'h-auto' : 'h-25'}
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
								<p className="text-sm text-gray-700 mt-1 mb-2 break-words">
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
								<DaySquares
									completedDays={goal.completedDays}
								/>
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
									{/* <div className="flex justify-center items-center w-full"> */}
									{/* <div className="grid grid-cols-8 gap-4 justify-center mx-auto w-fit"> */}
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
							className="far goal-card-icon z-20"
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
