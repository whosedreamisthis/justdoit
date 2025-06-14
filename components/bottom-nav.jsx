// components/bottom-nav.jsx
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUser,
	faHome,
	faMagnifyingGlass,
	faChartSimple,
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/styles/bottom-nav.module.css'; // Correct path to your CSS Module

export default function BottomTabs({ activeTab, setActiveTab }) {
	const tabs = [
		{ id: 'goals', label: 'Goals', icon: faHome },
		{ id: 'explore', label: 'Explore', icon: faMagnifyingGlass },
		{ id: 'stats', label: 'Stats', icon: faChartSimple },
		// { id: 'profile', label: 'Profile', icon: faUser },
	];

	return (
		// Corrected className usage for CSS Module and Tailwind
		<div
			className={`fixed shadow-lg flex justify-around ${styles.tabButtons}`}
		>
			{tabs.map((tab) => (
				<button
					// Using tab.id for a stable key to avoid hydration mismatches
					key={tab.id}
					className={`flex-1 text-center py-3 font-semibold text-lg transition-all ${
						activeTab === tab.id
							? styles.activeTab // Correctly applying activeTab from the module
							: 'text-charcoal bg-subtle hover:button-secondary-light' // Assuming these are Tailwind or global classes
					}`}
					onClick={() => {
						// THIS IS THE ONLY LINE NEEDED HERE for tab functionality
						setActiveTab(tab.id);
						// The problematic document.querySelector().addEventListener() line has been removed.
					}}
				>
					<div className="flex flex-col items-center">
						<FontAwesomeIcon
							icon={tab.icon}
							color={activeTab === tab.id ? '#F7F3EB' : '#3b3b3b'}
							size="lg"
							className="mb-1"
						/>
						<span style={{ fontSize: '12px' }}>{tab.label}</span>
					</div>
				</button>
			))}
		</div>
	);
}
