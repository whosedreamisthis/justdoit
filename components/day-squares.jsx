// day-squares.jsx
export default function DaySquares({ completedDays }) {
	const completedSquareColorClass = 'day-square-filled-green';

	return (
		<div className="day-squares-container flex gap-4">
			{completedDays.map((day, index) => {
				const shouldFill = day;
				const squareClass = `day-square ${
					shouldFill ? completedSquareColorClass : ''
				} w-8 h-8`;
				return <div key={index} className={squareClass}></div>;
			})}
		</div>
	);
}
