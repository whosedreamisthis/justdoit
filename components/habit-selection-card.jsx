function HabitSelectionCard({ habit, onSelect }) {
	return (
		<div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center cursor-pointer transition-transform hover:scale-105">
			<img
				src={habit.icon}
				alt={habit.title}
				className="w-16 h-16 mb-3"
			/>
			<h2 className="text-lg font-bold text-gray-800">{habit.title}</h2>
			<p className="text-gray-600 text-sm text-center">
				{habit.shortDescription}
			</p>
			<button
				className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
				onClick={() => onSelect(habit.id)}
			>
				Select Habit
			</button>
		</div>
	);
}
