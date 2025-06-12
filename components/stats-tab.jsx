import '@/app/globals.css';
import StatsCard from './stats-card';
import styles from '@/styles/goals-tab.module.css';

export default function StatsTab({
	goals,
	onUpdateGoal,
	isSignedIn,
	isLoading,
}) {
	// Receive isLoading prop
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

	// ONLY CHANGE: Sort alphabetically by title (case-insensitive)
	consolidatedGoals.sort((a, b) =>
		a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
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
		<>
			<h2 className="text-3xl font-bold m-4 text-primary flex flex-col items-center justify-center">
				Statistics
			</h2>
			<div className="flex justify-center mt-6">
				<div className="grid grid-cols-1 gap-x-4 gap-y-4 max-w-sm sm:max-w-md md:max-w-lg">
					{consolidatedGoals.map((goal) => (
						<div className="m-2" key={goal.id}>
							<StatsCard
								goal={{
									...goal,
									completedDays:
										goal.completedDays &&
										typeof goal.completedDays === 'object'
											? goal.completedDays
											: {},
								}}
								onUpdateGoal={onUpdateGoal}
							/>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
