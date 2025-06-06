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
					completedDays: goal.completedDays || {},
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

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}, [activeTab]);

	// --- REVISED DAILY/WEEKLY RESET LOGIC ---
	useEffect(() => {
		console.log('here 1');
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
		console.log('here 2');

		let shouldPerformDailyReset = false;
		const todayMidnight = getMidnightForDate(now);
		console.log('here 3', lastDailyResetTime);

		if (lastDailyResetTime) {
			const lastResetMidnight = getMidnightForDate(lastDailyResetTime);
			// Check if today is a different day than the last reset day and we've passed midnight
			if (todayMidnight.getTime() > lastResetMidnight.getTime()) {
				shouldPerformDailyReset = true;
			}
		} else {
			// If lastDailyResetTime is null, it means it's the very first load or localStorage was cleared.
			// No "missed" reset has occurred in this scenario.
			shouldPerformDailyReset = false;
		}

		if (shouldPerformDailyReset) {
			console.log('Missed Daily Reset Detected! Applying now.');
			const updatedGoals = goals.map((goal) => ({
				...goal,
				progress: 0,
				isCompleted: false,
			}));
			setGoals(updatedGoals);
			// FIX: Update lastDailyResetTime immediately after applying a missed reset
			setLastDailyResetTime(todayMidnight);
			localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
			if (lastDailyResetTime) {
				localStorage.setItem(
					'lastDailyResetTime',
					todayMidnight.toISOString()
				);
			}
		}

		// --- Handle MISSED WEEKLY RESET ---
		// (This section was present in your code but empty, leaving it for future weekly reset logic if needed)
		const nextSunday = getNextSundayMidnight(now);

		// --- SCHEDULE NEXT TIMERS ---
		const timeUntilDailyReset =
			todayMidnight.getTime() + 24 * 60 * 60 * 1000 - now.getTime(); // Time until next midnight

		const dailyTimerId = setTimeout(() => {
			setGoals((prevGoals) => {
				const resetGoals = prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false,
				}));
				localStorage.setItem('userGoals', JSON.stringify(resetGoals));
				setLastDailyResetTime(new Date()); // Update last reset time to NOW after the timed reset
				return resetGoals;
			});
			console.log('Daily Reset Triggered!');
		}, timeUntilDailyReset);

		// --- Clean up on unmount ---
		return () => {
			clearTimeout(dailyTimerId);
		};
	}, [goals, lastDailyResetTime]); // Added lastDailyResetTime to dependencies for accurate missed reset detection

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
	}, [goals, lastDailyResetTime]); // Added lastResetTime dependencies

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
			completedDays: {},
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

	// app/page.js
	// ...
	const handleUpdateGoal = (goalId, updatedGoal) => {
		setGoals((prevGoals) =>
			prevGoals.map((goal) => {
				if (goal.id === goalId) {
					let updatedCompletedDays = { ...goal.completedDays }; // Start with existing

					const now = new Date();
					const year = now.getFullYear();
					// FIX: Store month as 1-indexed to match calendar.jsx's retrieval
					const month = now.getMonth() + 1;
					const day = now.getDate();

					if (updatedGoal.isCompleted && !goal.isCompleted) {
						// Goal is being completed now
						updatedCompletedDays[year] =
							updatedCompletedDays[year] || {};
						updatedCompletedDays[year][month] =
							updatedCompletedDays[year][month] || {};
						updatedCompletedDays[year][month][day] = true; // Mark as completed
					} else if (!updatedGoal.isCompleted && goal.isCompleted) {
						// Goal is being un-completed
						if (
							updatedCompletedDays[year] &&
							updatedCompletedDays[year][month]
						) {
							delete updatedCompletedDays[year][month][day]; // Remove the completed day
							if (
								Object.keys(updatedCompletedDays[year][month])
									.length === 0
							) {
								delete updatedCompletedDays[year][month]; // Clean up empty month
								if (
									Object.keys(updatedCompletedDays[year])
										.length === 0
								) {
									delete updatedCompletedDays[year]; // Clean up empty year
								}
							}
						}
					}
					return {
						...goal,
						...updatedGoal,
						completedDays: updatedCompletedDays,
					}; // Merge updates
				} else {
					return goal;
				}
			})
		);
	};
	// ...
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
				<div className="flex-grow pb-20">
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
					{activeTab === 'stats' && (
						<StatsTab
							goals={goals}
							onUpdateGoal={handleUpdateGoal}
						/>
					)}
					{activeTab === 'profile' && <ProfileTab />}
				</div>

				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
