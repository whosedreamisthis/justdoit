import { useState } from 'react';
import MinimizableCard from './minimizable-card';
import '@/app/globals.css';

export default function ExploreTab({ habitsByCategory, onSelect }) {
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [expandedCard, setExpandedCard] = useState(null);

	const handleExpand = (id) => {
		setExpandedCard(expandedCard === id ? null : id); // ✅ Toggle expansion
	};

	return (
		<div className="p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold text-primary mb-4">
				Explore New Habits
			</h2>

			{/* ✅ Show categories first */}
			<div className="category-buttons flex gap-4 mb-4">
				{Object.keys(habitsByCategory).map((category) => (
					<button
						key={category}
						onClick={() => setSelectedCategory(category)}
						className={`py-2 px-4 rounded-lg transition-all duration-200 ${
							selectedCategory === category
								? 'bg-charcoal text-white font-bold border-2 border-white' // ✅ Highlight selected
								: 'bg-primary text-charcoal hover:bg-blue-500' // ✅ Normal styling
						}`}
					>
						{category}
					</button>
				))}
			</div>

			{/* ✅ Show habits only when a category is selected */}
			{selectedCategory && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{habitsByCategory[selectedCategory].map((habit) => (
						<div
							key={habit.id}
							className="rounded-xl shadow-md"
							style={{ backgroundColor: habit.color }}
						>
							<MinimizableCard
								habit={habit}
								onSelect={onSelect}
								isExpanded={expandedCard === habit.id}
								onExpand={() => handleExpand(habit.id)}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
