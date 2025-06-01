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
			<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
				{habits.map((habit, index) => {
					console.log('object');
					return (
						<div
							key={habit.id}
							className={`rounded-xl shadow-md`}
							style={{ backgroundColor: `${habit.color}` }}
						>
							{/* ✅ Background color applies directly to the card */}
							<MinimizableCard
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
