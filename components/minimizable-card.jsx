// minimizable-card.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import ScrollOnExpand from '../hooks/scroll-on-expand'; // <--- ADD THIS IMPORT

export default function MinimizableCard({
	index,
	habit,
	onSelect,
	isExpanded,
	onExpand,
}) {
	const cardRef = ScrollOnExpand(isExpanded); // <--- ADD THIS LINE

	return (
		<div
			ref={cardRef} // <--- ADD THIS PROP
			className={`${
				habit.color
			} card rounded-lg p-4 cursor-pointer transition-all ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0 shadow-none'
			}`}
			onClick={() => {
				onExpand();
			}}
		>
			{/* Title & Short Description */}
			<h2 className="text-lg font-bold text-gray-800">{habit.title}</h2>

			<p className="text-gray-600 text-sm">{habit.description}</p>

			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					<div className="add-button-container flex flex-row justify-end items-end gap-2">
						<button
							className="add-button"
							onClick={(e) => {
								e.stopPropagation(); // Prevent card collapse
								onSelect(habit);
							}}
						>
							Add
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
