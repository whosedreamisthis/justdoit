'use client';
import { useState } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habits from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
import GoalsTab from '@/components/goals-tab';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import '@/app/globals.css';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
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

		console.log('SELECTED HABIT COLOR', selectedHabit.color);
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

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />

			<div className="min-h-screen flex flex-col">
				{/* Tab Content */}
				<div className="flex-grow p-4 pb-20">
					{activeTab === 'goals' && (
						<GoalsTab goals={goals} onEdit={onGoalEdited} />
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
