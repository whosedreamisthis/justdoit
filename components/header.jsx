// components/header.jsx
'use client'; // Ensure this is a client component

import { SignedIn, UserButton } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

export default function Header() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		// Removed background, border, shadow, and justify-between.
		// Using flex-row and justify-end to push UserButton to the right.
		<header className="w-full p-4 flex flex-row justify-end items-center">
			{/* Removed the <h1> title here */}
			{isClient && (
				<SignedIn>
					{/* UserButton will have default styling unless overridden by Clerk's theming */}
					<UserButton afterSignOutUrl="/" />
				</SignedIn>
			)}
		</header>
	);
}
