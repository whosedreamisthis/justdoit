import '@/app/globals.css'; // Original path alias
import StatsCard from './stats-card'; // Original relative path
import styles from '@/styles/goals-tab.module.css'; // Original path alias
import React, { useState, useEffect } from 'react';

// Define common classes for the outer container of both the dropdown and the StatsCard.
// This will now enforce a consistent 90% width relative to the viewport, and center it.
// We'll apply visual styling here as well.
const COMMON_OUTER_STYLES = 'rounded-md '; // Enforces 90% width and centers.

export default function StatsTab({
	goals,
	onUpdateGoal,
	isSignedIn,
	isLoading,
}) {
	// Step 1: Collect all completedDays objects for each unique goal title
	const uniqueGoalsAggregated = goals.reduce((acc, goal) => {
		const safeGoalCompletedDays =
			goal.completedDays && typeof goal.completedDays === 'object'
				? goal.completedDays
				: {};

		if (!acc[goal.title]) {
			acc[goal.title] = {
				...goal,
				// Store all completedDays objects for this title for later aggregation
				_allCompletedDaysInstances: [safeGoalCompletedDays],
			};
		} else {
			acc[goal.title]._allCompletedDaysInstances.push(
				safeGoalCompletedDays
			);
		}
		return acc;
	}, {});

	// Step 2: Process uniqueGoalsAggregated to create consolidatedGoals with actual completedDays
	const consolidatedGoals = Object.values(uniqueGoalsAggregated).map(
		(goal) => {
			const finalCompletedDays = {};

			// Iterate through each instance's completedDays for this consolidated goal
			goal._allCompletedDaysInstances.forEach((instanceCompletedDays) => {
				if (instanceCompletedDays) {
					// Ensure it's not null/undefined
					Object.keys(instanceCompletedDays).forEach((year) => {
						if (instanceCompletedDays[year]) {
							Object.keys(instanceCompletedDays[year]).forEach(
								(month) => {
									if (instanceCompletedDays[year][month]) {
										Object.keys(
											instanceCompletedDays[year][month]
										).forEach((day) => {
											// If this instance has the day completed (true),
											// then the finalCompletedDays should also mark it true.
											// This implements the "at least one instance completed" logic.
											if (
												instanceCompletedDays[year][
													month
												][day]
											) {
												if (!finalCompletedDays[year])
													finalCompletedDays[year] =
														{};
												if (
													!finalCompletedDays[year][
														month
													]
												)
													finalCompletedDays[year][
														month
													] = {};
												finalCompletedDays[year][month][
													day
												] = true;
											}
											// If it's false or undefined, we don't do anything for this day
											// at this stage, as it will remain false/undefined in finalCompletedDays
											// UNLESS another instance marks it true.
										});
									}
								}
							);
						}
					});
				}
			});

			// After iterating through all instances for this goal,
			// finalCompletedDays now contains days that were marked true by at least one instance.
			// Days that were never marked true by any instance will simply be absent,
			// which implies they are incomplete/false, correctly addressing the bug.

			// Clean up the temporary _allCompletedDaysInstances property
			const { _allCompletedDaysInstances, ...rest } = goal;
			return {
				...rest,
				completedDays: finalCompletedDays,
			};
		}
	);

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
			{/* This div itself is now the consistent 90% wide, centered container */}
			<div className="flex flex-col items-center mt-6">
				{/* Parent for consistent spacing, centers its children */}
				{consolidatedGoals.length > 0 && (
					<div className={`mb-1  pt-2 pb-0`}>
						{/* Outer container with shared width, centering, and visual styling */}
						<div className="p-4 w-full">
							{/* Inner div for consistent padding. Make it w-full of its parent */}
							<label htmlFor="goal-select" className="sr-only">
								Select a Goal
							</label>
							<select
								id="goal-select"
								className={`${styles.customSelect} block w-full px-6 py-4 text-base text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
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
