import { useState } from 'react';

export default function MinimizableGoalCard({
	goal,
	onEdit,
	isExpanded,
	onExpand,
}) {
	const [progress, setProgress] = useState(0); // Track goal progress

	const decreaseProgress = (e) => {
		e.stopPropagation();
		// Use multiple segments **only if totalSegments is set and greater than 1**
		const totalSegments = goal.totalSegments > 1 ? goal.totalSegments : 1;

		setProgress((prev) => Math.max(prev - 100 / totalSegments, 0));
	};

	const increaseProgress = (e) => {
		e.stopPropagation();
		// Use multiple segments **only if totalSegments is set and greater than 1**
		const totalSegments = goal.totalSegments > 1 ? goal.totalSegments : 1;

		setProgress((prev) => Math.min(prev + 100 / totalSegments, 100));
	};

	return (
		<div
			className="relative bg-white rounded-lg shadow-lg p-4 cursor-pointer transition-all flex flex-col overflow-hidden"
			onClick={onExpand}
		>
			{/* Progress Bar - Background fills as progress increases */}
			<div
				className="absolute inset-0 bg-blue-300 transition-all h-full"
				style={{ width: `${progress}%` }}
			></div>

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
				<div className="flex flex-col justify-between">
					<button
						className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 mb-2"
						onClick={increaseProgress}
					>
						+
					</button>
					<button
						className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 width=20 height=20"
						onClick={decreaseProgress}
					>
						-
					</button>
				</div>
			</div>

			{isExpanded && (
				<div className="mt-4 flex flex-col items-start z-10">
					<button
						className="mt-3 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex mx-auto"
						onClick={(e) => {
							e.stopPropagation();
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
