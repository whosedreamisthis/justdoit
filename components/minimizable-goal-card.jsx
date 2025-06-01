import { useState } from 'react';

export default function MinimizableGoalCard({
	goal,
	onEdit,
	isExpanded,
	onExpand,
	onComplete,
	onProgressChange,
	onDelete,
}) {
	const [progress, setProgress] = useState(0); // Track goal progress
	const handleDelete = (e) => {
		e.stopPropagation(); // Prevent card collapse when clicking X
		onDelete(goal.id); // ✅ Trigger delete function
	};

	const decreaseProgress = (e) => {
		e.stopPropagation();

		// const totalSegments = goal.totalSegments > 1 ? goal.totalSegments : 1;
		// const totalSegments = goal.id === 'hydrate' ? 8 : 1;
		const totalSegments =
			goal.totalSegments || (goal.id === 'hydrate' ? 8 : 1);

		const newProgress = Math.max(progress - 100 / totalSegments, 0); // ✅ Ensures segmented decrease

		setProgress(newProgress);

		if (
			progress === 100 &&
			newProgress < 100 &&
			typeof onProgressChange === 'function'
		) {
			onProgressChange(goal.id); // ✅ Trigger movement upwards
		}
	};

	const increaseProgress = (e) => {
		e.stopPropagation();

		// ✅ Adjust segmentation only for water
		const totalSegments =
			goal.totalSegments || (goal.id === 'hydrate' ? 8 : 1);
		const segmentIncrement = 100 / totalSegments;

		const newProgress = Math.min(progress + segmentIncrement, 100);

		setProgress(newProgress);

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
					progress === 100 ? 'rounded-lg' : 'rounded-l-lg'
				}`}
				style={{ width: `${progress}%` }}
			></div>
			<button
				className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3 bg-deep-olive text-subtle rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 shadow-md z-20"
				onClick={handleDelete}
			>
				✖
			</button>

			{/* Card Content - Placed above progress bar */}
			<div className="relative flex justify-between items-center z-10">
				{/* Title & Short Description */}
				<div className="flex flex-col space-y-2">
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
						className="progress-button bg-subtle-background text-charcoal py-1 px-3 rounded-lg hover:bg-green-600 mb-2"
						onClick={decreaseProgress}
					>
						-
					</button>
					<button
						className="progress-button bg-subtle-background text-charcoal py-1 px-3 rounded-lg hover:bg-green-600 mb-2"
						onClick={increaseProgress}
					>
						+
					</button>
				</div>
			</div>

			{isExpanded && (
				<div className="mt-4 flex flex-col items-start z-10">
					<button
						className="mt-3 bg-subtle-background text-charcoal py-2 px-4 rounded-lg hover:bg-olive-earth flex mx-auto"
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
