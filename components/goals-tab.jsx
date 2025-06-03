// goals-tab.jsx
import { useState, useEffect } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
// import { useGoals } from './goals-context'; // Removed: this context is not used in the provided code
import '@/app/globals.css';

export default function GoalsTab({ goals, onEdit, onReSort, setGoals }) {
	const [expandedGoal, setExpandedGoal] = useState(null);
	const [currentDayIndex, setCurrentDayIndex] = useState(
		getDayOfWeekIndex(new Date())
	);

	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
	}

	// --- MINIMAL CHANGE 1: Update currentDayIndex at midnight ---
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
			midnightToday.getTime() + 24 * 60 * 60 * 1000 - now.getTime(); // Time until next midnight

		const dayUpdaterTimer = setTimeout(() => {
			setCurrentDayIndex(getDayOfWeekIndex(new Date()));
			// To ensure it runs every day, set a new timer for the next midnight
			// This re-runs the useEffect, calculating the new midnight
			// No need to explicitly call updateDaysProgress here as it's done via app.js reset
		}, timeUntilMidnight);

		return () => clearTimeout(dayUpdaterTimer);
	}, []); // Empty dependency array means this runs once on mount, then reschedules itself

	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
	};

	const updateDaysProgress = (goalId, newDaysProgress) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? {
							...goal,
							// --- MINIMAL CHANGE 2: Use completedDays instead of daySquares ---
							completedDays: newDaysProgress ?? [
								false,
								false,
								false,
								false,
								false,
								false,
								false,
							],
					  }
					: goal
			);

			localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
			return sortGoals(updatedGoals);
		});
	};

	const updateProgress = (goalId, newProgress) => {
		console.log(
			'Goal updated:',
			goalId,
			'New progress:',
			newProgress,
			'Completed:',
			newProgress >= 100
		);

		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? {
							...goal,
							progress: newProgress ?? 0,
							completed: newProgress >= 100,
					  }
					: goal
			);

			localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
			return sortGoals(updatedGoals);
		});

		setTimeout(() => {
			const completedGoalElement = document.querySelector(
				`[data-goal-id="${goalId}"]`
			);
			if (completedGoalElement) {
				completedGoalElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
				console.log('Scrolled to completed goal:', goalId);
			} else {
				console.log('Completed goal not found in DOM yet. Retrying...');
				setTimeout(() => {
					const retryCompletedGoalElement = document.querySelector(
						`[data-goal-id="${goalId}"]`
					);
					if (retryCompletedGoalElement) {
						retryCompletedGoalElement.scrollIntoView({
							behavior: 'smooth',
							block: 'end',
						});
						console.log('Scrolled after retry:', goalId);
					}
				}, 100);
			}
		}, 100);
		moveIncompleteGoal(goalId);
	};

	// Note: The below moveCompletedGoal and moveIncompleteGoal functions are not used based on current code structure.
	// They appear to be remnants from a different approach. You can remove them if they are truly unused.
	// The sorting is now handled within updateProgress and updateDaysProgress via sortGoals.
	const moveCompletedGoal = (goalId) => {
		setGoals((prevGoals) =>
			prevGoals.sort((a, b) => (a.progress === 100 ? 1 : -1))
		);
	};
	const moveIncompleteGoal = (goalId) => {
		setGoals((prevGoals) =>
			prevGoals.sort((a, b) => (a.progress === 100 ? 1 : -1))
		);
	};

	const sortGoals = (goals) => {
		return [
			...goals.filter((goal) => !goal.completed),
			...goals.filter((goal) => goal.completed),
		];
	};

	// Note: This decreaseProgress function seems to be a duplicate or old logic.
	// The one in MinimizableGoalCard is the one actually being called.
	// You can remove this function if it's unused.
	const decreaseProgress = (e) => {
		e.stopPropagation();
		const newProgress = Math.max(
			goal.progress - 100 / goal.totalSegments,
			0
		);
		// setProgress(newProgress); // setProgress is not defined here

		if (goal.progress === 100 && newProgress < 100) {
			// onIncomplete(goal.id); // onIncomplete is not defined here
		}
	};
	const deleteGoal = (goalId) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.filter((goal) => goal.id !== goalId);
			localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
			return updatedGoals;
		});
	};

	return (
		<div className="goals-container p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary">
				Track Your Goals
			</h2>
			<div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{goals.map((goal, index) => {
					return (
						<div
							id={`goal-${goal.id}`}
							key={goal.id}
							data-goal-id={goal.id}
							className={`rounded-xl shadow-md goal-item`}
							style={{ backgroundColor: `${goal.color}` }}
						>
							<MinimizableGoalCard
								goal={goal}
								currentDayIndex={currentDayIndex}
								onEdit={onEdit}
								isExpanded={expandedGoal === goal.id}
								onExpand={() => handleExpand(goal.id)}
								onComplete={() => moveCompletedGoal(goal.id)}
								onProgressChange={() =>
									moveIncompleteGoal(goal.id)
								}
								updateProgress={(id, newProgress) =>
									updateProgress(goal.id, newProgress)
								}
								updateDaysProgress={(id, newDaysProgress) =>
									updateDaysProgress(goal.id, newDaysProgress)
								}
								onDelete={deleteGoal}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
