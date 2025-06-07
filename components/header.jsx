// components/header.jsx
'use client';
import { SignedIn, UserButton } from '@clerk/nextjs';
import '@/app/globals.css'; // Ensure global styles are available for Tailwind classes

export default function Header() {
	return (
		<header className="w-full p-4 bg-primary text-text-on-buttons shadow-md flex justify-between items-center fixed top-0 left-0 z-50">
			<h1 className="text-2xl font-bold">Goal Tracker</h1>
			<SignedIn>
				{/* The UserButton provides a dropdown for user management */}
				<UserButton />
			</SignedIn>
		</header>
	);
}
