// app/page.js
'use client';
import { useState, useEffect } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habitsByCategory from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
import GoalsTab from '@/components/goals-tab';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import ProfileTab from '@/components/profile-tab';
import '@/app/globals.css';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');

	const [goals, setGoals] = useState(() => {
		if (typeof window !== 'undefined') {
			const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
			if (storedGoals && storedGoals.length > 0) {
				return storedGoals.map((goal) => ({
					...goal,
					// Minimal change: Ensure isCompleted and completedDays are set for existing goals
					isCompleted:
						typeof goal.isCompleted === 'boolean'
							? goal.isCompleted
							: goal.progress >= 100,
					completedDays: goal.completedDays || Array(7).fill(false),
				}));
			}
		}
		return [];
	});
	useEffect(() => {
		//if (activeTab === 'goals') {
		window.scrollTo({
			top: 0,
			behavior: 'smooth', // Optional: for a smooth scrolling animation
		});
		//}
	}, [activeTab]);
	// --- Minimal Change: Re-introducing the comprehensive daily/weekly reset logic ---
	useEffect(() => {
		// --- START OF TESTING MODIFICATIONS ---
		// You currently have:
		// const nowForTesting = new Date();
		// nowForTesting.setDate(nowForTesting.getDate() - nowForTesting.getDay()); // Set to most recent Sunday
		// nowForTesting.setHours(23, 59, 50, 0); // Set to 10 seconds before midnight
		// const now = nowForTesting;
		// This is good for flexible testing, but let's stick to the simpler hardcoded one for now to ensure consistency:

		// const testNow = new Date('2025-06-08T23:59:50'); // This is a Sunday, 10 seconds before midnight UTC
		// const now = testNow; // <--- This line MUST BE UNCOMMENTED for testing!

		const now = new Date(); // REMEMBER TO UNCOMMENT THIS LINE AND REMOVE 'testNow' RELATED LINES FOR PRODUCTION!
		// const testNow = new Date(); // Get current date
		// testNow.setHours(23, 59, 50, 0); // Set to 11:59:50 PM for quick daily reset

		// const now = testNow;
		const midnightToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);

		let timeUntilDailyReset = midnightToday.getTime() - now.getTime();
		if (timeUntilDailyReset < 0) {
			midnightToday.setDate(midnightToday.getDate() + 1);
			timeUntilDailyReset = midnightToday.getTime() - now.getTime();
		}

		const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		let daysUntilNextSunday = (7 - currentDayOfWeek) % 7;

		const nextSundayMidnight = new Date(midnightToday);
		if (currentDayOfWeek === 0 && now.getTime() < midnightToday.getTime()) {
			// It's Sunday before midnight, reset is today at midnight.
		} else {
			nextSundayMidnight.setDate(
				midnightToday.getDate() + daysUntilNextSunday
			);
			if (
				currentDayOfWeek === 0 &&
				now.getTime() > midnightToday.getTime()
			) {
				nextSundayMidnight.setDate(nextSundayMidnight.getDate() + 7);
			}
		}

		let timeUntilWeeklyReset = nextSundayMidnight.getTime() - now.getTime();

		const dailyTimer = setTimeout(() => {
			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false, // Reset overall completion status
				}));
				localStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // Explicitly save daily reset
				return updatedGoals;
			});
			console.log('Daily Reset Triggered!'); // Added log for clarity
		}, timeUntilDailyReset);

		// --- THE MINIMAL CHANGE IS HERE: COMBINING THE TWO setGoals CALLS ---
		const weeklyTimer = setTimeout(() => {
			setGoals((prevGoals) =>
				prevGoals.map((goal) => ({
					...goal,
					completedDays: Array(7).fill(false), // Reset all daily squares for the new week
					progress: 0, // Also reset progress for the new week
					isCompleted: false, // And completion status for the new week
				}))
			);
			console.log('WEEKLY RESET TRIGGERED!'); // Added log for clarity
		}, timeUntilWeeklyReset);
		// --- END OF MINIMAL CHANGE ---

		return () => {
			clearTimeout(dailyTimer);
			clearTimeout(weeklyTimer);
		};
	}, []);
	// --- End of daily/weekly reset useEffect ---

	useEffect(() => {
		if (goals.length > 0) {
			localStorage.setItem('userGoals', JSON.stringify(goals));
		} else {
			localStorage.removeItem('userGoals'); // Clear if goals become empty
		}
	}, [goals]);

	const findHabit = (habitId) => {
		let selectedHabit = null;
		Object.keys(habitsByCategory).forEach((category) => {
			habitsByCategory[category].forEach((habit) => {
				if (habit.id === habitId) {
					selectedHabit = habit;
				}
			});
		});
		return selectedHabit;
	};

	const onExploreHabitSelected = (habitDetails) => {
		let selectedHabit = null;

		if (habitDetails.id && habitDetails.id.startsWith('custom-')) {
			selectedHabit = habitDetails;
		} else {
			selectedHabit = findHabit(habitDetails.id);
		}

		console.log('selectedHabit', selectedHabit);
		if (!selectedHabit) {
			console.error(
				'Habit not found or invalid habit details.',
				habitDetails
			);
			return;
		}

		const uniqueKey = `${selectedHabit.id}-${Date.now()}`;
		const newGoal = {
			id: uniqueKey,
			title: selectedHabit.title,
			progress: 0,
			totalSegments: selectedHabit.title === 'Daily Hydration' ? 8 : 1,
			color: selectedHabit.color,
			shortDescription: selectedHabit.shortDescription,
			isCompleted: false,
			completedDays: [false, false, false, false, false, false, false],
		};
		const newGoals = [...goals, newGoal];
		setGoals(
			newGoals.sort((a, b) => {
				const idA = a.id?.includes('-') ? a.id.split('-').pop() : null;
				const idB = b.id?.includes('-') ? b.id.split('-').pop() : null;

				const timestampA = idA ? parseInt(idA, 10) : 0;
				const timestampB = idB ? parseInt(idB, 10) : 0;

				if (timestampA !== timestampB) {
					return timestampB - timestampA;
				}

				const completionComparison =
					(a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1);
				if (completionComparison !== 0) {
					return completionComparison;
				}
				return a.progress - b.progress;
			})
		);
		toast.success(`"${selectedHabit.title}" added successfully!`);
	};

	// --- Minimal Change: Remove the old onGoalEdited and add the new handleUpdateGoal ---
	const handleUpdateGoal = (updatedGoal) => {
		setGoals((prevGoals) =>
			prevGoals.map((goal) =>
				goal.id === updatedGoal.id ? updatedGoal : goal
			)
		);
		// toast.success is now handled within MinimizableGoalCard for edit actions.
	};

	const onReSort = () => {
		setGoals((prevGoals) =>
			[...prevGoals].sort(
				(a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
			)
		);
	};

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />

			<div className="min-h-screen flex flex-col">
				{/* Tab Content */}
				<div className="flex-grow p-4 pb-20">
					{activeTab === 'goals' && (
						<GoalsTab
							goals={goals}
							onReSort={onReSort}
							// --- Minimal Change: Pass the new update handler ---
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals} // Keep setGoals if GoalsTab uses it directly for other operations
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={habitsByCategory}
							onSelect={onExploreHabitSelected}
						/>
					)}
					{activeTab === 'profile' && <ProfileTab />}
				</div>

				{/* Bottom Navigation */}
				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
