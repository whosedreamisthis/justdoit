import '@/app/globals.css';

export default function BottomTabs({ activeTab, setActiveTab }) {
	const tabs = [
		{ id: 'goals', label: 'Goals' },
		{ id: 'explore', label: 'Explore' },
		// { id: 'settings', label: 'Settings' },
	];

	return (
		<div className="tab-buttons botton-nav fixed bottom-0 left-0 right-0 bg-subtle-background shadow-lg border-t flex justify-around">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					className={`flex-1 text-center py-3 font-semibold text-lg transition-all ${
						activeTab === tab.id
							? 'active-tab'
							: 'text-charcoal bg-subtle hover:bg-gray-200 border-2'
					}`}
					onClick={() => {
						setActiveTab(tab.id);
						document
							.querySelector('.tab-buttons')
							.addEventListener('click', () => {
								console.log('Tab button clicked!');
							});
					}}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
