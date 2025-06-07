import MyCalendar from './calendar';
export default function StatsCard({ goal, onUpdateGoal }) {
	const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
	const currentYear = currentDate.getFullYear();

	const daysInMonth = getDaysInMonth(currentMonth, currentYear);
	const daysArray = Array(daysInMonth).fill(false);
	return (
		<div
			className={`stats-card p-4 rounded-md shadow-md`}
			style={{ backgroundColor: goal.color }}
		>
			<h2 className="tab-title text-md font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis mb-4">
				{goal.title}
			</h2>
			<MyCalendar
				goalId={goal.id}
				completedDays={goal.completedDays}
				onUpdateGoal={onUpdateGoal} // <--- Pass onUpdateGoal here
			/>
		</div>
	);
}
