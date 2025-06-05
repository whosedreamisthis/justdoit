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
import StatsTab from '@/components/stats-tab';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');

	const [goals, setGoals] = useState(() => {
		if (typeof window !== 'undefined') {
			const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
			if (storedGoals && storedGoals.length > 0) {
				return storedGoals.map((goal) => ({
					...goal,
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

	// New state for last reset timestamps
	const [lastDailyResetTime, setLastDailyResetTime] = useState(() => {
		if (typeof window !== 'undefined') {
			const storedTime = localStorage.getItem('lastDailyResetTime');
			return storedTime ? new Date(storedTime) : null;
		}
		return null;
	});

	const [lastWeeklyResetTime, setLastWeeklyResetTime] = useState(() => {
		if (typeof window !== 'undefined') {
			const storedTime = localStorage.getItem('lastWeeklyResetTime');
			return storedTime ? new Date(storedTime) : null;
		}
		return null;
	});

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}, [activeTab]);

	// --- REVISED DAILY/WEEKLY RESET LOGIC ---
	useEffect(() => {
		const now = new Date();

		const getMidnightForDate = (date) => {
			return new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				0,
				0,
				0
			);
		};

		const getNextSundayMidnight = (currentDate) => {
			const midnight = getMidnightForDate(currentDate);
			let daysUntilNextSunday = (7 - midnight.getDay()) % 7; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

			const nextSunday = new Date(midnight);
			nextSunday.setDate(midnight.getDate() + daysUntilNextSunday);

			// If it's Sunday and already past midnight, set for next Sunday
			if (
				midnight.getDay() === 0 &&
				currentDate.getTime() >= midnight.getTime()
			) {
				nextSunday.setDate(nextSunday.getDate() + 7);
			}
			return nextSunday;
		};

		let currentGoals = [...goals]; // Create a mutable copy for immediate updates

		// --- Handle MISSED DAILY RESET ---
		let shouldPerformDailyReset = false;
		const todayMidnight = getMidnightForDate(now);

		if (lastDailyResetTime) {
			const lastResetMidnight = getMidnightForDate(lastDailyResetTime);
			// Check if today is a different day than the last reset day and we've passed midnight
			if (todayMidnight.getTime() > lastResetMidnight.getTime()) {
				shouldPerformDailyReset = true;
			}
		} else {
			// First run, set lastDailyResetTime to today's midnight
			shouldPerformDailyReset = false; // Will set in finally block
		}

		if (shouldPerformDailyReset) {
			console.log('Missed Daily Reset Detected! Applying now.');
			currentGoals = currentGoals.map((goal) => ({
				...goal,
				progress: 0,
				isCompleted: false,
			}));
		}

		// --- Handle MISSED WEEKLY RESET ---
		let shouldPerformWeeklyReset = false;
		const nextSunday = getNextSundayMidnight(now); // Calculate based on current 'now'

		if (lastWeeklyResetTime) {
			const lastResetSundayMidnight =
				getNextSundayMidnight(lastWeeklyResetTime);
			// If the current next Sunday is different from the last reset Sunday
			// AND we've passed the last recorded reset time
			if (
				nextSunday.getTime() > lastResetSundayMidnight.getTime() &&
				now.getTime() >= lastResetSundayMidnight.getTime()
			) {
				shouldPerformWeeklyReset = true;
			}
		} else {
			// First run, set lastWeeklyResetTime to this upcoming Sunday
			shouldPerformWeeklyReset = false; // Will set in finally block
		}

		if (shouldPerformWeeklyReset) {
			console.log('Missed Weekly Reset Detected! Applying now.');
			currentGoals = currentGoals.map((goal) => ({
				...goal,
				completedDays: Array(7).fill(false),
				progress: 0,
				isCompleted: false,
			}));
		}

		// --- Apply immediate resets if any were necessary ---
		if (shouldPerformDailyReset || shouldPerformWeeklyReset) {
			setGoals(currentGoals); // Update React state
			localStorage.setItem('userGoals', JSON.stringify(currentGoals)); // Persist immediately
		}

		// --- SCHEDULE NEXT TIMERS ---
		const timeUntilDailyReset =
			todayMidnight.getTime() + 24 * 60 * 60 * 1000 - now.getTime(); // Next midnight
		const timeUntilWeeklyReset = nextSunday.getTime() - now.getTime(); // Next Sunday midnight

		const dailyTimerId = setTimeout(() => {
			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false,
				}));
				localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
				setLastDailyResetTime(new Date()); // Update last reset time
				return updatedGoals;
			});
			console.log('Daily Reset Triggered!');
		}, timeUntilDailyReset);

		const weeklyTimerId = setTimeout(() => {
			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) => ({
					...goal,
					completedDays: Array(7).fill(false),
					progress: 0,
					isCompleted: false,
				}));
				localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
				setLastWeeklyResetTime(new Date()); // Update last reset time
				return updatedGoals;
			});
			console.log('WEEKLY RESET TRIGGERED!');
		}, timeUntilWeeklyReset);

		// --- Clean up on unmount ---
		return () => {
			clearTimeout(dailyTimerId);
			clearTimeout(weeklyTimerId);
		};
	}, [goals]); // Add goals as a dependency to re-run on goal changes for missed reset checks

	useEffect(() => {
		// Save goals to localStorage whenever goals state changes
		if (goals.length > 0) {
			localStorage.setItem('userGoals', JSON.stringify(goals));
		} else {
			localStorage.removeItem('userGoals');
		}
		// Save last reset times to localStorage whenever they change
		if (lastDailyResetTime) {
			localStorage.setItem(
				'lastDailyResetTime',
				lastDailyResetTime.toISOString()
			);
		}
		if (lastWeeklyResetTime) {
			localStorage.setItem(
				'lastWeeklyResetTime',
				lastWeeklyResetTime.toISOString()
			);
		}
	}, [goals, lastDailyResetTime, lastWeeklyResetTime]); // Added lastResetTime dependencies

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
			totalSegments: 1,
			color: selectedHabit.color,
			description: selectedHabit.description,
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

	const handleUpdateGoal = (updatedGoal) => {
		setGoals((prevGoals) =>
			prevGoals.map((goal) =>
				goal.id === updatedGoal.id ? updatedGoal : goal
			)
		);
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
				<div className="flex-grow p-4 pb-20">
					{activeTab === 'goals' && (
						<GoalsTab
							goals={goals}
							onReSort={onReSort}
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals}
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={habitsByCategory}
							onSelect={onExploreHabitSelected}
						/>
					)}
					{activeTab === 'stats' && <StatsTab goals={goals} />}
					{activeTab === 'profile' && <ProfileTab />}
				</div>

				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
