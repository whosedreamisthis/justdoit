'use client';
import { useState } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habits from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
import GoalsTab from '@/components/goals-tab';
import '@/app/globals.css';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const onExploreHabitSelected = (habitId) => {
		let selectedHabit = null;
		for (const habit of habits) {
			if (habit.id === habitId) {
				selectedHabit = habit;
				break;
			}
		}

		const newGoal = {
			id: selectedHabit.id,
			title: selectedHabit.title,
			progress: 0,
			totalSegments: 8,
		};
		setGoals([...goals, newGoal]);
	};

	const onGoalEdited = (goalId) => {
		console.log('onGoalEdited', goalId);
	};

	return (
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
				{activeTab === 'settings' && <p>Manage your settings here!</p>}
			</div>

			{/* Bottom Navigation */}
			<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
		</div>
	);
}
