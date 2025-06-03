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
			return storedGoals && storedGoals.length > 0 ? storedGoals : [];
		}
		return [];
	});
	useEffect(() => {
		const now = new Date();
		const tomorrowMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1,
			0,
			0,
			0
		);

		const timeUntilReset = tomorrowMidnight.getTime() - now.getTime();

		console.log('Now:', now.toISOString());
		console.log('Tomorrow Midnight:', tomorrowMidnight.toISOString());
		console.log('Time Until Reset:', timeUntilReset);

		const timer = setTimeout(() => {
			setGoals((prevGoals) =>
				prevGoals.map((goal) => ({ ...goal, progress: 0 }))
			);
		}, timeUntilReset);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (goals.length > 0) {
			localStorage.setItem('userGoals', JSON.stringify(goals));
		}
	}, [goals]);
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
			if (storedGoals) {
				setGoals(storedGoals); // ✅ Reloads exact progress value when switching tabs
			}
		}
	}, [activeTab]);

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
		console.log('onExploreHabitSelected');

		const selectedHabit = findHabit(habitId);
		console.log('2 selectedHabit', selectedHabit);
		if (!selectedHabit) return;

		const uniqueKey = `${habitId}-${Date.now()}`;
		const newGoal = {
			id: uniqueKey,
			title: selectedHabit.title,
			progress: 0,
			totalSegments: selectedHabit.title === 'Daily Hydration' ? 8 : 1,
			color: selectedHabit.color,
			shortDescription: selectedHabit.shortDescription,
		};
		const newGoals = [...goals, newGoal];
		setGoals(newGoals.sort((a, b) => (a.progress === 100 ? 1 : -1)));
		toast.success(`"${selectedHabit.title}" added successfully!`);
	};

	const onGoalEdited = (goalId) => {
		toast.success(`"Goals can't be edited yet.`);
	};

	const onReSort = (goals) => {
		setGoals((prevGoals) =>
			prevGoals.sort((a, b) => (a.progress === 100 ? 1 : -1))
		);
	};
	// console.log(habitsByCategory['Creativity & Nature Connection']);
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
