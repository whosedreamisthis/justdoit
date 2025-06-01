import { useState } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import { useGoals } from './goals-context'; // ✅ Import the context
import '@/app/globals.css';
export default function GoalsTab({ onEdit }) {
	const { goals, setGoals } = useGoals();

	const [expandedGoal, setExpandedGoal] = useState(null);
	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
	};
	const sortedGoals = [...goals].sort((a, b) => {
		if (a.progress === 100 && b.progress !== 100) return 1; // Completed moves down
		if (b.progress === 100 && a.progress !== 100) return -1;
		return 0;
	});

	const moveCompletedGoal = (goalId) => {
		console.log('move completed goal', goalId);
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? { ...goal, progress: 100, moving: true }
					: goal
			);

			return updatedGoals;
		});

		setTimeout(() => {
			const goalElement = document.getElementById(`goal-${goalId}`);
			if (goalElement) {
				goalElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				}); // ✅ Scroll first
			}
		}, 50); // ✅ Delay to let movement happen first

		setTimeout(() => {
			setGoals((prevGoals) =>
				prevGoals.sort((a, b) => (a.progress === 100 ? 1 : -1))
			);
		}, 600); // ✅ Delay sorting after scrolling
	};
	const moveIncompleteGoal = (goalId, newProgress) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, progress: newProgress } : goal
			);

			return updatedGoals.sort((a, b) => {
				if (a.progress === 100 && b.progress !== 100) return 1; // ✅ Keeps completed goals down
				if (b.progress === 100 && a.progress !== 100) return -1; // ✅ Moves incomplete goals back up
				return a.progress - b.progress; // ✅ Sorts based on actual progress
			});
		});
		setTimeout(() => {
			const goalElement = document.getElementById(`goal-${goalId}`);
			if (goalElement) {
				goalElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				}); // ✅ Moves viewport with the goal
			}
		}, 100);
	};

	return (
		<div className="p-6 bg-subtle-background">
			{' '}
			{/* ✅ Background stays soft */}
			<h2 className="text-3xl font-bold text-primary mb-4">
				Track Your Goals
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedGoals.map((goal, index) => (
					<div
						key={goal.id}
						className={`rounded-lg shadow-lg p-4 transition-all bg-card-${
							index % 5
						}`}
					>
						<MinimizableGoalCard
							goal={goal}
							onEdit={onEdit}
							isExpanded={expandedGoal === goal.id}
							onExpand={() => handleExpand(goal.id)}
							onComplete={() => moveCompletedGoal(goal.id)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
