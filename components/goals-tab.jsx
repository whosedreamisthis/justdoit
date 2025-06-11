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

	// Ref to track if a scroll adjustment is pending after a re-sort
	const scrollAdjustmentPending = useRef(false);

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
			scrollAdjustmentPending.current = true; // Mark that a scroll adjustment is needed
		},
	}));

	useLayoutEffect(() => {
		if (!pendingAnimation.current) {
			return;
		}

		const cleanupFunctions = [];
		let animatedGoalNodes = []; // Store nodes that are being animated

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

					animatedGoalNodes.push(node); // Add node to list of animated nodes

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

		// --- UPDATED Scroll Adjustment Logic for Sorting ---
		// Perform scroll adjustment after a sufficient delay to allow FLIP animations to mostly settle
		if (scrollAdjustmentPending.current) {
			const firstGoalNode = goalRefs.current[sortedGoals[0]?.id];
			const lastGoalNode =
				goalRefs.current[sortedGoals[sortedGoals.length - 1]?.id];

			setTimeout(() => {
				let scrolled = false;

				// Prioritize scrolling the first goal into view if it's off-screen at the top
				if (firstGoalNode) {
					const rect = firstGoalNode.getBoundingClientRect();
					const topPadding = 20;
					if (rect.top < topPadding) {
						performScrollAdjustment(firstGoalNode);
						scrolled = true;
					}
				}

				// If no scroll happened for the first goal, try to scroll the last goal into view
				// if it's off-screen at the bottom. This handles goals moving down.
				if (!scrolled && lastGoalNode) {
					const rect = lastGoalNode.getBoundingClientRect();
					const viewportHeight = window.innerHeight;
					const bottomNavHeight = 80;
					const bottomPadding = 20;

					if (
						rect.bottom >
						viewportHeight - bottomNavHeight - bottomPadding
					) {
						performScrollAdjustment(lastGoalNode);
						scrolled = true;
					}
				}
				scrollAdjustmentPending.current = false; // Reset the flag after attempting scroll
			}, 400); // Adjusted delay to 400ms (closer to FLIP animation end of 500ms)
		}
		// --- END UPDATED Scroll Adjustment Logic ---

		prevGoalPositions.current = {};
		pendingAnimation.current = false;

		return () => {
			cleanupFunctions.forEach((fn) => fn());
		};
	}, [sortedGoals]); // Depend on sortedGoals to re-run when goal order changes

	// Helper function for scrolling, now solely using window.scrollBy for precise control
	const performScrollAdjustment = (element) => {
		if (!element) return;

		// Directly calculate scroll amount without an initial scrollIntoView
		const rect = element.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const topPadding = 20; // Desired padding from the top of the viewport
		const bottomNavHeight = 80; // Approximate height of your BottomTabs component
		const bottomPadding = 20; // Desired padding from the bottom of the viewport

		let scrollAmount = 0;

		const isTopCutOff = rect.top < topPadding;
		const isBottomCutOff =
			rect.bottom > viewportHeight - bottomNavHeight - bottomPadding;
		const isTallerThanAvailable =
			rect.height >
			viewportHeight - topPadding - bottomNavHeight - bottomPadding;

		if (isTopCutOff) {
			scrollAmount = rect.top - topPadding;
		} else if (isBottomCutOff && !isTallerThanAvailable) {
			scrollAmount =
				rect.bottom -
				(viewportHeight - bottomNavHeight - bottomPadding);
		} else if (isTallerThanAvailable) {
			// If the element is taller than available space, align its top with top padding
			scrollAmount = rect.top - topPadding;
		}

		if (scrollAmount !== 0) {
			window.scrollBy({
				top: scrollAmount,
				behavior: 'smooth',
			});
		}
	};

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
