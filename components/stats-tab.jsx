import '@/app/globals.css'; // Reverted to original path alias
import StatsCard from './stats-card'; // Reverted to original relative path
import styles from '@/styles/goals-tab.module.css'; // Reverted to original path alias
import React, { useState, useEffect } from 'react';

// Define a common width class that will apply to both the dropdown's wrapper and the StatsCard.
// This will set a consistent maximum width and center both.
const COMMON_CONTENT_WIDTH_CLASSES = 'w-full max-w-lg mx-auto'; // Using max-w-lg (640px) as a consistent width example.

export default function StatsTab({
	goals,
	onUpdateGoal,
	isSignedIn,
	isLoading,
}) {
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

	consolidatedGoals.sort((a, b) =>
		a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
	);

	const [selectedGoalTitle, setSelectedGoalTitle] = useState('');

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
			{/*
                This outer div will now center its content (the dropdown and calendar card).
                The centering of the dropdown and calendar is handled by their individual
                application of COMMON_CONTENT_WIDTH_CLASSES.
            */}
			<div className="flex flex-col items-center mt-6">
				{consolidatedGoals.length > 0 && (
					<div
						className={`mb-4 ${COMMON_CONTENT_WIDTH_CLASSES} p-4 rounded-md shadow-lg border-1 border-gray-500`}
					>
						<label htmlFor="goal-select" className="sr-only">
							Select a Goal
						</label>
						<select
							id="goal-select"
							// className={`${styles.customSelect} block w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
							className={`${styles.customSelect} block w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
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
					// statsCardContainer's width is now directly controlled by COMMON_CONTENT_WIDTH_CLASSES
					<div
						className={`statsCardContainer ${COMMON_CONTENT_WIDTH_CLASSES}`}
					>
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
	);
}
