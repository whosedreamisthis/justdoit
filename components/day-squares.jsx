// src/components/DaySquares.jsx (or wherever you prefer to put it)
import React from 'react';

export default function DaySquares({ completedDays }) {
	// This class should be defined in your global CSS (e.g., app.css or globals.css)
	// or through Tailwind's utility classes.
	const completedSquareColorClass = 'bg-green-500'; // Example: using a Tailwind class for completed color.
	// If you have a custom CSS class like 'day-square-filled-green', use that.

	return (
		<div className="day-squares-container flex gap-4 pb-4">
			{completedDays.map((day, index) => {
				const shouldFill = day;
				// These classes define the square's size and default appearance
				const squareClass = `
                    day-square
                    w-8 h-8           /* Larger size */
                    rounded-md         /* Slightly rounded corners, adjust as needed */
                    border border-gray-300 /* A subtle border */
                    ${
						shouldFill ? completedSquareColorClass : 'bg-gray-200'
					} /* Fill color based on completion */
                `;
				return <div key={index} className={squareClass}></div>;
			})}
		</div>
	);
}
