'use client';
import { useState, useEffect } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habits from '@/data/habits.json';
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
		if (goals.length > 0) {
			localStorage.setItem('userGoals', JSON.stringify(goals));
		}
	}, [goals]);

	const onExploreHabitSelected = (habitId) => {
		// let selectedHabit = null;
		// for (const habit of habits) {
		// 	if (habit.id === habitId) {
		// 		selectedHabit = habit;
		// 		break;
		// 	}
		// }
		const selectedHabit = habits.find((habit) => habit.id === habitId);
		if (!selectedHabit) return;

		const uniqueKey = `${habitId}-${Date.now()}`;

		const newGoal = {
			id: uniqueKey,
			title: selectedHabit.title,
			progress: 0,
			totalSegments: habitId === 'hydrate' ? 8 : 1,
			color: selectedHabit.color,
		};
		setGoals([...goals, newGoal]);
		toast.success(`"${selectedHabit.title}" added successfully!`);
	};

	const onGoalEdited = (goalId) => {
		console.log('onGoalEdited', goalId);
	};

	const onReSort = (goals) => {
		setGoals(goals);
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
							habits={habits}
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
