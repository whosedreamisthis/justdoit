import '@/app/globals.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUser,
	faBullseye,
	faCompass,
	faHome,
	faMagnifyingGlass,
	faChartSimple,
	faC,
} from '@fortawesome/free-solid-svg-icons';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
export default function BottomTabs({ activeTab, setActiveTab }) {
	const tabs = [
		{ id: 'goals', label: 'Goals', icon: faHome },
		{ id: 'explore', label: 'Explore', icon: faMagnifyingGlass },
		{ id: 'stats', label: 'Stats', icon: faChartSimple },

		{ id: 'profile', label: 'Profile', icon: faUser },
	];

	return (
		<div className="tab-buttons fixed su shadow-lg flex justify-around">
			{tabs.map((tab) => (
				<button
					key={tab.id + Date.now().toString()}
					className={`flex-1 text-center py-3 font-semibold text-lg transition-all ${
						activeTab === tab.id
							? 'active-tab'
							: 'text-charcoal bg-subtle hover:button-secondary-light'
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
					<div className="flex flex-col" style={{ fontSize: '12px' }}>
						{tab.id !== 'profile' && (
							<FontAwesomeIcon
								icon={tab.icon}
								color={
									activeTab === tab.id ? '#f3dac4' : '3b3b3b'
								}
								size="lg" // Use size="lg" or "xl" for better visibility
								className="mb-1" // Add some margin below the icon if you have text
							/>
						)}
						{tab.id === 'profile' && (
							<div className="">
								<FontAwesomeIcon
									icon={faUser}
									color={
										activeTab === tab.id
											? '#f3dac4'
											: '3b3b3b'
									}
									size="lg" // Use size="lg" or "xl" for better visibility
									className="mb-1"
								/>
							</div>
						)}
					</div>
				</button>
			))}
		</div>
	);
}
