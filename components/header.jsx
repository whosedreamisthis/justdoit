// components/header.jsx
'use client'; // Ensure this is a client component

import { SignedIn, UserButton } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

export default function Header({ title }) {
	// Accept title prop
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<header className="fixed top-0 w-full p-4 flex flex-row justify-between items-center bg-subtle-background z-50">
			{/* Changed to justify-between */}
			<h1 className="text-xl font-bold text-primary">{title}</h1>{' '}
			{/* Display the title */}
			{isClient && (
				<SignedIn>
					<UserButton afterSignOutUrl="/" />
				</SignedIn>
			)}
		</header>
	);
}
