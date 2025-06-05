export default function StatsCard({ goal }) {
	const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
	const currentYear = currentDate.getFullYear();

	const daysInMonth = getDaysInMonth(currentMonth, currentYear);
	const daysArray = Array(daysInMonth).fill(false);

	console.log(daysArray);

	return (
		<div className="stats-card">
			<h2 className="text-lg font-bold text-gray-800 p-2">
				{goal.title}
			</h2>
		</div>
	);
}
