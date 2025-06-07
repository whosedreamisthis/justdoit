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
					createdAt: goal.createdAt || new Date().toISOString(),
				}));

				return loadedGoals.sort((a, b) => {
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
		const midnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);

		// Only reset completed goals exactly at midnight
		if (
			lastDailyResetTime &&
			now.getTime() > midnight.getTime() &&
			lastDailyResetTime.getTime() < midnight.getTime()
		) {
			console.log('Midnight Reset Triggered!');

			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) =>
					goal.isCompleted
						? { ...goal, progress: 0, isCompleted: false }
						: goal
				);

				localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
				setLastDailyResetTime(midnight);
				localStorage.setItem(
					'lastDailyResetTime',
					midnight.toISOString()
				);

				return updatedGoals;
			});
		}
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
			createdAt: new Date().toISOString(),
		};

		setGoals((prevGoals) => {
			const updatedGoals = [...prevGoals, newGoal];
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
							ref={goalsTabRef}
							goals={goals}
							onReSort={() => {}}
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals}
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
