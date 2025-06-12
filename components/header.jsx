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
		// Added 'fixed', 'top-0', 'z-50', and 'bg-white' classes
		// 'fixed' makes it stay in place.
		// 'top-0' anchors it to the top.
		// 'z-50' ensures it stays on top of other content.
		// 'bg-white' gives it a solid background so content doesn't show through.
		<header className="fixed top-0 w-full p-4 flex flex-row justify-end items-center bg-subtle-background z-50">
			{isClient && (
				<SignedIn>
					<UserButton afterSignOutUrl="/" />
				</SignedIn>
			)}
		</header>
	);
}
