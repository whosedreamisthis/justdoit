'use client';
import { useState } from 'react';

/**
 * MinimizableCard Component
 * A card that toggles between a minimized and maximized state on click.
 * It functions as a habit tracker, displaying detailed information and
 * progress tracking when maximized.
 */
function MinimizableCard() {
	// State to manage whether the card is expanded or minimized
	const [isExpanded, setIsExpanded] = useState(false);
	// State to track the number of filled segments for daily completion
	const [dailyProgressSegments, setDailyProgressSegments] = useState(0);
	// State to track the current streak for the habit
	const [currentStreak, setCurrentStreak] = useState(7); // Placeholder for a 7-day streak

	// Define the maximum number of segments for the daily completion button
	const MAX_DAILY_SEGMENTS = 3; // For example, 3 segments to mark "done"

	// Function to toggle the expanded state of the card
	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	// Function to handle clicks on the daily progress button
	const handleDailyProgressClick = (e) => {
		// Stop propagation to prevent the card's onClick handler from firing
		// This ensures clicking the segmented button doesn't expand/minimize the card
		e.stopPropagation();

		// Only increment if not all segments are filled yet
		if (dailyProgressSegments < MAX_DAILY_SEGMENTS) {
			setDailyProgressSegments(dailyProgressSegments + 1);
			// If all segments are now filled, simulate habit completion for the day
			if (dailyProgressSegments + 1 === MAX_DAILY_SEGMENTS) {
				// Here you would typically update the actual habit data (e.g., increment streak, mark as completed)
				setCurrentStreak(currentStreak + 1); // Simulate streak increment on completion
				console.log("Habit 'Read 30 mins Daily' completed for today!");
			}
		}
	};

	// Determine if the daily progress button should be disabled
	const isDailyProgressButtonDisabled =
		dailyProgressSegments === MAX_DAILY_SEGMENTS;

	// Generic handler for the action buttons to prevent card minimization
	const handleActionButtonClick = (e, actionName) => {
		e.stopPropagation(); // Prevent card from minimizing
		console.log(`${actionName} button clicked!`);
		// Add specific logic for each button here later
		// For example, open a modal, navigate, etc.
	};

	return (
		// The main card container.
		// It uses Tailwind classes for styling, including responsive padding,
		// rounded corners, shadow, and a smooth transition for size changes.
		// The 'cursor-pointer' makes it clear it's interactive.
		<div
			className={`
        bg-white
        rounded-xl
        shadow-lg
        p-6
        mx-auto
        w-full
        max-w-sm
        md:max-w-md
        lg:max-w-lg
        transition-all
        duration-300
        ease-in-out
        overflow-hidden
        flex
        flex-col
        cursor-pointer
        ${isExpanded ? 'h-auto max-h-[600px]' : 'h-32 max-h-32'}
      `}
			onClick={toggleExpand} // Attach the click handler to toggle expansion
		>
			{/* Card Header: Always visible */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-bold text-gray-800">
					Read 30 mins Daily
				</h2>
				{/* Container for the daily progress button and chevron icon */}
				<div className="flex items-center space-x-3">
					{/* Daily Progress Segmented Button */}
					<div
						className={`
              flex items-center space-x-1 p-1 border rounded-full
              transition-all duration-200
              ${
					isDailyProgressButtonDisabled
						? 'bg-gray-200 cursor-not-allowed border-gray-300'
						: 'bg-gray-100 cursor-pointer border-gray-200 hover:bg-gray-200'
				}
            `}
						onClick={handleDailyProgressClick}
						// Add onMouseDown and onTouchStart with stopPropagation
						// to ensure clicks/taps on this button don't trigger the parent card's click
						onMouseDown={(e) => e.stopPropagation()}
						onTouchStart={(e) => e.stopPropagation()}
					>
						{/* Render individual segments */}
						{Array.from({ length: MAX_DAILY_SEGMENTS }).map(
							(_, index) => (
								<div
									key={index}
									className={`
                  w-4 h-4 rounded-full transition-colors duration-200
                  ${
						index < dailyProgressSegments
							? 'bg-green-500'
							: 'bg-gray-300'
					}
                `}
								></div>
							)
						)}
					</div>

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
			</div>

			{/* Short Description: Always visible */}
			<p className="text-gray-600 text-sm mb-4">
				Build a consistent reading habit.
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

				{/* Detailed Description/Motivation */}
				<h3 className="text-lg font-semibold text-gray-700 mb-2">
					Why "Read 30 mins Daily"?
				</h3>
				<p className="text-gray-700 text-base leading-relaxed mb-4">
					Reading for 30 minutes every day can significantly improve
					your knowledge, vocabulary, and critical thinking skills.
					It's a powerful way to de-stress and explore new ideas. Make
					it a foundational habit for personal growth.
				</p>

				{/* Current Streak */}
				<div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4">
					<span className="text-blue-700 font-medium">
						Current Streak:
					</span>
					<span className="text-blue-900 font-bold text-xl">
						{currentStreak} Days 🔥
					</span>
				</div>

				{/* Action Buttons */}
				<div className="mt-4 flex flex-col space-y-2">
					<button
						className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
						onClick={(e) =>
							handleActionButtonClick(e, 'Edit Habit')
						}
					>
						Edit Habit
					</button>
					<button
						className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
						onClick={(e) =>
							handleActionButtonClick(e, 'View History')
						}
					>
						View History
					</button>
					<button
						className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
						onClick={(e) =>
							handleActionButtonClick(e, 'Delete Habit')
						}
					>
						Delete Habit
					</button>
				</div>
			</div>
		</div>
	);
}
