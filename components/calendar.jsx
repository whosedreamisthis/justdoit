// calendar.jsx
import { useState, useEffect } from 'react'; // Import useEffect
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/app/globals.css';
import styles from '@/styles/calendar.module.css';

// Accept completedDays, goalId, and onUpdateGoal as props
function MyCalendar({ completedDays = {}, goalId, onUpdateGoal }) {
	const [date, setDate] = useState(new Date());

	// Use useEffect to reset the calendar date to today's date when goalId changes.
	useEffect(() => {
		setDate(new Date()); // Reset to today's date
	}, [goalId]); // Re-run this effect whenever goalId changes

	// Function to check if a specific date is marked as completed
	const isDayCompleted = (year, month, day) => {
		// month from tileDate.getMonth() is 0-indexed, completedDays stores 1-indexed month
		// We add 1 to `month` here to correctly match the 1-indexed month stored in `completedDays`.
		return completedDays[year]?.[month + 1]?.[day] || false;
	};

	const handleDateChange = (value) => {
		const clickedDate = value;
		setDate(clickedDate); // Update the calendar's displayed month/day

		// Pass the goalId and the clicked date to the parent's onUpdateGoal
		// The parent (page.js) will handle the complex logic of updating completedDays
		// and recalculating overall goal progress/completion.
		onUpdateGoal(goalId, {
			type: 'toggleDayCompletion',
			date: clickedDate,
		});
	};

	return (
		<div className={`flex justify-center`}>
			<Calendar
				// Use tileClassName to highlight based on completedDays
				tileClassName={({ date: tileDate, view }) => {
					// Only apply class for 'month' view tiles
					if (view === 'month') {
						const year = tileDate.getFullYear();
						const month = tileDate.getMonth(); // This is 0-indexed (e.g., June is 5)
						const day = tileDate.getDate();

						if (isDayCompleted(year, month, day)) {
							// This will now correctly check completedDays[year][month + 1][day]
							return `${styles.completedDay}`;
						}
					}
					return null;
				}}
				// onChange={handleDateChange} // This line is now correctly uncommented without the invalid comment inside it.
				// value={date}
			/>
		</div>
	);
}

export default MyCalendar;
