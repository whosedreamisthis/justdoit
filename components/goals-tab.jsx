import { useState, useEffect } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import { useGoals } from './goals-context'; // ✅ Import the context
import '@/app/globals.css';

export default function GoalsTab({ goals, onEdit, onReSort, setGoals }) {
	const [expandedGoal, setExpandedGoal] = useState(null);

	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
	};
	const updateProgress = (goalId, newProgress) => {
		console.log(
			'updateProgress goalId',
			goalId,
			'newProgress',
			newProgress
		);

		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) => {
				return goal.id === goalId
					? { ...goal, progress: newProgress }
					: goal;
			});

			localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // ✅ Ensure persistence
			return updatedGoals;
		});
	};

	const moveCompletedGoal = (goalId) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals
				.map((goal) =>
					goal.id === goalId
						? { ...goal, progress: 100, moving: true }
						: goal
				)
				.sort((a, b) => (a.progress === 100 ? 1 : -1));

			localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // ✅ Store changes

			onReSort(updatedGoals);
			return updatedGoals;
		});

		setTimeout(() => {
			const goalElement = document.getElementById(`goal-${goalId}`);
			if (goalElement) {
				goalElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}, 50);
	};
	const moveIncompleteGoal = (goalId) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? {
							...goal,

							progress: goal.progress - 100 / goal.totalSegments,
					  } // ✅ Adjust progress by segment size
					: goal
			);

			localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // ✅ Ensure persistence
			return updatedGoals;
		});

		setTimeout(() => {
			setGoals((prevGoals) => [...prevGoals]); // ✅ Retain sorting logic without modifying progress
		}, 100);
	};

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
		<div className="p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary">
				Track Your Goals
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{goals.map((goal, index) => {
					return (
						<div
							id={`goal-${goal.id}`}
							key={goal.id}
							className={`rounded-xl shadow-md`}
							style={{ backgroundColor: `${goal.color}` }}
						>
							{' '}
							{/* ✅ Adds animation */}
							<MinimizableGoalCard
								goal={goal}
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
