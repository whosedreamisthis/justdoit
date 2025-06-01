'use client';
import { useState } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habits from '@/data/habits.json';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	console.log(habits);
	return (
		<div className="min-h-screen flex flex-col">
			{/* Tab Content */}
			<div className="flex-grow p-4 pb-20">
				{activeTab === 'goals' && <p>Track current habits</p>}
				{activeTab === 'explore' && <p>Explore new habits.</p>}
				{activeTab === 'settings' && <p>Manage your settings here!</p>}
			</div>

			{/* Bottom Navigation */}
			<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
		</div>
	);
}
