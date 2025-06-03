export default function MinimizableCard({
	index,
	habit,
	onSelect,
	isExpanded,
	onExpand,
}) {
	console.log('short', habit.shortDescription);

	console.log('long', habit.detailedDescription);
	return (
		<div
			className={`${
				habit.color
			} rounded-lg p-4 cursor-pointer transition-all ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0 shadow-none'
			}`}
			onClick={() => {
				console.log(`Expanding habit: ${habit.title}`); // ✅ Debug log
				onExpand();
			}}
		>
			{/* Title & Short Description */}
			<h2 className="text-lg font-bold text-gray-800">{habit.title}</h2>

			<p className="text-gray-600 text-sm">{habit.shortDescription}</p>

			{isExpanded && (
				<div className="mt-4 text-gray-700 text-sm z-10">
					{habit.detailedDescription}
				</div>
			)}

			{/* Expanded Details */}
			{isExpanded && (
				<div className="mt-4">
					<button
						className="mt-3 bg-subtle-background text-charcoal py-2 px-4 rounded-lg hover:bg-olive-earth flex justify-center mx-auto  transition-transform active:scale-95 border-2"
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
