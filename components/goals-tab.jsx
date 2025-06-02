import { useState, useEffect } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import { useGoals } from './goals-context'; // ✅ Import the context
import '@/app/globals.css';

export default function GoalsTab({ goals, onEdit, onReSort, setGoals }) {
	const [expandedGoal, setExpandedGoal] = useState(null);

	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
	};

	const moveCompletedGoal = (goalId) => {
		setGoals((prevGoals) => {
			// ✅ Update progress and sort immediately
			const updatedGoals = prevGoals
				.map((goal) =>
					goal.id === goalId
						? { ...goal, progress: 100, moving: true }
						: goal
				)
				.sort((a, b) => (a.progress === 100 ? 1 : -1));
			onReSort(updatedGoals);
			return updatedGoals;
		});

		// ✅ Keep scroll delay for better UX
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
					? { ...goal, progress: Math.max(goal.progress - 10, 0) }
					: goal
			);

			return updatedGoals.sort((a, b) => (a.progress === 100 ? 1 : -1)); // ✅ Ensures sorting
		});

		// **Trigger full state update**
		setTimeout(() => {
			setGoals((prevGoals) => [...prevGoals]); // ✅ Forces React to re-render with new order
		}, 100);
	};

	const decreaseProgress = (e) => {
		e.stopPropagation();
		const totalSegments = goal.id === 'hydrate' ? 8 : 1;
		// const totalSegments = goal.totalSegments > 1 ? goal.totalSegments : 1;
		const newProgress = Math.max(progress - 100 / totalSegments, 0);

		setProgress(newProgress);

		// **Ensure sorting happens when progress drops below 100**
		if (progress === 100 && newProgress < 100) {
			onIncomplete(goal.id); // ✅ Trigger movement upwards
		}
	};
	const deleteGoal = (goalId) => {
		setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId)); // ✅ Removes goal
	};

	return (
		<div className="p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary">
				Track Your Goals
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
								onDelete={deleteGoal}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
