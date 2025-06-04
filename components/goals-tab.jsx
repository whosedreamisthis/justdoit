// goals-tab.jsx
import { useState, useEffect, useRef } from 'react';
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
	const [currentDayIndex, setCurrentDayIndex] = useState(
		getDayOfWeekIndex(new Date())
	);

	const goalRefs = useRef({});

	function getDayOfWeekIndex(date) {
		const day = date.getDay();
		return day === 0 ? 6 : day - 1;
	}

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

	const handleExpand = (id) => {
		setExpandedGoal((prevExpandedGoal) => {
			const newExpandedGoal = prevExpandedGoal === id ? null : id;

			if (newExpandedGoal !== null) {
				setTimeout(() => {
					const element = goalRefs.current[newExpandedGoal];
					if (element) {
						const rect = element.getBoundingClientRect();
						const viewportHeight = window.innerHeight;

						// Scroll **only if the element is not fully visible**
						if (!(rect.top >= 0 && rect.bottom <= viewportHeight)) {
							element.scrollIntoView({
								behavior: 'smooth',
								block: 'center',
							});
						}
					}
				}, 350); // Delay remains for smooth expansion
			}
			return newExpandedGoal;
		});
	};

	const updateDaysProgress = (goalId, newDaysProgress) => {
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId
					? {
							...goal,
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
			...goals.filter((goal) => !goal.completed),
			...goals.filter((goal) => goal.completed),
		];
	};

	const decreaseProgress = (e) => {
		e.stopPropagation();
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
							ref={(el) => (goalRefs.current[goal.id] = el)}
						>
							<MinimizableGoalCard
								goal={goal}
								currentDayIndex={currentDayIndex}
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
								onUpdateGoal={onUpdateGoal}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
