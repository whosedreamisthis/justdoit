import { useState } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';
import { useGoals } from './goals-context'; // ✅ Import the context

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
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, progress: 100 } : goal
			);

			return updatedGoals.sort((a, b) => (a.progress === 100 ? 1 : -1)); // Sort completed goals to the bottom
		});
	};

	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold mb-4">Track Your Goals</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedGoals.map((goal) => {
					const updatedGoal = {
						title: goal.title,
						shortDescription: goal.shortDescription,
						totalSegments:
							goal.title === 'Drink 8 Glasses of Water' ? 8 : 1, // Water has 8 segments, others have 1
					};

					return (
						<MinimizableGoalCard
							key={goal.id}
							goal={updatedGoal}
							onEdit={onEdit}
							isExpanded={expandedGoal === goal.id}
							onExpand={() => handleExpand(goal.id)}
							onComplete={() => moveCompletedGoal(goal.id)}
						/>
					);
				})}
			</div>
		</div>
	);
}
