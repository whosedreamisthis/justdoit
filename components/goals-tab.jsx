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

	// Removed scrollAdjustmentPending ref as it's no longer needed for scrolling
	// prevGoalsRef is kept as it's useful for detecting changes for FLIP animation (even if not used for scroll)
	const prevGoalsRef = useRef([]);

	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1; // Adjust to make Monday=0, Sunday=6
	}

	const sortedGoals = useMemo(() => {
		return [...goals].sort((a, b) => {
			// Prioritize uncompleted goals over completed goals
			if (a.isCompleted && !b.isCompleted) {
				return 1; // 'a' (completed) comes after 'b' (uncompleted)
			}
			if (!a.isCompleted && b.isCompleted) {
				return -1; // 'a' (uncompleted) comes before 'b' (completed)
			}

			// If both are completed or both are uncompleted, sort by createdAt descending (most recent first)
			return (
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
			);
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
			// Removed setting scrollAdjustmentPending here
		},
	}));

	useLayoutEffect(() => {
		if (!pendingAnimation.current) {
			prevGoalsRef.current = goals; // Update prevGoalsRef for next render's comparison
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

		// --- Removed all scroll adjustment logic from here ---
		// This entire block has been removed:
		/*
        let targetGoalToScroll = null;
        let scrollDirection = null;

        if (prevGoalsRef.current && goals) {
            for (const currentGoal of goals) {
                const prevGoal = prevGoalsRef.current.find(g => g.id === currentGoal.id);
                if (prevGoal) {
                    if (prevGoal.isCompleted && !currentGoal.isCompleted) {
                        targetGoalToScroll = currentGoal;
                        scrollDirection = 'top';
                        break;
                    } else if (!prevGoal.isCompleted && currentGoal.isCompleted) {
                        targetGoalToScroll = currentGoal;
                        scrollDirection = 'bottom';
                        break;
                    }
                }
            }
        }

		if (scrollAdjustmentPending.current && targetGoalToScroll) {
			const nodeToScroll = goalRefs.current[targetGoalToScroll.id];
			setTimeout(() => {
				if (nodeToScroll) {
					requestAnimationFrame(() => {
                        const rect = nodeToScroll.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const topPadding = 30;
                        const bottomNavHeight = 80;
                        const bottomPadding = 30;
                        let scrollAmount = 0;
                        if (scrollDirection === 'top') {
                            scrollAmount = rect.top - topPadding;
                        } else if (scrollDirection === 'bottom') {
                            if (rect.bottom > (viewportHeight - bottomNavHeight - bottomPadding)) {
                                scrollAmount = rect.bottom - (viewportHeight - bottomNavHeight - bottomPadding);
                            }
                        }
                        if (scrollAmount !== 0) {
                            window.scrollBy({
                                top: scrollAmount,
                                behavior: 'smooth',
                            });
                        }
					});
				}
				scrollAdjustmentPending.current = false;
			}, 150);
		} else {
			scrollAdjustmentPending.current = false;
		}
        */
		// --- End of removed scroll adjustment logic ---

		prevGoalPositions.current = {};
		pendingAnimation.current = false;
		prevGoalsRef.current = goals; // Still needed for FLIP to detect position changes

		return () => {
			cleanupFunctions.forEach((fn) => fn());
		};
	}, [sortedGoals, goals]); // Depend on both sortedGoals and goals

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
				<div className="loader"></div>
			</div>
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
