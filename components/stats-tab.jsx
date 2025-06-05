import '@/app/globals.css';
import StatsCard from './stats-card';

export default function StatsTab({ goals }) {
	return (
		// <div className="rounded-xl bg-subtle-background p-4 sm:p-6">
		<div className="flex justify-center mt-6">
			<div className="grid grid-cols-2 gap-x-4 gap-y-4 max-w-sm sm:max-w-md md:max-w-lg">
				{goals.map((goal) => (
					<div className="stats-container" key={goal.id}>
						<StatsCard goal={goal} />
					</div>
				))}
			</div>
		</div>
		// </div>
	);
}
