export default function BottomTabs({ activeTab, setActiveTab }) {
	const tabs = [
		{ id: 'goals', label: 'Goals' },
		{ id: 'explore', label: 'Explore' },
		{ id: 'settings', label: 'Settings' },
	];

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-subtle-background shadow-lg border-t flex justify-around py-2">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					className={`flex-1 text-center py-3 font-semibold text-lg transition-all ${
						activeTab === tab.id
							? 'active-tab text-white rounded-lg'
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
