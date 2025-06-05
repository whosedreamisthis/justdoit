export default function StatsCard({ goal }) {
	const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
	const currentYear = currentDate.getFullYear();

	const daysInMonth = getDaysInMonth(currentMonth, currentYear);
	const daysArray = Array(daysInMonth).fill(false);

	console.log(daysArray);

	return (
		<div className="stats-card bg-white p-4 rounded-md shadow-md">
			<h2 className="text-md font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis mb-4">
				{goal.title}
			</h2>
			<div className="grid grid-cols-7 gap-1 w-fit m-2">
				{daysArray.map((day, index) => (
					<div
						key={index}
						className={`w-4 h-4 rounded-sm stats-item ${
							day ? 'bg-green-500' : 'bg-gray-300'
						}`}
					></div>
				))}
			</div>
		</div>
	);
}
{
	/* <h2 className="text-lg font-bold text-gray-800">{goal.title}</h2>
			<div className="grid grid-cols-7 gap-1 w-fit">
				{daysArray.map((day, index) => (
					<div
						key={index}
						className={`w-4 h-4 rounded-sm stats-item ${
							day ? 'bg-green-500' : 'bg-red-500'
						}`}
					></div>
				))}
			</div> */
}
// </div>
