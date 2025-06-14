// components/stats-tab.js
import '@/app/globals.css';
import StatsCard from './stats-card';
import styles from '@/styles/goals-tab.module.css';
import React, { useEffect } from 'react';

export default function StatsTab({
	goals,
	onUpdateGoal,
	isSignedIn,
	isLoading,
	selectedGoalTitle, // Now received as a prop
	setSelectedGoalTitle, // Now received as a prop
}) {
	console.log('StatsTab: Component rendered.');
	console.log('StatsTab: Props received - goals:', goals);
	console.log(
		'StatsTab: Props received - selectedGoalTitle:',
		selectedGoalTitle
	);

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

	// Ensure sorting logic in StatsTab matches the order you expect for "first goal"
	consolidatedGoals.sort((a, b) =>
		a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
	);

	console.log(
		'StatsTab: consolidatedGoals after sorting:',
		consolidatedGoals.map((g) => g.title)
	);
	if (consolidatedGoals.length > 0) {
		console.log(
			'StatsTab: First consolidated goal title (after sort):',
			consolidatedGoals[0].title
		);
	}

	// Determine which goal title to display in the dropdown and use for StatsCard
	const selectedGoalTitleToDisplay =
		selectedGoalTitle ||
		(consolidatedGoals.length > 0 ? consolidatedGoals[0].title : '');

	// Ensure selectedGoalTitle prop is updated if it's null/empty and goals exist
	useEffect(() => {
		if (!selectedGoalTitle && consolidatedGoals.length > 0) {
			console.log(
				'StatsTab: Initializing selectedGoalTitle based on first sorted goal:',
				consolidatedGoals[0].title
			);
			setSelectedGoalTitle(consolidatedGoals[0].title);
		}
	}, [selectedGoalTitle, consolidatedGoals, setSelectedGoalTitle]);

	const handleSelectChange = (event) => {
		console.log('StatsTab: Select element changed to:', event.target.value);
		setSelectedGoalTitle(event.target.value);
	};

	// Find the actual goal object based on the selected title
	const selectedGoalObject = consolidatedGoals.find(
		(g) => g.title === selectedGoalTitleToDisplay
	);

	console.log(
		'StatsTab: Currently selectedGoalTitleToDisplay:',
		selectedGoalTitleToDisplay
	);
	console.log(
		'StatsTab: Resolved selectedGoalObject:',
		selectedGoalObject ? selectedGoalObject.title : 'None'
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
					{consolidatedGoals.length > 0 ? (
						<>
							<div className="mb-3 rounded-md">
								<label
									htmlFor="goal-select"
									className="sr-only"
								>
									Select a Goal
								</label>
								<select
									id="goal-select"
									className={`${styles.customSelect} block w-full px-6 py-4 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none sm:text-sm`}
									value={selectedGoalTitleToDisplay}
									onChange={handleSelectChange}
								>
									{consolidatedGoals.map((goal) => (
										<option
											key={goal.id}
											value={goal.title}
										>
											{goal.title}
										</option>
									))}
								</select>
							</div>
							{selectedGoalObject ? (
								<StatsCard
									goal={{
										...selectedGoalObject,
										completedDays:
											selectedGoalObject.completedDays &&
											typeof selectedGoalObject.completedDays ===
												'object'
												? selectedGoalObject.completedDays
												: {},
									}}
									onUpdateGoal={onUpdateGoal}
								/>
							) : (
								<p className="text-gray-600">
									No goal selected or found.
								</p>
							)}
						</>
					) : (
						<p className="text-gray-600">
							No goals to display. Add new goals using the
							'Explore' tab.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
