import '@/app/globals.css';
import StatsCard from './stats-card';

export default function StatsTab({ goals, onUpdateGoal }) {
	// Consolidate goals by habit title
	const uniqueGoals = goals.reduce((acc, goal) => {
		if (!acc[goal.title]) {
			acc[goal.title] = {
				...goal,
				completedDays: { ...goal.completedDays },
			};
		} else {
			Object.keys(goal.completedDays).forEach((day) => {
				acc[goal.title].completedDays[day] =
					acc[goal.title].completedDays[day] ||
					goal.completedDays[day];
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
								goal={goal}
								onUpdateGoal={onUpdateGoal}
							/>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
