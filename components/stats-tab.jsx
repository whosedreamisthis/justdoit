import '@/app/globals.css';
import StatsCard from './stats-card';

export default function StatsTab({ goals, onUpdateGoal }) {
	// Consolidate goals by habit title
	const uniqueGoals = goals.reduce((acc, goal) => {
		// --- ADD THIS SAFETY CHECK FOR CURRENT GOAL'S COMPLETEDDAYS ---
		// Ensure goal.completedDays is always an object before using it.
		// If it's null, undefined, or not an object, default to an empty object.
		const safeGoalCompletedDays =
			goal.completedDays && typeof goal.completedDays === 'object'
				? goal.completedDays
				: {};
		// --- END SAFETY CHECK ---

		if (!acc[goal.title]) {
			acc[goal.title] = {
				...goal,
				completedDays: { ...safeGoalCompletedDays }, // Use the safe version here
			};
		} else {
			// --- ADD THIS SAFETY CHECK FOR ACCUMULATED GOAL'S COMPLETEDDAYS ---
			// Ensure the accumulated goal's completedDays is also an object before merging
			if (
				!acc[goal.title].completedDays ||
				typeof acc[goal.title].completedDays !== 'object'
			) {
				acc[goal.title].completedDays = {};
			}
			// --- END SAFETY CHECK ---

			Object.keys(safeGoalCompletedDays).forEach((day) => {
				// Now safeGoalCompletedDays is guaranteed to be an object
				acc[goal.title].completedDays[day] =
					acc[goal.title].completedDays[day] ||
					safeGoalCompletedDays[day]; // Use the safe version here
			});
		}
		return acc;
	}, {});

	const consolidatedGoals = Object.values(uniqueGoals);

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
									// --- OPTIONAL: Add another safety check here for StatsCard as well ---
									// This ensures StatsCard always receives an object for completedDays
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
