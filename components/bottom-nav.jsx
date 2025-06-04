import '@/app/globals.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUser,
	faBullseye,
	faCompass,
} from '@fortawesome/free-solid-svg-icons';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
export default function BottomTabs({ activeTab, setActiveTab }) {
	const tabs = [
		{ id: 'goals', label: 'Goals', icon: faBullseye },
		{ id: 'explore', label: 'Explore', icon: faCompass },
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
			<div className="profile flex flex-col justify-end pb-1 border-t-1">
				<button
					className={`
                    flex flex-col items-center justify-center
                    flex-grow                 // Makes the button take up equal space
                    px-2 py-3                 // Adds generous padding for clickable area
                    text-sm
                    ${
						activeTab === 'profile'
							? 'text-primary font-semibold'
							: 'text-gray-500'
					}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary // Accessibility: visual feedback on focus
                    transition-colors duration-200 // Smooth color changes
                `}
					onClick={() => setActiveTab('profile')} // Attach onClick to the button
					aria-label="Profile" // Important for accessibility
				>
					<SignedIn>
						<UserButton />
					</SignedIn>
					<SignedOut>
						<FontAwesomeIcon
							icon={faUser}
							size="lg" // Use size="lg" or "xl" for better visibility
							className="mb-1" // Add some margin below the icon if you have text
						/>
					</SignedOut>
					{/* Add text label if desired, e.g., <span>Profile</span> */}
				</button>
			</div>
		</div>
	);
}
