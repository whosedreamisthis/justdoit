// components/header.jsx
'use client';
import { SignedIn, UserButton } from '@clerk/nextjs';
import '@/app/globals.css'; // Ensure global styles are available for Tailwind classes

export default function Header() {
	return (
		<header className="w-full p-4 flex justify-end items-center fixed top-0 left-0 z-50">
			{/* The title "Goal Tracker" has been removed */}
			<SignedIn>
				{/* The UserButton is now the only element inside the header, positioned to the top right */}
				<UserButton />
			</SignedIn>
		</header>
	);
}
