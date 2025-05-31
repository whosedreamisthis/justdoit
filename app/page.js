'use client';
import React, { useState, useEffect } from 'react';

// --- Start of HABITS_DATA (content from your habits.json) ---
const HABITS_DATA = [
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
	{
		id: 'journal',
		title: 'Journal Daily',
		shortDescription: 'Reflect and organize your thoughts.',
		detailedDescription:
			'Dedicate 15 minutes each day to journaling. This practice helps in self-reflection, stress reduction, and goal setting. You can write about your day, your feelings, or ideas you have.',
	},
	{
		id: 'learn_new_skill',
		title: 'Learn a New Skill Weekly',
		shortDescription: 'Continuously grow and challenge yourself.',
		detailedDescription:
			"Spend a few hours each week learning something new, whether it's a language, a coding skill, or a musical instrument. This habit keeps your mind sharp and opens up new opportunities.",
	},
];
// --- End of HABITS_DATA ---

// ======================================================
// MinimizableCard Component (for tracking active habits)
// ======================================================
function MinimizableCard() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [dailyProgressSegments, setDailyProgressSegments] = useState(0);
	const [currentStreak, setCurrentStreak] = useState(7); // Placeholder for a 7-day streak

	const MAX_DAILY_SEGMENTS = 3;

	const toggleExpand = () => setIsExpanded(!isExpanded);

	const handleDailyProgressClick = (e) => {
		e.stopPropagation();
		if (dailyProgressSegments < MAX_DAILY_SEGMENTS) {
			setDailyProgressSegments(dailyProgressSegments + 1);
			if (dailyProgressSegments + 1 === MAX_DAILY_SEGMENTS) {
				setCurrentStreak(currentStreak + 1);
				console.log("Habit 'Read 30 mins Daily' completed for today!");
			}
		}
	};

	const isDailyProgressButtonDisabled =
		dailyProgressSegments === MAX_DAILY_SEGMENTS;

	const handleActionButtonClick = (e, actionName) => {
		e.stopPropagation();
		console.log(`${actionName} button clicked!`);
	};

	return (
		<div
			className={`
        bg-white
        rounded-xl
        shadow-lg
        p-6
        mx-auto
        w-full
        max-w-sm
        transition-all
        duration-300
        ease-in-out
        overflow-hidden
        flex
        flex-col
        cursor-pointer
        ${isExpanded ? 'h-auto max-h-[600px]' : 'h-32 max-h-32'}
      `}
			onClick={toggleExpand}
		>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-bold text-gray-800">
					Read 30 mins Daily
				</h2>
				<div className="flex items-center space-x-3">
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
						onMouseDown={(e) => e.stopPropagation()}
						onTouchStart={(e) => e.stopPropagation()}
					>
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
			<p className="text-gray-600 text-sm mb-4">
				Build a consistent reading habit.
			</p>
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
				<h3 className="text-lg font-semibold text-gray-700 mb-2">
					Why "Read 30 mins Daily"?
				</h3>
				<p className="text-gray-700 text-base leading-relaxed mb-4">
					Reading for 30 minutes every day can significantly improve
					your knowledge, vocabulary, and critical thinking skills.
					It's a powerful way to de-stress and explore new ideas. Make
					it a foundational habit for personal growth.
				</p>
				<div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4">
					<span className="text-blue-700 font-medium">
						Current Streak:
					</span>
					<span className="text-blue-900 font-bold text-xl">
						{currentStreak} Days 🔥
					</span>
				</div>
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

// ======================================================
// HabitSelectionCard Component (for browsing/selecting habits)
// ======================================================
function HabitSelectionCard({ habit, onSelect }) {
	const [isExpanded, setIsExpanded] = useState(false);
	const toggleExpand = () => setIsExpanded(!isExpanded);
	const handleSelectButtonClick = (e) => {
		e.stopPropagation();
		onSelect(habit.id);
	};

	return (
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
			onClick={toggleExpand}
		>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold text-gray-800">
					{habit.title}
				</h2>
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
			<p className="text-gray-600 text-sm mb-4">
				{habit.shortDescription}
			</p>
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
				<h3 className="text-lg font-semibold text-gray-700 mb-2">
					About this Habit:
				</h3>
				<p className="text-gray-700 text-base leading-relaxed mb-4">
					{habit.detailedDescription}
				</p>
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

// ======================================================
// HabitSelectionGrid Component (container for explore page)
// ======================================================
function HabitSelectionGrid() {
	const habits = HABITS_DATA; // Directly use HABITS_DATA for this environment

	const handleSelectHabit = (habitId) => {
		console.log(
			`Habit selected: ${habitId}. In a real app, this would add it to user's goals.`
		);
	};

	return (
		// The 'grid-cols-1' ensures a single column on small screens (like iPhones)
		// and then expands to more columns on larger screens.
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

// ======================================================
// Main App Component with Tabs (Mobile Style)
// ======================================================
export default function App() {
	const [activeTab, setActiveTab] = useState('goals');

	const getTabClasses = (tabName) => {
		return `
      flex-1 py-3
      font-semibold text-lg
      text-center
      transition-colors duration-200
      ${
			activeTab === tabName
				? 'text-blue-700 bg-white border-t-2 border-blue-700' // Active tab styles
				: 'text-gray-600 bg-gray-100 hover:bg-gray-200' // Inactive tab styles
		}
    `;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col">
			{/* Main Content Area */}
			{/* Removed min-h-[400px] and added overflow-y-auto to allow content to scroll */}
			<div className="flex-grow p-4 pb-20 flex flex-col items-center overflow-y-auto">
				<h1 className="text-5xl font-extrabold text-center text-gray-800 mb-8 mt-4">
					My Habit & Goal Tracker
				</h1>

				<div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-6">
					{' '}
					{/* Removed min-h-[400px] here */}
					{activeTab === 'goals' && (
						<div>
							<h2 className="text-3xl font-bold text-gray-700 mb-4">
								Your Active Goals
							</h2>
							<p className="text-gray-600 mb-6">
								This section shows the habits you've decided to
								work on. Here's a placeholder for one of your
								active goals.
							</p>
							<MinimizableCard />
							<p className="text-gray-500 text-sm mt-4">
								* To add more goals, go to the "Explore Habits"
								tab and select them.
							</p>
						</div>
					)}
					{activeTab === 'explore' && (
						<div>
							<h2 className="text-3xl font-bold text-gray-700 mb-4">
								Discover New Habits
							</h2>
							<p className="text-gray-600 mb-6">
								Browse and select new habits to add to your
								goals.
							</p>
							<HabitSelectionGrid />
						</div>
					)}
				</div>
			</div>

			{/* Tab Navigation (Fixed at Bottom) */}
			<div className="fixed bottom-0 left-0 right-0 z-10 bg-white shadow-lg border-t border-gray-200 flex justify-around">
				<button
					className={getTabClasses('goals')}
					onClick={() => setActiveTab('goals')}
				>
					My Goals
				</button>
				<button
					className={getTabClasses('explore')}
					onClick={() => setActiveTab('explore')}
				>
					Explore Habits
				</button>
			</div>
		</div>
	);
}
