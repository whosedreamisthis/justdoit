import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';

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
			} card rounded-lg p-4 cursor-pointer transition-all ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0 shadow-none'
			} border border-black`}
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
			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					<div className="flex flex-row justify-end items-end gap-2">
						<FontAwesomeIcon
							icon={faSquareCheck}
							className="far goal-card-icon z-20"
							onClick={(e) => {
								e.stopPropagation(); // Prevent card collapse
								onSelect(habit.id);
							}}
						></FontAwesomeIcon>
					</div>
				</div>
			)}
		</div>
	);
}
