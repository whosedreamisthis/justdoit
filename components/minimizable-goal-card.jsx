import { useState } from 'react';

export default function MinimizableGoalCard({
	goal,
	onEdit,
	isExpanded,
	onExpand,
	onComplete,
	onProgressChange,
	updateProgress,
	onDelete,
}) {
	const handleDelete = (e) => {
		e.stopPropagation(); // Prevent card collapse when clicking X
		onDelete(goal.id); // ✅ Trigger delete function
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
		if (
			goal.progress === 100 &&
			newProgress < 100 &&
			typeof onProgressChange === 'function'
		) {
			onProgressChange(goal.id); // ✅ Trigger movement upwards
		}
	};

	const increaseProgress = (e) => {
		e.stopPropagation();

		// const segmentIncrement = 100 / totalSegments;
		// const newProgress = Math.min(goal.progress + segmentIncrement, 100);
		const validProgress =
			typeof goal.progress === 'number' ? goal.progress : 0;
		const newProgress = Math.min(
			validProgress + 100 / goal.totalSegments,
			100
		);

		updateProgress(goal.id, newProgress); // ✅ Save progress correctly

		if (newProgress === 100) {
			onComplete(goal.id);
		}
	};
	return (
		<div
			className={`relative rounded-lg p-4 cursor-pointer transition-all flex flex-col overflow-hidden ${
				goal.color
			} ${isExpanded ? 'h-auto' : 'h-20'}`}
			onClick={onExpand}
			style={{ overflow: 'visible', borderRadius: '8px' }}
		>
			{/* Progress Bar - Background fills as progress increases */}
			<div
				className={`absolute inset-0 bg-blue-earth transition-all h-full w-full ${
					goal.progress === 100 ? 'rounded-lg' : 'rounded-l-lg'
				}`}
				style={{ width: `${goal.progress}%` }}
			></div>
			<button
				className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3 bg-deep-olive text-subtle rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 shadow-md z-20"
				onClick={handleDelete}
			>
				x
			</button>

			{/* Card Content - Placed above progress bar */}
			<div className="relative flex justify-between items-center z-10">
				{/* Title & Short Description */}
				<div className="flex flex-col">
					<h2 className="text-lg font-bold text-gray-800">
						{goal.title}
					</h2>
					<p className="text-gray-600 text-sm">
						{goal.shortDescription}
					</p>
				</div>

				{/* + Button to Increase Progress */}
				<div className="flex flex-row justify-between gap-2 mt-[10px]">
					<button
						className="progress-button bg-subtle-background text-charcoal py-1 px-3 rounded-lg hover:bg-green-600 mb-2 border-2"
						onClick={decreaseProgress}
					>
						-
					</button>
					<button
						className="progress-button bg-subtle-background text-charcoal py-1 px-3 rounded-lg hover:bg-green-600 mb-2 border-2"
						onClick={increaseProgress}
					>
						+
					</button>
				</div>
			</div>

			{isExpanded && (
				<div className="mt-4 flex flex-col items-start z-10">
					<button
						className="mt-3 bg-subtle-background text-charcoal py-2 px-4 rounded-lg hover:bg-olive-earth flex mx-auto border-2"
						onClick={(e) => {
							e.stopPropagation(); // Prevent card collapse
							onEdit(goal.id);
						}}
					>
						Edit Habit
					</button>
				</div>
			)}
		</div>
	);
}
