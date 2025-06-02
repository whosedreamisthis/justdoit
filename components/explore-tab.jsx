import { useState } from 'react';
import MinimizableCard from './minimizable-card';
import '@/app/globals.css';

export default function ExploreTab({ habitsByCategory, onSelect }) {
	const [expandedCategory, setExpandedCategory] = useState(null);

	const toggleCategory = (category) => {
		setExpandedCategory(expandedCategory === category ? null : category);
	};

	return (
		<div className="p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold text-primary mb-4">
				Explore New Habits
			</h2>

			{/* ✅ Category Headers with Toggle Arrow */}
			<div className="flex flex-col gap-3">
				{Object.keys(habitsByCategory).map((category) => (
					<div
						key={category}
						className="p-3 rounded-lg bg-warm-sand cursor-pointer"
					>
						{/* ✅ Clickable category header */}
						<div
							className="flex justify-between items-center"
							onClick={() => toggleCategory(category)}
						>
							<h3 className="text-lg font-semibold text-charcoal">
								{category}
							</h3>
							<span className="text-xl text-charcoal">
								{expandedCategory === category ? '▼' : '▶'}
							</span>
						</div>

						{/* ✅ Show habits only when category is expanded */}
						{expandedCategory === category && (
							<div className="mt-2 space-y-2 habits-container">
								{habitsByCategory[category].map((habit) => (
									<div
										key={habit.id}
										className="rounded-xl shadow-md p-4 bg-subtle-background"
										style={{ backgroundColor: habit.color }}
									>
										<MinimizableCard
											habit={habit}
											onSelect={onSelect}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
