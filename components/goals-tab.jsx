// goals-tab.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
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

	// Create a sorted copy of `goals` using useMemo
	const sortedGoals = useMemo(() => {
		return [...goals].sort(
			(a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
		);
	}, [goals]); // Re-sorts whenever `goals` changes

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

	const updateProgress = (goalId, newProgress) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? {
							...goal,
							progress: newProgress ?? 0,
							isCompleted: newProgress >= 100,
					  }
					: goal
			);

			const sortedGoals = updatedGoals.sort(
				(a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
			);

			localStorage.setItem('userGoals', JSON.stringify(sortedGoals));
			return sortedGoals;
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
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{sortedGoals.map((goal, index) => (
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
							onProgressChange={() => moveIncompleteGoal(goal.id)}
							updateProgress={(id, newProgress) =>
								updateProgress(id, newProgress)
							}
							onDelete={handleDelete}
							onUpdateGoal={onUpdateGoal}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
