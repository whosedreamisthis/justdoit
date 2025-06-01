import { useState } from 'react';
import MinimizableCard from '././minimizable-card';
import '@/app/globals.css';
export default function ExploreTab({ habits, onSelect }) {
	const [expandedCard, setExpandedCard] = useState(null);
	const handleExpand = (id) => {
		setExpandedCard(expandedCard === id ? null : id); // Toggle expansion
	};

	return (
		<div className="p-6 bg-subtle-background">
			{' '}
			{/* ✅ Background stays warm beige */}
			<h2 className="text-3xl font-bold text-primary mb-4">
				Explore New Habits
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{habits.map((habit, index) => {
					console.log(`goal-container bg-card-${index % 5}`);
					return (
						<div
							key={habit.id}
							className={`goal-container bg-card-${index % 5}`}
						>
							{' '}
							{/* ✅ Now each card gets a unique color */}
							<MinimizableCard
								index={index}
								habit={habit}
								onSelect={onSelect}
								isExpanded={expandedCard === habit.id}
								onExpand={() => handleExpand(habit.id)}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
