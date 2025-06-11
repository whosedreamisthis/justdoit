// minimizable-card.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import ScrollOnExpand from '../hooks/scroll-on-expand'; // <--- ADD THIS IMPORT
import styles from '@/styles/explore-card.module.css';
import { useUser } from '@clerk/nextjs'; // Import useUser
import { toast } from 'react-hot-toast';

export default function MinimizableCard({
	index,
	habit,
	onSelect,
	isExpanded,
	onExpand,
}) {
	const cardRef = ScrollOnExpand(isExpanded); // <--- ADD THIS LINE
	const { isSignedIn } = useUser(); // Get isSignedIn status

	return (
		<div
			ref={cardRef} // <--- ADD THIS PROP
			className={`${habit.color} card rounded-lg p-4 transition-all ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0 shadow-none'
			}`}
			onClick={() => {
				onExpand();
			}}
		>
			{/* Title &  Description */}
			<h2 className="text-lg font-bold text-gray-800">{habit.title}</h2>

			<p className="text-gray-600 text-sm">{habit.description}</p>

			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					<div
						className={`${styles.addButtonContainer} flex flex-row justify-end items-end gap-2`}
					>
						<button
							className={`addButton`}
							onClick={(e) => {
								e.stopPropagation(); // Prevent card collapse
								if (!isSignedIn) {
									toast.error(
										'You need to sign in before adding goals.'
									);
									return;
								}
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
