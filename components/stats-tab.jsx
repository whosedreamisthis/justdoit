import '@/app/globals.css';
import StatsCard from './stats-card';
import styles from '@/styles/goals-tab.module.css';
import React, { useState, useEffect } from 'react'; // Import React, useState, useEffect

export default function StatsTab({
	goals,
	onUpdateGoal, // Receive onUpdateGoal prop
	isSignedIn,
	isLoading,
}) {
	// Consolidate goals by habit title
	const uniqueGoals = goals.reduce((acc, goal) => {
		const safeGoalCompletedDays =
			goal.completedDays && typeof goal.completedDays === 'object'
				? goal.completedDays
				: {};

		if (!acc[goal.title]) {
			acc[goal.title] = {
				...goal,
				completedDays: { ...safeGoalCompletedDays },
			};
		} else {
			if (
				!acc[goal.title].completedDays ||
				typeof acc[goal.title].completedDays !== 'object'
			) {
				acc[goal.title].completedDays = {};
			}

			Object.keys(safeGoalCompletedDays).forEach((day) => {
				acc[goal.title].completedDays[day] =
					acc[goal.title].completedDays[day] ||
					safeGoalCompletedDays[day];
			});
		}
		return acc;
	}, {});

	const consolidatedGoals = Object.values(uniqueGoals);

	// Sort alphabetically by title (case-insensitive)
	consolidatedGoals.sort((a, b) =>
		a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
	);

	const [selectedGoalTitle, setSelectedGoalTitle] = useState('');

	// Set default selected goal to the first one available
	useEffect(() => {
		if (consolidatedGoals.length > 0 && !selectedGoalTitle) {
			setSelectedGoalTitle(consolidatedGoals[0].title);
		}
	}, [consolidatedGoals, selectedGoalTitle]);

	const handleSelectChange = (event) => {
		setSelectedGoalTitle(event.target.value);
	};

	const selectedGoal = consolidatedGoals.find(
		(goal) => goal.title === selectedGoalTitle
	);

	if (!isSignedIn) {
		return (
			<div className="center-flexbox justify-center p-5 align-middle">
				<h2 className={`${styles.signInMessage}`}>
					Sign in to add goals and see their statistics here.
				</h2>
			</div>
		);
	}

	// Conditional rendering for the loader
	if (isLoading && goals.length === 0) {
		return (
			<div className="flex justify-center items-center h-full min-h-[200px]">
				<div className="loader"></div>
			</div>
		);
	}

	return (
		<div className={`${styles.statsContainer}`}>
			<h2 className="text-3xl font-bold m-4 text-primary flex flex-col items-center justify-center">
				Statistics
			</h2>
			<div className="flex justify-center mt-6">
				<div className="flex flex-col items-center">
					{consolidatedGoals.length > 0 && (
						<div className="mb-4">
							<label htmlFor="goal-select" className="sr-only">
								Select a Goal
							</label>
							<select
								id="goal-select"
								className="block w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
								value={selectedGoalTitle}
								onChange={handleSelectChange}
							>
								{consolidatedGoals.map((goal) => (
									<option key={goal.id} value={goal.title}>
										{goal.title}
									</option>
								))}
							</select>
						</div>
					)}

					{selectedGoal ? (
						<div className="m-2">
							<StatsCard
								goal={{
									...selectedGoal,
									completedDays:
										selectedGoal.completedDays &&
										typeof selectedGoal.completedDays ===
											'object'
											? selectedGoal.completedDays
											: {},
								}}
								onUpdateGoal={onUpdateGoal}
							/>
						</div>
					) : (
						<p className="text-gray-600">No goals to display.</p>
					)}
				</div>
			</div>
		</div>
	);
}
