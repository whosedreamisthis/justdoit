// components/goals-tab.jsx
'use client';

import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useImperativeHandle,
	forwardRef,
	useLayoutEffect,
} from 'react'; // Removed isSignedIn from here as it's a prop, not a React hook
import MinimizableGoalCard from './minimizable-goal-card'; // Corrected path
import '@/app/globals.css';
import styles from '@/styles/goals-tab.module.css';
import { archiveGoal } from '@/app/page-helper';
// import { SignedIn } from '@clerk/nextjs'; // Not used in this snippet

// Use forwardRef to receive the ref from the parent (App.js)
const GoalsTab = forwardRef(function GoalsTab(
	{
		goals,
		onEdit,
		onReSort,
		setGoals,
		preSetGoals,
		onUpdateGoal,
		isSignedIn, // This is a prop, correctly received here
	},
	ref
) {
	const [expandedGoal, setExpandedGoal] = useState(null);
	const [currentDayIndex, setCurrentDayIndex] = useState(
		getDayOfWeekIndex(new Date())
	);
	const goalRefs = useRef({});
	const prevGoalPositions = useRef({});
	const pendingAnimation = useRef(false);

	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1; // Adjust to make Monday=0, Sunday=6
	}

	const sortedGoals = useMemo(() => {
		return [...goals].sort((a, b) => {
			// Primary sort: Incomplete goals first
			const completionA = a.isCompleted ? 1 : -1;
			const completionB = b.isCompleted ? 1 : -1;
			if (completionA !== completionB) {
				return completionA - completionB;
			}

			// Secondary sort for incomplete goals: Newest (largest timestamp) first
			if (!a.isCompleted && !b.isCompleted) {
				return (
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
				);
			}
			// Secondary sort for completed goals: Oldest (smallest timestamp) first
			else {
				return (
					new Date(a.createdAt).getTime() -
					new Date(b.createdAt).getTime()
				);
			}
		});
	}, [goals]);

	useImperativeHandle(ref, () => ({
		snapshotPositions: () => {
			for (const goal of sortedGoals) {
				const node = goalRefs.current[goal.id];
				if (node) {
					prevGoalPositions.current[goal.id] =
						node.getBoundingClientRect();
				}
			}
			pendingAnimation.current = true;
		},
	}));

	useLayoutEffect(() => {
		if (!pendingAnimation.current) {
			return;
		}

		const cleanupFunctions = [];
		// let anyGoalMoved = false; // This variable is not used after calculation, can be removed

		for (const goal of sortedGoals) {
			const node = goalRefs.current[goal.id];
			const prevRect = prevGoalPositions.current[goal.id];

			if (node && prevRect) {
				const currentRect = node.getBoundingClientRect();

				if (
					prevRect.top !== currentRect.top ||
					prevRect.left !== currentRect.left
				) {
					// anyGoalMoved = true; // No longer needed

					const deltaX = prevRect.left - currentRect.left;
					const deltaY = prevRect.top - currentRect.top;

					node.style.transition = 'none';
					node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

					// FORCE REFLOW
					node.offsetHeight;

					node.style.transition = 'transform 0.5s ease-out';
					node.style.transform = 'translate(0, 0)';

					const onTransitionEnd = () => {
						node.style.transition = '';
						node.style.transform = '';
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

		prevGoalPositions.current = {};
		pendingAnimation.current = false;

		return () => {
			cleanupFunctions.forEach((fn) => fn());
		};
	}, [sortedGoals]);

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
		const goalToDelete = goals.find((goal) => goal.id === goalId);
		if (goalToDelete) {
			archiveGoal(goalToDelete);
		}

		preSetGoals(
			(prevGoals) => {
				const updatedGoals = prevGoals.filter(
					(goal) => goal.id !== goalId
				);
				// localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // This should be handled by App.js useEffect

				return updatedGoals;
			},
			goals,
			setGoals
		);
	};

	const handleExpand = (goalId) => {
		setExpandedGoal(expandedGoal === goalId ? null : goalId);
	};

	// Removed the destructuring of `isSignedIn` from the top-level `forwardRef` arguments
	// as it was causing a linting error because `isSignedIn` is a prop, not a React hook.
	// It's correctly passed as a prop from App.js.

	if (!isSignedIn) {
		return (
			<h2 className={`${styles.signInMessage}`}>Sign in to add goals.</h2>
		);
	}
	return (
		<div className="p-3 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary flex flex-col items-center justify-center">
				Goals
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{sortedGoals.map((goal) => (
					<div
						id={`goal-${goal.id}`}
						key={goal.id} // This is the correct place for the key
						data-goal-id={goal.id}
						className={`rounded-xl shadow-md ${styles.goalItem}`}
						style={{ backgroundColor: goal.color }}
						ref={(el) => (goalRefs.current[goal.id] = el)}
					>
						<MinimizableGoalCard
							// REMOVED: key={goal.id} from here
							goal={goal}
							isExpanded={expandedGoal === goal.id}
							onExpand={() => handleExpand(goal.id)}
							updateProgress={updateProgress}
							onDelete={handleDelete}
							onUpdateGoal={onUpdateGoal}
							currentDayIndex={currentDayIndex} // Added this if MinimizableGoalCard needs it
						/>
					</div>
				))}
			</div>
		</div>
	);
});

GoalsTab.displayName = 'GoalsTab';
export default GoalsTab;
