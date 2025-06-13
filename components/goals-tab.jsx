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
} from 'react';
import MinimizableGoalCard from './minimizable-goal-card';
import '@/app/globals.css';
import styles from '@/styles/goals-tab.module.css';

const GoalsTab = forwardRef(function GoalsTab(
	{
		goals,
		onEdit,
		onReSort,
		setGoals,
		preSetGoals,
		onUpdateGoal,
		isSignedIn,
		isLoading,
		onArchiveGoal,
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

	const prevGoalsRef = useRef([]);
	// New ref to track if a scroll adjustment is pending after a re-sort
	const scrollAdjustmentPending = useRef(false);
	// New ref to store the target goal for scrolling
	const targetScrollGoalId = useRef(null);
	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1; // Adjust to make Monday=0, Sunday=6
	}

	const sortedGoals = useMemo(() => {
		return [...goals].sort((a, b) => {
			// Primary sort: Uncompleted goals over completed goals
			if (a.isCompleted && !b.isCompleted) {
				return 1;
			}
			if (!a.isCompleted && b.isCompleted) {
				return -1;
			}

			// Secondary sort: Alphabetically by title (case-insensitive)
			return a.title.localeCompare(b.title, undefined, {
				sensitivity: 'base',
			});
		});
	}, [goals]); // The 'goals' dependency remains to trigger re-sort when goals data changes

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
			prevGoalsRef.current = goals;
			return;
		}

		const cleanupFunctions = [];

		for (const goal of sortedGoals) {
			const node = goalRefs.current[goal.id];
			const prevRect = prevGoalPositions.current[goal.id];

			if (node && prevRect) {
				const currentRect = node.getBoundingClientRect();

				if (
					prevRect.top !== currentRect.top ||
					prevRect.left !== currentRect.left
				) {
					const deltaX = prevRect.left - currentRect.left;
					const deltaY = prevRect.top - currentRect.top;

					node.style.transition = 'none';
					node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

					node.offsetHeight; // Force reflow

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
		prevGoalsRef.current = goals;

		return () => {
			cleanupFunctions.forEach((fn) => fn());
		};
	}, [sortedGoals, goals]);

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
			// `updatedAt` is no longer set here as it's not used for sorting
		};

		onUpdateGoal(goalId, updatedGoalData);
	};

	const handleDelete = (goalId) => {
		const goalToDelete = goals.find((goal) => goal.id === goalId);
		if (goalToDelete) {
			onArchiveGoal(goalToDelete);
		}
	};

	const handleExpand = (goalId) => {
		setExpandedGoal(expandedGoal === goalId ? null : goalId);
	};

	if (!isSignedIn) {
		return (
			<h2 className={`${styles.signInMessage}`}>Sign in to add goals.</h2>
		);
	}

	if (isLoading && goals.length === 0) {
		return (
			<div className="flex justify-center items-center h-full min-h-[200px]">
				\<div className="loader"></div>
			</div>
		);
	}

	if (isSignedIn && goals.length === 0) {
		return (
			<div className="center-flexbox justify-center p-5 align-middle">
				{' '}
				{/* Added centering classes here */}
				<p className="text-gray-600">
					No goals to display. Add new goals using the 'Explore' tab.
				</p>
			</div>
		);
	}

	return (
		<div className="p-3 bg-subtle-background">
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{sortedGoals.map((goal) => (
					<div
						id={`goal-${goal.id}`}
						key={goal.id}
						data-goal-id={goal.id}
						className={`rounded-xl shadow-md ${styles.goalItem}`}
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
							currentDayIndex={currentDayIndex}
							onSetExpanded={(d) => {
								setExpandedGoal(d);
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
});

GoalsTab.displayName = 'GoalsTab';
export default GoalsTab;
