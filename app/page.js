'use client';
import { useState } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habits from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');

	const onExploreHabitSelected = (habitId) => {
		console.log('habit selected', habitId);
	};
	return (
		<div className="min-h-screen flex flex-col">
			{/* Tab Content */}
			<div className="flex-grow p-4 pb-20">
				{activeTab === 'goals' && <p>Track current habits</p>}
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
