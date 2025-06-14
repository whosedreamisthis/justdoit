import MyCalendar from './calendar';
import styles from '@/styles/stats-card.module.css';

export default function StatsCard({ goal, onUpdateGoal }) {
	const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();

	const daysInMonth = getDaysInMonth(currentMonth, currentYear);
	const daysArray = Array(daysInMonth).fill(false); // currently unused

	return (
		<div
			className="p-7 rounded-md shadow-lg"
			style={{ backgroundColor: goal.color }}
		>
			{/* <h2 className={`${styles.tabTitle} text-md font-bold text-gray-800 mb-4`}>
				{goal.title}
			</h2> */}
			<MyCalendar
				key={goal.id} // This is the corrected line: key is a prop, not a child
				goalId={goal.id}
				completedDays={goal.completedDays}
				onUpdateGoal={onUpdateGoal}
			/>
		</div>
	);
}
