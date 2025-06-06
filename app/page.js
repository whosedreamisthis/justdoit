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

	// Function to sort goals after an update
	const onReSort = () => {
		setGoals((prevGoals) =>
			[...prevGoals].sort(
				(a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
			)
		);
	};

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

				const sortedGoals = updatedGoals.sort(
					(a, b) =>
						(a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
				);

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

				const sortedGoals = resetGoals.sort(
					(a, b) =>
						(a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
				);

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
		setGoals((prevGoals) => {
			const updatedGoals = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, ...updatedGoal } : goal
			);

			const sortedGoals = updatedGoals.sort(
				(a, b) => (a.isCompleted ? 1 : -1) - (b.isCompleted ? 1 : -1)
			);
			return sortedGoals;
		});
	};
	const handleHabitSelect = (habit) => {
		const newGoal = {
			id: habit.id,
			title: habit.title,
			color: habit.color,
			description: habit.description,
			progress: 0,
			isCompleted: false,
			completedDays: {},
		};

		setGoals((prevGoals) => [...prevGoals, newGoal]);
		localStorage.setItem('userGoals', JSON.stringify([...goals, newGoal]));
		toast.success(`${habit.title} added as a goal!`);
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
