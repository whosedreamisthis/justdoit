import MinimizableCard from '@/components/minimizable-card';

export default function ExploreTab({ habits, onSelect }) {
	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold mb-4">Explore New Habits</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{habits.map((habit) => (
					<MinimizableCard
						key={habit.id}
						habit={habit}
						onSelect={onSelect}
					/>
				))}
			</div>
		</div>
	);
}
