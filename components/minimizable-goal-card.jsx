import { useState } from 'react';

export default function MinimizableGoalCard({
	goal,
	onEdit,
	isExpanded,
	onExpand,
}) {
	return (
		<div
			className={`bg-white rounded-lg shadow-lg p-4 cursor-pointer transition-all ${
				isExpanded ? 'max-h-[500px] overflow-auto' : 'max-h-32'
			}`}
			onClick={onExpand}
		>
			{/* Title & Short Description */}
			<h2 className="text-lg font-bold text-gray-800">{goal.title}</h2>
			{!isExpanded && (
				<p className="text-gray-600 text-sm">{goal.shortDescription}</p>
			)}

			{/* Expanded View */}
			{isExpanded && (
				<div className="mt-4 flex flex-col items-center">
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
