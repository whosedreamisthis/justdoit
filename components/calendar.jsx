import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/app/globals.css';

function MyCalendar() {
	const [date, setDate] = useState(new Date());

	return (
		<div className="flex justify-center">
			<Calendar
				// --- REMOVED: tileDisabled={() => true} ---
				tileClassName={(
					{ date: tileDate } // Renamed 'date' to 'tileDate' to avoid conflict with state 'date'
				) =>
					tileDate.getDate() === 15 || tileDate.getDate() === 14
						? 'highlighted-cell'
						: null
				}
				onChange={setDate}
				value={date}
			/>
		</div>
	);
}

export default MyCalendar;
