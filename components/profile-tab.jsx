// profile-tab.jsx
'use client';
import '@/app/globals.css';
import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
} from '@clerk/nextjs';

export default function ProfileTab() {
	return (
		// The main container should have your background color if it's not inherited
		<div className="profile-tab p-6 bg-subtle-background min-h-screen flex flex-col items-center justify-center">
			<h2 className="text-3xl font-bold text-primary mb-6">
				Profile & Account
			</h2>

			<SignedIn>
				<p className="text-lg text-charcoal">You are signed in!</p>
			</SignedIn>

			<SignedOut>
				<div className="flex flex-col items-center justify-center space-y-6">
					<p className="text-lg text-charcoal mb-4 text-center max-w-sm">
						Sign in or create an account to personalize your
						experience and track your goals!
					</p>
					<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
                                shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-secondary-light
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
