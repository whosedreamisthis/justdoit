'use client';
import React, { useState } from 'react';

/**
 * HabitSelectionGrid Component
 * Displays a grid of selectable habit cards.
 */
export default function HabitSelectionGrid() {
	// Placeholder data for different habits
	const habits = [
		{
			id: 'read',
			title: 'Read 30 mins Daily',
			shortDescription: 'Expand your knowledge and vocabulary.',
			detailedDescription:
				'Immerse yourself in books, articles, or news for at least 30 minutes every day. This habit fosters continuous learning, reduces stress, and enhances critical thinking. Choose a topic you love or explore new genres to keep it engaging.',
		},
		{
			id: 'exercise',
			title: 'Exercise 3 Times a Week',
			shortDescription: 'Boost your energy and physical health.',
			detailedDescription:
				'Engage in at least 30 minutes of moderate to intense physical activity three times a week. This could be anything from jogging, cycling, strength training, or a brisk walk. Regular exercise improves mood, sleep, and overall well-being.',
		},
		{
			id: 'meditate',
			title: 'Meditate 10 mins Daily',
			shortDescription: 'Cultivate mindfulness and reduce stress.',
			detailedDescription:
				'Practice mindfulness meditation for 10 minutes each day. Find a quiet space, focus on your breath, and observe your thoughts without judgment. This habit can significantly reduce anxiety, improve focus, and promote emotional balance.',
		},
		{
			id: 'hydrate',
			title: 'Drink 8 Glasses of Water',
			shortDescription: 'Stay hydrated for optimal health.',
			detailedDescription:
				'Ensure you drink at least 8 glasses (approx. 2 liters) of water throughout the day. Proper hydration is crucial for energy levels, skin health, digestion, and overall bodily functions. Keep a water bottle handy as a reminder.',
		},
	];

	// Function to handle when a habit is selected
	const handleSelectHabit = (habitId) => {
		console.log(
			`Habit selected: ${habitId}. You can now add this to the user's active habits.`
		);
		// In a real application, you would typically:
		// 1. Add this habit to a user's list of active habits (e.g., via a database update)
		// 2. Potentially navigate the user to a tracking page for this habit
		// 3. Show a confirmation message
	};

	return (
		// Responsive grid container for the habit selection cards
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{habits.map((habit) => (
				<HabitSelectionCard
					key={habit.id}
					habit={habit}
					onSelect={handleSelectHabit}
				/>
			))}
		</div>
	);
}

/**
 * HabitSelectionCard Component
 * A card for browsing and selecting habits. It can be minimized/maximized
 * to show more details, and includes a "Select Habit" button.
 */
function HabitSelectionCard({ habit, onSelect }) {
	// State to manage whether the card is expanded or minimized
	const [isExpanded, setIsExpanded] = useState(false);

	// Function to toggle the expanded state of the card
	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	// Function to handle the "Select Habit" button click
	const handleSelectButtonClick = (e) => {
		e.stopPropagation(); // Prevent the card from minimizing
		onSelect(habit.id); // Call the parent's onSelect function
	};

	return (
		// The main card container.
		// Similar styling to the tracking card, but adapted for selection.
		<div
			className={`
        bg-white
        rounded-xl
        shadow-lg
        p-6
        transition-all
        duration-300
        ease-in-out
        overflow-hidden
        flex
        flex-col
        cursor-pointer
        ${isExpanded ? 'h-auto max-h-[500px]' : 'h-32 max-h-32'}
      `}
			onClick={toggleExpand} // Attach the click handler to toggle expansion
		>
			{/* Card Header: Always visible */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold text-gray-800">
					{habit.title}
				</h2>
				{/* Chevron icon to indicate expand/collapse state */}
				<svg
					className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
						isExpanded ? 'rotate-180' : 'rotate-0'
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M19 9l-7 7-7-7"
					></path>
				</svg>
			</div>

			{/* Short Description: Always visible */}
			<p className="text-gray-600 text-sm mb-4">
				{habit.shortDescription}
			</p>

			{/* Expanded Content: Only visible when isExpanded is true */}
			<div
				className={`
          flex-grow
          transition-all
          duration-300
          ease-in-out
          ${isExpanded ? 'opacity-100 max-h-full' : 'opacity-0 max-h-0'}
          ${isExpanded ? '' : 'pointer-events-none'}
        `}
			>
				<hr className="border-t border-gray-200 mb-4" />

				{/* Detailed Description */}
				<h3 className="text-lg font-semibold text-gray-700 mb-2">
					About this Habit:
				</h3>
				<p className="text-gray-700 text-base leading-relaxed mb-4">
					{habit.detailedDescription}
				</p>

				{/* "Select Habit" Button */}
				<div className="mt-4">
					<button
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
						onClick={handleSelectButtonClick}
					>
						Select Habit
					</button>
				</div>
			</div>
		</div>
	);
}
