// app/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habitsByCategory from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
import GoalsTab from '@/components/goals-tab';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import ProfileTab from '@/components/profile-tab';
import '@/app/globals.css';
import StatsTab from '@/components/stats-tab';
import Header from '@/components/header'; // Import the new Header component

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');

	const goalsTabRef = useRef(null); // Ref to the GoalsTab component

	const [goals, setGoals] = useState(() => {
		if (typeof window !== 'undefined') {
			const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
			if (storedGoals && storedGoals.length > 0) {
				const loadedGoals = storedGoals.map((goal) => ({
					...goal,
					isCompleted:
						typeof goal.isCompleted === 'boolean'
							? goal.isCompleted
							: goal.progress >= 100,
					completedDays: goal.completedDays || {},
					// Add createdAt for existing goals if missing (important for sorting)
					createdAt: goal.createdAt || new Date().toISOString(),
				}));

				// Initial sort after loading to ensure consistency from the start
				return loadedGoals.sort((a, b) => {
					// Primary sort: Incomplete goals first (-1)
					const completionA = a.isCompleted ? 1 : -1;
					const completionB = b.isCompleted ? 1 : -1;
					if (completionA !== completionB) {
						return completionA - completionB;
					}

					// Secondary sort for incomplete goals: Newest (largest timestamp) first
					if (!a.isCompleted && !b.isCompleted) {
						return (
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime()
						);
					}
					// Secondary sort for completed goals: Oldest (smallest timestamp) first
					// This keeps recently completed items at the very bottom of the completed section.
					else {
						return (
							new Date(a.createdAt).getTime() -
							new Date(b.createdAt).getTime()
						);
					}
				});
			}
		}
		return [];
	});

	const [lastDailyResetTime, setLastDailyResetTime] = useState(() => {
		if (typeof window !== 'undefined') {
			const storedTime = localStorage.getItem('lastDailyResetTime');
			return storedTime ? new Date(storedTime) : null;
		}
		return null;
	});

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	useEffect(() => {
		const now = new Date();
		const getMidnightForDate = (date) =>
			new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				0,
				0,
				0
			);
		const todayMidnight = getMidnightForDate(now);
		let shouldPerformDailyReset = false;

		if (lastDailyResetTime) {
			const lastResetMidnight = getMidnightForDate(lastDailyResetTime);
			if (todayMidnight.getTime() > lastResetMidnight.getTime()) {
				shouldPerformDailyReset = true;
			}
		}

		if (shouldPerformDailyReset) {
			console.log('Missed Daily Reset Detected! Applying now.');
			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false,
				}));

				const sortedGoals = updatedGoals.sort((a, b) => {
					const completionA = a.isCompleted ? 1 : -1;
					const completionB = b.isCompleted ? 1 : -1;
					if (completionA !== completionB) {
						return completionA - completionB;
					}
					if (!a.isCompleted && !b.isCompleted) {
						return (
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime()
						);
					} else {
						return (
							new Date(a.createdAt).getTime() -
							new Date(b.createdAt).getTime()
						);
					}
				});

				localStorage.setItem('userGoals', JSON.stringify(sortedGoals));
				setLastDailyResetTime(todayMidnight);
				localStorage.setItem(
					'lastDailyResetTime',
					todayMidnight.toISOString()
				);

				return sortedGoals;
			});
		}

		const timeUntilDailyReset =
			todayMidnight.getTime() + 24 * 60 * 60 * 1000 - now.getTime();
		const dailyTimerId = setTimeout(() => {
			setGoals((prevGoals) => {
				const resetGoals = prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false,
				}));

				const sortedGoals = resetGoals.sort((a, b) => {
					const completionA = a.isCompleted ? 1 : -1;
					const completionB = b.isCompleted ? 1 : -1;
					if (completionA !== completionB) {
						return completionA - completionB;
					}
					if (!a.isCompleted && !b.isCompleted) {
						return (
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime()
						);
					} else {
						return (
							new Date(a.createdAt).getTime() -
							new Date(b.createdAt).getTime()
						);
					}
				});

				localStorage.setItem('userGoals', JSON.stringify(sortedGoals));
				setLastDailyResetTime(new Date());
				console.log('Daily Reset Triggered!');
				return sortedGoals;
			});
		}, timeUntilDailyReset);

		return () => clearTimeout(dailyTimerId);
	}, [lastDailyResetTime]);

	useEffect(() => {
		if (goals.length > 0) {
			localStorage.setItem('userGoals', JSON.stringify(goals));
		} else {
			localStorage.removeItem('userGoals');
		}
		if (lastDailyResetTime) {
			localStorage.setItem(
				'lastDailyResetTime',
				lastDailyResetTime.toISOString()
			);
		}
	}, [goals, lastDailyResetTime]);

	const handleUpdateGoal = (goalId, updatedGoal) => {
		// Step 1: Tell GoalsTab to snapshot current positions BEFORE we update state
		if (
			activeTab === 'goals' &&
			goalsTabRef.current &&
			goalsTabRef.current.snapshotPositions
		) {
			goalsTabRef.current.snapshotPositions();
		}

		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, ...updatedGoal } : goal
			);

			// Step 2: Perform the sort with the new logic
			const sortedGoals = updatedGoals.sort((a, b) => {
				// Primary sort: Incomplete goals first
				const completionA = a.isCompleted ? 1 : -1;
				const completionB = b.isCompleted ? 1 : -1;
				if (completionA !== completionB) {
					return completionA - completionB;
				}

				// Secondary sort for incomplete goals: Newest (largest timestamp) first
				if (!a.isCompleted && !b.isCompleted) {
					return (
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
					);
				}
				// Secondary sort for completed goals: Oldest (smallest timestamp) first
				else {
					return (
						new Date(a.createdAt).getTime() -
						new Date(b.createdAt).getTime()
					);
				}
			});
			return sortedGoals;
		});
	};

	const handleHabitSelect = (habit) => {
		const newGoal = {
			id: habit.id + Date.now().toString(),
			title: habit.title,
			color: habit.color,
			description: habit.description,
			progress: 0,
			isCompleted: false,
			completedDays: {},
			createdAt: new Date().toISOString(), // Assign a creation timestamp
		};

		setGoals((prevGoals) => {
			const updatedGoals = [...prevGoals, newGoal];
			// Sort immediately after adding the new goal
			const sortedGoals = updatedGoals.sort((a, b) => {
				// Primary sort: Incomplete goals first
				const completionA = a.isCompleted ? 1 : -1;
				const completionB = b.isCompleted ? 1 : -1;
				if (completionA !== completionB) {
					return completionA - completionB;
				}

				// Secondary sort for incomplete goals: Newest (largest timestamp) first
				if (!a.isCompleted && !b.isCompleted) {
					return (
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
					);
				}
				// Secondary sort for completed goals: Oldest (smallest timestamp) first
				else {
					return (
						new Date(a.createdAt).getTime() -
						new Date(b.createdAt).getTime()
					);
				}
			});
			localStorage.setItem('userGoals', JSON.stringify(sortedGoals));
			return sortedGoals;
		});

		toast.success(`${habit.title} added as a goal!`);
	};

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />
			<Header />

			<div className="min-h-screen flex flex-col">
				<div className="flex-grow pb-20">
					{activeTab === 'goals' && (
						<GoalsTab
							ref={goalsTabRef} // Pass the ref to GoalsTab
							goals={goals}
							onReSort={() => {}} // This prop is now redundant as sorting is in App.js
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals} // Still needed for handleDelete directly in GoalsTab
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={habitsByCategory}
							onSelect={handleHabitSelect}
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
