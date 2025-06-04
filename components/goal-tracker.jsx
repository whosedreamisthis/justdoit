// minimizable-goal-card.jsx
import { useState, useEffect, useRef } from 'react';
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
	const [editedDescription, setEditedDescription] = useState(
		goal.description || 'test 2'
	);
	const [editedColor, setEditedColor] = useState(goal.color);

	const titleInputRef = useRef(null);

	useEffect(() => {
		setEditedTitle(goal.title);
		setEditedDescription(goal.description || '');
		setEditedColor(goal.color);
		setIsEditing(false); // Reset editing state when goal or expansion changes
	}, [goal.id, goal.title, goal.description, goal.color, isExpanded]);

	useEffect(() => {
		if (isEditing && titleInputRef.current) {
			titleInputRef.current.focus();
			// Set cursor at the beginning
			titleInputRef.current.setSelectionRange(0, 0);
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

	return (
		<div
			className={`
                ${goal.progress >= 100 ? 'completed-card' : 'card'}
                relative rounded-lg p-4 cursor-pointer transition-all flex flex-col
                ${isExpanded ? 'h-auto' : 'h-25'} border border-black
            `}
			style={{
				backgroundColor: isEditing ? editedColor : goal.color,
				overflow: 'visible',
				borderRadius: '8px',
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
			></div>

			<div className="card-container relative flex justify-between items-start z-10">
				{/* Left side: Title/Input, Description, and Day Squares (conditional) */}
				<div className="flex-grow pr-12 min-w-0">
					{isEditing ? (
						<div className="mb-2">
							{' '}
							{/* Added div for label and input */}
							<label
								htmlFor="goal-title"
								className="block text-base font-medium text-gray-700 font-bold"
							>
								Goal Title:
							</label>
							<input
								id="goal-title" // Added id for label association
								type="text"
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								onClick={(e) => e.stopPropagation()}
								ref={titleInputRef}
								className="text-lg text-gray-500 p-1 rounded w-full"
								style={{ backgroundColor: '#f3dac4' }}
								placeholder="Goal Title"
							/>
						</div>
					) : (
						<h2 className="text-lg font-bold text-gray-800 break-words truncate">
							{goal.title.length > 20
								? `${goal.title.slice(0, 17)}...`
								: goal.title}
						</h2>
					)}

					{/* Short Description - Display when expanded AND not editing */}
					{isExpanded && goal.description && (
						<p className="text-sm text-gray-700 mt-1 mb-2 break-words">
							{goal.description}
						</p>
					)}

					{/* Day squares only when NOT expanded */}
					{!isExpanded && (
						<div className="day-squares-container gap-10 pb-4">
							{daySquares}
						</div>
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

			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					{/* The editable fields (title, short description, color) only appear if isEditing is true */}
					{isEditing && (
						<>
							{/* Input for Short Description (appears ONLY when editing) */}
							<div className="mb-4">
								<label
									htmlFor="goal-short-description"
									className="block text-base font-medium text-gray-700 font-bold"
								>
									Short Description:
								</label>
								<textarea
									id="goal-short-description"
									value={editedDescription} // This should always show the current edited value
									onChange={(e) =>
										setEditedDescription(e.target.value)
									}
									onClick={(e) => e.stopPropagation()}
									className="mt-1 p-1 w-full rounded text-gray-500"
									style={{ backgroundColor: '#f3dac4' }}
									rows="3"
									placeholder="Add a short description for your goal (optional)"
								></textarea>
							</div>

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
											style={{ backgroundColor: color }}
											onClick={(e) => {
												e.stopPropagation();
												setEditedColor(color);
											}}
											title={color}
										></div>
									))}
								</div>
							</div>
						</>
					)}

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
