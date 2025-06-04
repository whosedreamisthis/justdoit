import { useState, useEffect } from 'react'; // Import useState and useEffect
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrashCan,
	faPencil, // This will be the "Edit" button
	faSquarePlus,
	faSquareCheck,
	faFloppyDisk, // New: For Save button
	faXmarkCircle, // New: For Cancel button
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast'; // Import toast for notifications

export default function MinimizableGoalCard({
	goal,
	onEdit, // This prop might become redundant for the new edit flow or handle different type of edit
	isExpanded,
	onExpand,
	onComplete,
	onProgressChange,
	updateProgress,
	updateDaysProgress,
	onDelete,
	onUpdateGoal, // NEW PROP: Function to call when goal is updated
	currentDayIndex,
}) {
	// Define the 8 pastel colors for the color picker
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

	// State to manage editing mode
	const [isEditing, setIsEditing] = useState(false);
	// States to hold temporary edited values
	const [editedTitle, setEditedTitle] = useState(goal.title);
	const [editedColor, setEditedColor] = useState(goal.color);

	// Effect to reset edit state when the goal changes (e.g., different card expands)
	// or when the card expansion state changes
	useEffect(() => {
		setEditedTitle(goal.title);
		setEditedColor(goal.color);
		setIsEditing(false); // Ensure edit mode is off when component state changes
	}, [goal.id, goal.title, goal.color, isExpanded]); // Depend on goal properties and expansion state

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

	// Handler for saving edits
	const handleSaveEdit = (e) => {
		e.stopPropagation(); // Prevent card collapse when clicking Save

		if (!editedTitle.trim()) {
			toast.error('Title cannot be empty.');
			return;
		}

		const updatedGoal = {
			...goal, // Keep existing goal properties
			title: editedTitle.trim(), // Update title
			color: editedColor, // Update color
		};
		onUpdateGoal(updatedGoal); // Call the parent function to persist changes
		setIsEditing(false); // Exit edit mode
		toast.success('Goal updated!');
	};

	// Handler for canceling edits
	const handleCancelEdit = (e) => {
		e.stopPropagation(); // Prevent card collapse when clicking Cancel
		setEditedTitle(goal.title); // Revert title to original
		setEditedColor(goal.color); // Revert color to original
		setIsEditing(false); // Exit edit mode
	};

	return (
		<div
			className={`
                ${goal.progress >= 100 ? 'completed-card' : 'card'}
                relative rounded-lg p-4 cursor-pointer transition-all flex flex-col overflow-hidden
                ${isExpanded ? 'h-auto' : 'h-25'} border border-black
            `}
			// Apply editedColor when in editing mode, otherwise use original goal.color
			style={{
				backgroundColor: isEditing ? editedColor : goal.color,
				overflow: 'visible',
				borderRadius: '8px',
			}}
			onClick={() => {
				// Only allow expansion/collapse if not currently editing
				if (!isEditing) {
					onExpand();
				}
			}}
		>
			{/* Progress bar */}
			<div
				className={`absolute inset-0 bg-blue-earth transition-all h-full w-full ${
					goal.progress === 100 ? 'rounded-lg' : 'rounded-l-lg'
				}`}
				style={{ width: `${goal.progress}%` }}
			></div>

			<div className="card-container relative flex justify-between items-center z-10">
				<div className="flex flex-row justify-around gap-20">
					<div>
						{/* Conditional rendering for Title: Input field when editing, H2 when not */}
						{isEditing ? (
							<input
								type="text"
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								onClick={(e) => e.stopPropagation()} // Stop propagation to prevent card collapse
								className="text-lg font-bold text-gray-800 bg-white p-1 rounded w-3/4"
								placeholder="Goal Title"
							/>
						) : (
							<h2 className="text-lg font-bold text-gray-800">
								{goal.title}
							</h2>
						)}

						<div className="day-squares-container gap-10 pb-4">
							{daySquares}
						</div>
					</div>
					<div className="absolute top-1 right-1">
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
				</div>
			</div>

			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					{/* Color selection grid, only visible when editing */}
					{isEditing && (
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
											e.stopPropagation(); // Prevent card collapse
											setEditedColor(color); // Set the new color
										}}
										title={color}
									></div>
								))}
							</div>
						</div>
					)}

					<div className="flex flex-row justify-end items-end gap-2">
						{isEditing ? (
							<>
								{/* Save Button */}
								<FontAwesomeIcon
									icon={faFloppyDisk}
									className="far goal-card-icon z-20 text-green-600 hover:text-green-800"
									onClick={handleSaveEdit}
									title="Save Changes"
								></FontAwesomeIcon>
								{/* Cancel Button */}
								<FontAwesomeIcon
									icon={faXmarkCircle}
									className="far goal-card-icon z-20 text-red-600 hover:text-red-800"
									onClick={handleCancelEdit}
									title="Cancel Edit"
								></FontAwesomeIcon>
							</>
						) : (
							// Edit Button (pencil icon)
							<FontAwesomeIcon
								icon={faPencil}
								className="far goal-card-icon z-20"
								onClick={(e) => {
									e.stopPropagation(); // Prevent card collapse
									// onEdit(goal.id); // This line can be removed if onEdit is not used elsewhere for this new flow
									setIsEditing(true); // Enter edit mode
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
