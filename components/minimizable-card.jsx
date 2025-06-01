'use client';
import { useState } from 'react';

export default function MinimizableCard({ habit, onSelect }) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpand = () => setIsExpanded(!isExpanded);

	return (
		<div
			className={`bg-white rounded-lg shadow-lg p-4 cursor-pointer transition-all ${
				isExpanded ? 'max-h-[500px] overflow-auto' : 'max-h-32'
			}`}
			onClick={toggleExpand}
		>
			{/* Icon + Title */}
			<div className="flex items-center space-x-4">
				<img src={habit.icon} alt={habit.title} className="w-12 h-12" />
				<h2 className="text-lg font-bold text-gray-800">
					{habit.title}
				</h2>
			</div>

			{/* Short Description */}
			{!isExpanded && (
				<p className="text-gray-600 text-sm mt-2">
					{habit.shortDescription}
				</p>
			)}

			{/* Expanded View */}
			{isExpanded && (
				<div className="mt-4">
					<p className="text-gray-700 text-base">
						{habit.detailedDescription}
					</p>
					<button
						className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex mx-auto"
						onClick={(e) => {
							e.stopPropagation(); // Prevent card from collapsing
							onSelect(habit.id);
						}}
					>
						Select Habit
					</button>
				</div>
			)}
		</div>
	);
}
