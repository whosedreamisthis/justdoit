'use client';
import { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from '@heroui/react';
function BottomTabs({ tabs, activeTab, setActiveTab }) {
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around py-2">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					className={`flex-1 text-center py-3 font-semibold text-lg transition-all ${
						activeTab === tab.id
							? 'bg-sky-500 text-white rounded-lg'
							: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
					}`}
					onClick={() => setActiveTab(tab.id)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}

export default function App() {
	const [activeTab, setActiveTab] = useState('home');

	const tabs = [
		{ id: 'explore', label: 'Explore', content: <p>Explore new habits</p> },
		{
			id: 'goals',
			label: 'Goals',
			content: <p>Goals here</p>,
		},
		{ id: 'about', label: 'About', content: <p>About Us Section</p> },
	];
	console.log(tabs);

	return (
		<div className="min-h-screen flex flex-col">
			{/* Main content area */}
			<div className="flex-grow p-4 pb-20">
				{tabs.find((tab) => tab.id === activeTab)?.content}
			</div>

			{/* Bottom Navigation */}
			<BottomTabs
				tabs={tabs}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
		</div>
	);
}
