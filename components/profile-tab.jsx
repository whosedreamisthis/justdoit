// profile-tab.jsx
'use client';
import '@/app/globals.css';
import styles from '@/styles/profile-tab.module.css';
import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	SignOutButton,
} from '@clerk/nextjs';

export default function ProfileTab() {
	return (
		// The main container now properly centers content horizontally and
		// allows vertical flow from the top
		<div
			className={`${styles.profileTab} p-6 bg-subtle-background min-h-screen flex flex-col items-center`} // Re-added flex flex-col items-center, ensuring no justify-center
		>
			<h2 className="text-3xl font-bold m-4 text-primary flex flex-col items-center justify-center">
				Profile & Account
			</h2>

			<SignedIn>
				{/* This inner div already correctly centers its specific content */}
				<div className="flex flex-col items-center justify-center">
					<p className="text-lg text-charcoal">You are signed in!</p>
					<SignOutButton mode="modal">
						<button
							className="
                                    px-8 py-3 mt-4 rounded-lg text-lg font-bold
                                    button-secondary-light text-text-on-buttons
                                    hover:bg-button-primary-dark transition-colors duration-200
                                    shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary-light
                                "
						>
							Sign Out
						</button>
					</SignOutButton>
				</div>
			</SignedIn>

			<SignedOut>
				<div className="flex flex-col items-center justify-center space-y-6">
					<p className="text-lg text-charcoal mb-4 text-center max-w-sm">
						Sign in or create an account to personalize your
						experience and track your goals!
					</p>
					<div className="flex flex-row gap-4">
						<SignInButton mode="modal">
							<button
								className="
                                px-8 py-3 rounded-lg text-lg font-bold
                                button-secondary-light text-text-on-buttons
                                hover:bg-button-primary-dark transition-colors duration-200
                                shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary-light
                            "
							>
								Sign In
							</button>
						</SignInButton>
						<SignUpButton mode="modal">
							<button
								className="
                                px-8 py-3 rounded-lg text-lg font-bold
                                button-primary-light text-text-on-buttons
                                hover:bg-button-secondary-dark transition-colors duration-200
                                shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus::ring-offset-2 focus:ring-button-secondary-light
                            "
							>
								Sign Up
							</button>
						</SignUpButton>
					</div>
				</div>
			</SignedOut>
		</div>
	);
}
