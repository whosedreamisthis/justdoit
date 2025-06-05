import '@/app/globals.css';
import StatsCard from './stats-card';
export default function StatsTab({ goals }) {
	return (
		<div className="goals-container p-3 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary">
				Track Your Goals
			</h2>
			<div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{goals.map((goal, index) => {
					return (
						<div
							id={`goal-${goal.id}`}
							key={goal.id}
							data-goal-id={goal.id}
							className={`rounded-xl shadow-md goal-item`}
							style={{ backgroundColor: goal.color }}
						>
							<StatsCard goal={goal} />
						</div>
					);
				})}
			</div>
		</div>
	);
}
