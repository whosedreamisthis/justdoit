'use client';
import React from 'react';
import habitsData from '../data/habits.json'; // Directly importing the JSON file

const HabitSelectionGrid = () => {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 1fr)',
				gap: '10px',
			}}
		>
			{habitsData.habits.map((habit) => (
				<button key={habit}>{habit}</button>
			))}
		</div>
	);
};

export default HabitSelectionGrid;
