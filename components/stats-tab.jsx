import '@/app/globals.css';
import StatsCard from './stats-card';
import styles from '@/styles/goals-tab.module.css';
import React, { useState, useEffect } from 'react';

export default function StatsTab({
	goals,
	onUpdateGoal,
	isSignedIn,
	isLoading,
}) {
	const uniqueGoalsAggregated = goals.reduce((acc, goal) => {
		const safeGoalCompletedDays =
			goal.completedDays && typeof goal.completedDays === 'object'
				? goal.completedDays
				: {};

		if (!acc[goal.title]) {
			acc[goal.title] = {
				...goal,
				_allCompletedDaysInstances: [safeGoalCompletedDays],
			};
		} else {
			acc[goal.title]._allCompletedDaysInstances.push(
				safeGoalCompletedDays
			);
		}
		return acc;
	}, {});

	const consolidatedGoals = Object.values(uniqueGoalsAggregated).map(
		(goal) => {
			const finalCompletedDays = {};
			goal._allCompletedDaysInstances.forEach((instanceCompletedDays) => {
				if (instanceCompletedDays) {
					Object.keys(instanceCompletedDays).forEach((year) => {
						if (instanceCompletedDays[year]) {
							Object.keys(instanceCompletedDays[year]).forEach(
								(month) => {
									if (instanceCompletedDays[year][month]) {
										Object.keys(
											instanceCompletedDays[year][month]
										).forEach((day) => {
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
										});
									}
								}
							);
						}
					});
				}
			});
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
			<div className="flex flex-col items-center mt-6">
				<div className="w-[90%] max-w-sm">
					{consolidatedGoals.length > 0 && (
						<div className="mb-3">
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
					)}
					{selectedGoal ? (
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
					) : (
						<p className="text-gray-600">No goals to display.</p>
					)}
				</div>
			</div>
		</div>
	);
}
