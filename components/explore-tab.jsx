export default function ExploreTab() {
	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold mb-4">Explore New Habits</h2>
			<HabitSelectionGrid
				habits={HABITS_DATA}
				onSelect={handleSelectHabit}
			/>
		</div>
	);
}
