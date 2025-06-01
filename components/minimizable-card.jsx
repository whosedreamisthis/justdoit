export default function MinimizableCard({
	index,
	habit,
	onSelect,
	isExpanded,
	onExpand,
}) {
	return (
		<div
			className={`bg-card-${
				index % 5
			} rounded-lg shadow-lg p-4 cursor-pointer transition-all ${
				isExpanded ? 'max-h-[500px] overflow-auto' : 'max-h-32'
			}`}
			onClick={onExpand}
		>
			{/* Title & Short Description */}
			<h2 className="text-lg font-bold text-gray-800">{habit.title}</h2>
			{!isExpanded && (
				<p className="text-gray-600 text-sm">
					{habit.shortDescription}
				</p>
			)}

			{/* Expanded Details */}
			{isExpanded && (
				<div className="mt-4">
					<p className="text-gray-700">{habit.detailedDescription}</p>
					<button
						className="mt-3 bg-subtle-background text-charcoal py-2 px-4 rounded-lg hover:bg-olive-earth flex justify-center mx-auto  transition-transform active:scale-95"
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
