// minimizable-card.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import ScrollOnExpand from '../hooks/scroll-on-expand';
import styles from '@/styles/explore-card.module.css';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

export default function MinimizableCard({
	index,
	habit,
	onSelect,
	isExpanded,
	onExpand,
}) {
	// --- IMPORTANT CHANGE HERE ---
	// Pass false for the 'editModeActive' parameter as it's not applicable here
	const cardRef = ScrollOnExpand(isExpanded, false);
	// --- END IMPORTANT CHANGE ---

	const { isSignedIn } = useUser();

	return (
		<div
			ref={cardRef} // Attach the ref to the main card div
			className={`${habit.color} card rounded-lg p-4 transition-all ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10' // Keep overflow-auto for internal card scrolling
					: 'max-h-32 overflow-hidden z-0 shadow-none' // This will be handled by parent, but keeping for initial state
			}`}
			onClick={() => {
				onExpand();
			}}
		>
			{/* Title &  Description */}
			<h2 className="text-lg font-bold text-gray-800">{habit.title}</h2>

			<p className="text-gray-600 text-sm mb-5">{habit.description}</p>

			{isExpanded && (
				<div className="flex flex-col h-full rounded-lg">
					<div
						className={`${styles.addButtonContainer} flex flex-row justify-end items-end gap-2`}
					>
						<button
							className={`addButton`}
							onClick={(e) => {
								e.stopPropagation();
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
