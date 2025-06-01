import { useState } from 'react';
import MinimizableGoalCard from '././minimizable-goal-card';

export default function GoalsTab({ goals, onEdit }) {
	const [expandedGoal, setExpandedGoal] = useState(null);
	const handleExpand = (id) => {
		setExpandedGoal(expandedGoal === id ? null : id); // Toggle expansion
	};
	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold mb-4">Track Your Goals</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{goals.map((goal) => (
					<MinimizableGoalCard
						key={goal.id}
						goal={goal}
						onEdit={onEdit}
						isExpanded={expandedGoal === goal.id}
						onExpand={() => handleExpand(goal.id)}
					/>
				))}
			</div>
		</div>
	);
}
