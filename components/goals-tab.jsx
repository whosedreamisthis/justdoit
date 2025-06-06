// goals-tab.jsx
import { useState, useEffect, useRef } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import '@/app/globals.css';

export default function GoalsTab({
	goals,
	onEdit,
	onReSort,
	setGoals,
	onUpdateGoal,
}) {
	const [expandedGoal, setExpandedGoal] = useState(null);
	const [movingGoal, setMovingGoal] = useState(null);
	const [transitioningGoals, setTransitioningGoals] = useState([]);

	const [currentDayIndex, setCurrentDayIndex] = useState(
		getDayOfWeekIndex(new Date())
	);

	const goalRefs = useRef({});

	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1;
	}

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

	const sortGoals = (currentGoals) => {
		return [...currentGoals].sort((a, b) => {
			const idA = a.id;
			const idB = b.id;

			const timestampA = idA ? parseInt(idA, 10) : 0;
			const timestampB = idB ? parseInt(idB, 10) : 0;

			if (timestampA !== timestampB) {
				return timestampB - timestampA;
			}

			const completionComparison =
				(a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1);
			if (completionComparison !== 0) {
				return completionComparison;
			}
			return a.progress - b.progress;
		});
	};

	const updateProgress = (goalId, newProgress) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) => {
				if (goal.id === goalId) {
					const updatedGoal = {
						...goal,
						progress: newProgress ?? 0,
						isCompleted: newProgress >= 100,
					};

					// Handle completedDays update
					if (newProgress >= 100) {
						const today = new Date();
						const year = today.getFullYear();
						const month = today.getMonth() + 1; // getMonth() is 0-indexed
						const day = today.getDate();

						// Ensure the nested structure exists and update it immutably
						updatedGoal.completedDays = {
							...updatedGoal.completedDays,
						};
						if (!updatedGoal.completedDays[year]) {
							updatedGoal.completedDays[year] = {};
						}
						updatedGoal.completedDays[year] = {
							...updatedGoal.completedDays[year],
						}; // Make a copy of the year object
						if (!updatedGoal.completedDays[year][month]) {
							updatedGoal.completedDays[year][month] = {};
						}
						updatedGoal.completedDays[year][month] = {
							...updatedGoal.completedDays[year][month],
						}; // Make a copy of the month object

						updatedGoal.completedDays[year][month][day] = true;
					} else {
						// If progress goes below 100, unmark the current day as completed
						const today = new Date();
						const year = today.getFullYear();
						const month = today.getMonth() + 1;
						const day = today.getDate();

						if (updatedGoal.completedDays?.[year]?.[month]?.[day]) {
							updatedGoal.completedDays = {
								...updatedGoal.completedDays,
							};
							if (updatedGoal.completedDays[year]) {
								updatedGoal.completedDays[year] = {
									...updatedGoal.completedDays[year],
								};
								if (updatedGoal.completedDays[year][month]) {
									updatedGoal.completedDays[year][month] = {
										...updatedGoal.completedDays[year][
											month
										],
									};
									delete updatedGoal.completedDays[year][
										month
									][day];

									// Clean up empty month or year objects if necessary
									if (
										Object.keys(
											updatedGoal.completedDays[year][
												month
											]
										).length === 0
									) {
										delete updatedGoal.completedDays[year][
											month
										];
									}
								}
								if (
									Object.keys(updatedGoal.completedDays[year])
										.length === 0
								) {
									delete updatedGoal.completedDays[year];
								}
							}
						}
					}
					return updatedGoal;
				}
				return goal;
			});

			localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
			return sortGoals(updatedGoals);
		});
	};

	const moveCompletedGoal = (goalId) => {
		setTransitioningGoals((prev) => [...prev, goalId]);
		setTimeout(() => {
			onReSort(); // Trigger re-sort in parent
			setTransitioningGoals((prev) => prev.filter((id) => id !== goalId));
		}, 300);
	};

	const moveIncompleteGoal = (goalId) => {
		setTransitioningGoals((prev) => [...prev, goalId]);
		setTimeout(() => {
			onReSort(); // Trigger re-sort in parent
			setTransitioningGoals((prev) => prev.filter((id) => id !== goalId));
		}, 300);
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
			<div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{goals.map((goal, index) => {
					return (
						<div
							id={`goal-${goal.id}`}
							key={goal.id}
							data-goal-id={goal.id}
							className={`rounded-xl shadow-md goal-item ${
								transitioningGoals.includes(goal.id)
									? 'moving-up'
									: ''
							}`}
							style={{ backgroundColor: goal.color }}
							ref={(el) => (goalRefs.current[goal.id] = el)}
						>
							<MinimizableGoalCard
								goal={goal}
								isExpanded={expandedGoal === goal.id}
								onExpand={() => handleExpand(goal.id)}
								onComplete={() => moveCompletedGoal(goal.id)}
								onProgressChange={() =>
									moveIncompleteGoal(goal.id)
								}
								updateProgress={(id, newProgress) =>
									updateProgress(id, newProgress)
								}
								onDelete={handleDelete}
								onUpdateGoal={onUpdateGoal}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
