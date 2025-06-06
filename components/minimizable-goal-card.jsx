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
	onDelete,
	onUpdateGoal,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(goal.title);
	const [editedDescription, setEditedDescription] = useState(
		goal.description || ''
	);
	const [editedColor, setEditedColor] = useState(goal.color);

	const titleInputRef = useRef(null);
	const cardRef = ScrollOnExpand(isExpanded);

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

	const handleDelete = (e) => {
		e.stopPropagation();
		onDelete(goal.id);
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
		onUpdateGoal(goal.id, updatedGoal);
		setIsEditing(false);
	};

	const handleCancelEdit = (e) => {
		e.stopPropagation();
		setEditedTitle(goal.title);
		setEditedDescription(goal.description || '');
		setEditedColor(goal.color);
		setIsEditing(false);
	};

	const toggleProgress = (e) => {
		e.stopPropagation();
		const newProgress = goal.progress === 100 ? 0 : 100;

		const updatedGoal = {
			...goal,
			progress: newProgress,
			isCompleted: newProgress >= 100,
		};
		onUpdateGoal(goal.id, updatedGoal);
	};

	return (
		<div
			ref={cardRef}
			className={`${
				goal.color
			} card rounded-lg p-4 transition-all relative ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0 shadow-none'
			}`}
			onClick={() => {
				if (!isEditing) {
					onExpand();
				}
			}}
		>
			{/* Progress Bar */}
			<div
				className="absolute inset-0 bg-blue-500 transition-all h-full"
				style={{
					width: `${goal.progress}%`,
					borderRadius: 'inherit',
					opacity: 0.3,
				}}
			></div>

			{/* Title & Description */}
			{isEditing ? (
				<div className="relative text-gray-700 text-sm z-10">
					{/* Editable Title */}
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
							onClick={(e) => e.stopPropagation()}
							className="text-lg text-gray-500 p-1 rounded w-full"
							style={{ backgroundColor: '#f0f0f0' }}
							placeholder="Goal Title"
						/>
					</div>

					{/* Editable Description */}
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

					{/* Color Selection */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Card Color:
						</label>
						<ColorSquares
							setColor={setEditedColor}
							selectedColor={editedColor}
						/>
					</div>
				</div>
			) : (
				<>
					<h2 className="relative text-lg font-bold text-gray-800">
						{goal.title}
					</h2>
					<p className="relative text-gray-600 text-sm">
						{goal.description}
					</p>
				</>
			)}

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
								/>
								<FontAwesomeIcon
									icon={faXmarkCircle}
									className="far goal-card-icon z-20 text-red-600 hover:text-red-800"
									onClick={handleCancelEdit}
									title="Cancel Edit"
								/>
							</>
						) : (
							<FontAwesomeIcon
								icon={faPencil}
								className="far goal-card-icon z-20"
								onClick={(e) => {
									e.stopPropagation();
									setIsEditing(true);
								}}
							/>
						)}
						<FontAwesomeIcon
							icon={faTrashCan}
							className="far goal-card-icon z-20"
							onClick={handleDelete}
						/>
					</div>
				</div>
			)}

			{/* Progress Button - Positioned 10px Down and to the Left */}
			{!isEditing && (
				<div
					className="absolute"
					style={{ top: '10px', right: '10px' }}
				>
					<FontAwesomeIcon
						icon={
							goal.progress === 100 ? faSquareCheck : faSquarePlus
						}
						className={`far goal-card-icon z-20 ${
							goal.progress === 100
								? 'progress-complete'
								: 'progress-incomplete'
						}`}
						onClick={toggleProgress}
					/>
				</div>
			)}
		</div>
	);
}
