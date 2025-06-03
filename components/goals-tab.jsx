import { useState, useEffect } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import { useGoals } from './goals-context'; // ✅ Import the context
import '@/app/globals.css';

export default function GoalsTab({ goals, onEdit, onReSort, setGoals }) {
	const [expandedGoal, setExpandedGoal] = useState(null);
	const [currentDayIndex, setCurrentDayIndex] = useState(
		getDayOfWeekIndex(new Date())
	);
	function getDayOfWeekIndex(date) {
		// getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		// We want Monday to be 0, Tuesday 1, ..., Sunday 6
		const day = date.getDay();
		return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
	}
	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
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
			return sortGoals(updatedGoals); // ✅ Apply sorting before updating state
		});

		// ✅ Ensure the completed goal scrolls into view
		setTimeout(() => {
			const completedGoalElement = document.querySelector(
				`[data-goal-id="${goalId}"]`
			);
			if (completedGoalElement) {
				completedGoalElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
				console.log('Scrolled to completed goal:', goalId); // ✅ Debug log
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
				}, 100); // ✅ Retry after 500ms if needed
			}
		}, 100);
	};
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
			...goals.filter((goal) => !goal.completed), // ✅ Ongoing goals stay in order
			...goals.filter((goal) => goal.completed), // ✅ Completed goals move to the bottom
		];
	};

	// const moveCompletedGoal = (goalId) => {
	// 	setGoals((prevGoals) => {
	// 		const updatedGoals = prevGoals
	// 			.map((goal) =>
	// 				goal.id === goalId
	// 					? { ...goal, progress: 100, moving: true }
	// 					: goal
	// 			)
	// 			.sort((a, b) => (a.progress === 100 ? 1 : -1));

	// 		localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // ✅ Store changes

	// 		onReSort(updatedGoals);
	// 		return updatedGoals;
	// 	});

	// 	setTimeout(() => {
	// 		const goalElement = document.getElementById(`goal-${goalId}`);
	// 		if (goalElement) {
	// 			goalElement.scrollIntoView({
	// 				behavior: 'smooth',
	// 				block: 'center',
	// 			});
	// 		}
	// 	}, 50);
	// };
	// const moveIncompleteGoal = (goalId) => {
	// 	setGoals((prevGoals) => {
	// 		const updatedGoals = prevGoals.map((goal) =>
	// 			goal.id === goalId
	// 				? {
	// 						...goal,

	// 						progress: goal.progress - 100 / goal.totalSegments,
	// 				  } // ✅ Adjust progress by segment size
	// 				: goal
	// 		);

	// 		localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // ✅ Ensure persistence
	// 		return updatedGoals;
	// 	});

	// 	setTimeout(() => {
	// 		setGoals((prevGoals) => [...prevGoals]); // ✅ Retain sorting logic without modifying progress
	// 	}, 100);
	// };

	const decreaseProgress = (e) => {
		e.stopPropagation();
		const newProgress = Math.max(
			goal.progress - 100 / goal.totalSegments,
			0
		);

		setProgress(newProgress);

		// **Ensure sorting happens when progress drops below 100**
		if (goal.progress === 100 && newProgress < 100) {
			onIncomplete(goal.id); // ✅ Trigger movement upwards
		}
	};
	const deleteGoal = (goalId) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.filter((goal) => goal.id !== goalId);
			localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // ✅ Ensure persistence
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
							{' '}
							{/* ✅ Adds animation */}
							<MinimizableGoalCard
								goal={goal}
								currentDayIndex={currentDayIndex}
								onEdit={onEdit}
								isExpanded={expandedGoal === goal.id}
								onExpand={() => handleExpand(goal.id)}
								onComplete={() => moveCompletedGoal(goal.id)}
								onProgressChange={() =>
									moveIncompleteGoal(goal.id)
								} // ✅ Ensure it's correctly passed
								updateProgress={(id, newProgress) =>
									updateProgress(goal.id, newProgress)
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
