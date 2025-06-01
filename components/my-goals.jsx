'use client';
import React from 'react';
import Link from 'next/link';
import { useGoals } from '@/components/goals-context';

const MyGoals = () => {
	const { goals } = useGoals();

	return (
		<div>
			<h2>My Goals</h2>
			{goals.length > 0 ? (
				<ul>
					{goals.map((goal) => (
						<li key={goal.id}>
							<Link href={`/habit/${goal.id}`}>{goal.title}</Link>
						</li>
					))}
				</ul>
			) : (
				<p>No goals selected yet.</p>
			)}
		</div>
	);
};

export default MyGoals;
