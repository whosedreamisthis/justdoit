'use client';
import { useState, useEffect } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habitsByCategory from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
import GoalsTab from '@/components/goals-tab';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

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

		// --- START OF TESTING MODIFICATIONS ---
		// THESE LINES MUST BE UNCOMMENTED for testing to run in 5 and 10 seconds!
		// timeUntilDailyReset = 5000; // 5 seconds for daily reset
		// timeUntilWeeklyReset = 10000; // 10 seconds for weekly reset
		// --- END OF TESTING MODIFICATIONS ---

		console.log('Now (TESTING DATE):', now.toISOString()); // Changed log to reflect testing
		console.log(
			'Next Daily Reset (Test):',
			midnightToday.toISOString(),
			`(${timeUntilDailyReset}ms)`
		);
		console.log(
			'Next Weekly Reset (Sunday 00:00 - Test):',
			nextSundayMidnight.toISOString(),
			`(${timeUntilWeeklyReset}ms)`
		);

		const dailyTimer = setTimeout(() => {
			setGoals((prevGoals) =>
				prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false, // Reset overall completion status
				}))
			);
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

	// This useEffect (commented out) is typically not needed if state is loaded in useState initializer.
	/*
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
            if (storedGoals) {
                setGoals(storedGoals);
            }
        }
    }, [activeTab]);
    */

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

	const onExploreHabitSelected = (habitId) => {
		const selectedHabit = findHabit(habitId);
		if (!selectedHabit) return;

		const uniqueKey = `${habitId}-${Date.now()}`;
		const newGoal = {
			id: uniqueKey,
			title2: selectedHabit.title,
			title: selectedHabit.title,
			progress: 0,
			totalSegments: selectedHabit.title === 'Daily Hydration' ? 8 : 1,
			color: selectedHabit.color,
			shortDescription: selectedHabit.shortDescription,
			isCompleted: false, // Explicitly set isCompleted for new goals
			completedDays: [false, false, false, false, false, false, false], // Correctly initialized
		};
		const newGoals = [...goals, newGoal];
		// Sort by isCompleted (false first, true last), then by progress
		setGoals(
			newGoals.sort(
				(a, b) =>
					(a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1) ||
					a.progress - b.progress
			)
		);
		toast.success(`"${selectedHabit.title}" added successfully!`);
	};

	const onGoalEdited = (goalId) => {
		toast.success(`"Goals can't be edited yet.`);
	};

	const onReSort = () => {
		// Sort by isCompleted (false first, true last)
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
							onEdit={onGoalEdited}
							setGoals={setGoals}
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={habitsByCategory}
							onSelect={onExploreHabitSelected}
						/>
					)}
					{activeTab === 'settings' && (
						<p>Manage your settings here!</p>
					)}
				</div>

				{/* Bottom Navigation */}
				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
