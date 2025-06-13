import '@/app/globals.css'; // Original path alias
import StatsCard from './stats-card'; // Original relative path
import styles from '@/styles/goals-tab.module.css'; // Original path alias
import React, { useState, useEffect } from 'react';

// Define common classes for the outer container of both the dropdown and the StatsCard.
// This will now enforce a consistent 90% width relative to the viewport, and center it.
// We'll apply visual styling here as well.
const COMMON_OUTER_STYLES =
	'w-[90%] mx-auto rounded-md shadow-lg border-1 border-gray-500'; // Enforces 90% width and centers.

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
			{/* This div itself is now the consistent 90% wide, centered container */}
			<div className="flex flex-col items-center mt-6">
				{' '}
				{/* Parent for consistent spacing, centers its children */}
				{consolidatedGoals.length > 0 && (
					<div className={`mb-4 ${COMMON_OUTER_STYLES}`}>
						{' '}
						{/* Outer container with shared width, centering, and visual styling */}
						<div className="p-4 w-full">
							{' '}
							{/* Inner div for consistent padding. Make it w-full of its parent */}
							<label htmlFor="goal-select" className="sr-only">
								Select a Goal
							</label>
							<select
								id="goal-select"
								className={`${styles.customSelect} block w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
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
					</div>
				)}
				{selectedGoal ? (
					// statsCardContainer directly uses COMMON_OUTER_STYLES for consistent width and styling
					<div
						className={`statsCardContainer ${COMMON_OUTER_STYLES}`}
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
