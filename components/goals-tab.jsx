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
	const moveIncompleteGoal = (goalId) => {
		console.log('move incomplete goal', goalId);

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
		const totalSegments = goal.totalSegments > 1 ? goal.totalSegments : 1;
		const newProgress = Math.max(progress - 100 / totalSegments, 0);

		setProgress(newProgress);

		// **Ensure sorting happens when progress drops below 100**
		if (progress === 100 && newProgress < 100) {
			onIncomplete(goal.id); // ✅ Trigger movement upwards
		}
	};

	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold mb-4">Track Your Goals</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedGoals.map((goal) => (
					<div
						id={`goal-${goal.id}`}
						key={goal.id}
						className="goal-container"
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
						/>
					</div>
				))}

				{/* {sortedGoals.map((goal) => {
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
				})} */}
			</div>
		</div>
	);
}
