import { useState } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import { useGoals } from './goals-context'; // ✅ Import the context
import '@/app/globals.css';

export default function GoalsTab({ goals, onEdit }) {
	const [sortedGoals, setSortedGoals] = useState(goals);
	const [expandedGoal, setExpandedGoal] = useState(null);
	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
	};
	const sortedGoals2 = [...goals].sort((a, b) => {
		if (a.progress === 100 && b.progress !== 100) return 1; // Completed moves down
		if (b.progress === 100 && a.progress !== 100) return -1;
		return 0;
	});

	const moveCompletedGoal = (goalId) => {
		setSortedGoals((prevGoals) => {
			// ✅ Update progress and sort immediately
			const updatedGoals = prevGoals
				.map((goal) =>
					goal.id === goalId
						? { ...goal, progress: 100, moving: true }
						: goal
				)
				.sort((a, b) => (a.progress === 100 ? 1 : -1));

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
		setSortedGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? { ...goal, progress: Math.max(goal.progress - 10, 0) }
					: goal
			);

			return updatedGoals.sort((a, b) => (a.progress === 100 ? 1 : -1)); // ✅ Ensures sorting
		});

		// **Trigger full state update**
		setTimeout(() => {
			setSortedGoals((prevGoals) => [...prevGoals]); // ✅ Forces React to re-render with new order
		}, 100);
	};

	const decreaseProgress = (e) => {
		e.stopPropagation();
		const totalSegments = goal.totalSegments > 1 ? goal.totalSegments : 1;
		const newProgress = Math.max(progress - 100 / totalSegments, 0);

		setProgress(newProgress);

		// **Ensure sorting happens when progress drops below 100**
		if (progress === 100 && newProgress < 100) {
			onIncomplete(goal.id); // ✅ Trigger movement upwards
		}
	};
	const deleteGoal = (goalId) => {
		setSortedGoals((prevGoals) =>
			prevGoals.filter((goal) => goal.id !== goalId)
		); // ✅ Removes goal
	};

	return (
		<div className="p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary">
				Track Your Goals
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedGoals.map((goal, index) => (
					<div
						id={`goal-${goal.id}`}
						key={goal.id}
						className={`rounded-xl shadow-md bg-card-${index % 5}`}
					>
						{' '}
						{/* ✅ Adds animation */}
						<MinimizableGoalCard
							goal={goal}
							onEdit={onEdit}
							isExpanded={expandedGoal === goal.id}
							onExpand={() => handleExpand(goal.id)}
							onComplete={() => moveCompletedGoal(goal.id)}
							onProgressChange={() => moveIncompleteGoal(goal.id)} // ✅ Ensure it's correctly passed
							onDelete={deleteGoal}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
