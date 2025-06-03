// minimizable-goal-card.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Removed unused useState import
import {
	faTrashCan,
	faPencil,
	faSquarePlus,
	faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';

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
	currentDayIndex,
}) {
	const completedSquareColorClass = 'bg-deep-olive';

	// --- MINIMAL CHANGE 1: Use goal.completedDays instead of goal.daySquares ---
	const daySquares = goal.completedDays.map((day, index) => {
		// CHANGED HERE!
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
			// --- MINIMAL CHANGE 2: Use goal.completedDays and copy it ---
			const newDays = [...goal.completedDays]; // CHANGED HERE and ensures a copy!
			newDays[currentDayIndex] = false;
			updateDaysProgress(goal.id, newDays);
		}

		updateProgress(goal.id, newProgress);

		if (newProgress === 100) {
			onComplete(goal.id);
			// --- MINIMAL CHANGE 3: Use goal.completedDays and copy it ---
			const newDays = [...goal.completedDays]; // CHANGED HERE and ensures a copy!
			newDays[currentDayIndex] = true;
			updateDaysProgress(goal.id, newDays);
		}
	};

	return (
		<div
			className={`${
				goal.progress >= 100 ? 'completed-card' : 'card'
			} relative rounded-lg p-4 cursor-pointer transition-all flex flex-col overflow-hidden ${
				goal.color
			} ${isExpanded ? 'h-auto' : 'h-25'} border border-black`}
			onClick={onExpand}
			style={{ overflow: 'visible', borderRadius: '8px' }}
		>
			<div
				className={`absolute inset-0 bg-blue-earth transition-all h-full w-full ${
					goal.progress === 100 ? 'rounded-lg' : 'rounded-l-lg'
				}`}
				style={{ width: `${goal.progress}%` }}
			></div>

			<div className="card-container relative flex justify-between items-center z-10">
				<div className="flex flex-row justify-around gap-20">
					<div>
						<h2 className="text-lg font-bold text-gray-800">
							{goal.title}
						</h2>
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
					<div className="flex flex-row justify-end items-end gap-2">
						<FontAwesomeIcon
							icon={faPencil}
							className="far goal-card-icon z-20"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(goal.id);
							}}
						></FontAwesomeIcon>
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
