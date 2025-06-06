// goals-tab.jsx
'use client';
import {
	useState,
	useEffect,
	useRef,
	useMemo,
	useImperativeHandle,
	forwardRef,
	useLayoutEffect,
} from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import '@/app/globals.css';

// Use forwardRef to receive the ref from the parent (App.js)
const GoalsTab = forwardRef(function GoalsTab(
	{
		goals,
		onEdit,
		onReSort, // Can effectively be removed now
		setGoals,
		onUpdateGoal,
	},
	ref
) {
	const [expandedGoal, setExpandedGoal] = useState(null);
	const [currentDayIndex, setCurrentDayIndex] = useState(
		getDayOfWeekIndex(new Date())
	);
	const goalRefs = useRef({}); // Stores references to goal DOM elements
	const prevGoalPositions = useRef({}); // Stores positions BEFORE DOM update (the "First" position)
	const pendingAnimation = useRef(false); // Flag to indicate an animation is queued

	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1; // Adjust to make Monday=0, Sunday=6
	}

	// Use useMemo to create a sorted copy of goals for display.
	const sortedGoals = useMemo(() => {
		return [...goals].sort(
			(a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
		);
	}, [goals]);

	// Expose a method for the parent to call to snapshot positions
	useImperativeHandle(ref, () => ({
		snapshotPositions: () => {
			for (const goal of sortedGoals) {
				// Snapshot current positions of displayed goals
				const node = goalRefs.current[goal.id];
				if (node) {
					prevGoalPositions.current[goal.id] =
						node.getBoundingClientRect();
				}
			}
			pendingAnimation.current = true; // Signal that an animation is about to happen
		},
	}));

	// useLayoutEffect is synchronous and runs before paint, ideal for FLIP
	useLayoutEffect(() => {
		if (!pendingAnimation.current) {
			return; // No animation pending
		}

		const cleanupFunctions = [];
		let anyGoalMoved = false;

		// Loop through the *newly sorted* goals to find their current ("Last") positions
		for (const goal of sortedGoals) {
			const node = goalRefs.current[goal.id];
			const prevRect = prevGoalPositions.current[goal.id];

			if (node && prevRect) {
				const currentRect = node.getBoundingClientRect();

				// Check if the goal's position actually changed
				if (
					prevRect.top !== currentRect.top ||
					prevRect.left !== currentRect.left
				) {
					anyGoalMoved = true;

					// INVERT: Calculate the delta and apply transform instantly
					const deltaX = prevRect.left - currentRect.left;
					const deltaY = prevRect.top - currentRect.top;

					node.style.transition = 'none'; // Disable transition temporarily
					node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

					// FORCE REFLOW: Critical for making the "invert" visible before "play"
					// Accessing any layout property forces a synchronous reflow.
					node.offsetHeight;

					// PLAY: Re-enable transition and animate to its new (final) position
					node.style.transition = 'transform 0.5s ease-out'; // Match CSS duration
					node.style.transform = 'translate(0, 0)'; // Animate to final identity transform

					// Clean up inline styles after animation completes
					const onTransitionEnd = () => {
						node.style.transition = ''; // Remove inline transition
						node.style.transform = ''; // Remove inline transform
						node.removeEventListener(
							'transitionend',
							onTransitionEnd
						);
					};

					node.addEventListener('transitionend', onTransitionEnd);
					cleanupFunctions.push(() =>
						node.removeEventListener(
							'transitionend',
							onTransitionEnd
						)
					);
				}
			}
		}

		// Clear previous positions and reset pending flag after processing
		prevGoalPositions.current = {};
		pendingAnimation.current = false; // Reset the flag once animation is initiated

		return () => {
			cleanupFunctions.forEach((fn) => fn());
		};
	}, [sortedGoals]); // Rerun when sortedGoals changes

	// Effect for daily day index update (existing logic, no change needed)
	useEffect(() => {
		const now = new Date();
		const midnightToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);
		const timeUntilMidnight =
			midnightToday.getTime() + 24 * 60 * 60 * 1000 - now.getTime();

		const dayUpdaterTimer = setTimeout(() => {
			setCurrentDayIndex(getDayOfWeekIndex(new Date()));
		}, timeUntilMidnight);

		return () => clearTimeout(dayUpdaterTimer);
	}, []);

	const updateProgress = (goalId, newProgress) => {
		const updatedGoalData = {
			progress: newProgress ?? 0,
			isCompleted: newProgress >= 100,
		};
		onUpdateGoal(goalId, updatedGoalData);
	};

	const handleDelete = (goalId) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.filter((goal) => goal.id !== goalId);
			localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
			return updatedGoals;
		});
	};

	const handleExpand = (goalId) => {
		setExpandedGoal(expandedGoal === goalId ? null : goalId);
	};

	return (
		<div className="goals-container p-3 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary flex flex-col items-center justify-center">
				Track Your Goals
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{sortedGoals.map((goal) => (
					<div
						id={`goal-${goal.id}`}
						key={goal.id}
						data-goal-id={goal.id}
						className={`rounded-xl shadow-md goal-item`}
						style={{ backgroundColor: goal.color }}
						ref={(el) => (goalRefs.current[goal.id] = el)}
					>
						<MinimizableGoalCard
							goal={goal}
							isExpanded={expandedGoal === goal.id}
							onExpand={() => handleExpand(goal.id)}
							updateProgress={updateProgress}
							onDelete={handleDelete}
							onUpdateGoal={onUpdateGoal}
						/>
					</div>
				))}
			</div>
		</div>
	);
}); // Don't forget to close forwardRef

export default GoalsTab;
