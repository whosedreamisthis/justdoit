import '@/app/globals.css';
import StatsCard from './stats-card';

export default function StatsTab({ goals, onUpdateGoal }) {
	return (
		<>
			<h2 className="text-3xl font-bold m-4 text-primary flex flex-col items-center justify-center">
				Statistics 2
			</h2>
			<div className="flex justify-center mt-6">
				<div className="grid grid-cols-1 gap-x-4 gap-y-4 max-w-sm sm:max-w-md md:max-w-lg">
					{goals.map((goal) => (
						<div className="stats-container m-2" key={goal.id}>
							<StatsCard
								goal={goal}
								onUpdateGoal={onUpdateGoal}
							/>
						</div>
					))}
				</div>
			</div>
		</>
		// </div>
	);
}
