function HabitSelectionGrid({ habits, onSelect }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{habits.map((habit) => (
				<HabitSelectionCard
					key={habit.id}
					habit={habit}
					onSelect={onSelect}
				/>
			))}
		</div>
	);
}
