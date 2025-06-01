export default function ExploreTab({ habits }) {
	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold mb-4">Explore New Habits</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{habits.map((habit) => (
					<div
						key={habit.id}
						className="bg-white rounded-lg shadow-lg p-4"
					>
						<h2 className="text-lg font-bold text-gray-800">
							{habit.title}
						</h2>
						<p className="text-gray-600 text-sm">
							{habit.shortDescription}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
