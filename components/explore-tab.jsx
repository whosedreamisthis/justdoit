import { useState, useEffect, useRef } from 'react';
import MinimizableCard from './minimizable-card';
import '@/app/globals.css';
import MinimizableCustomCard from './minimizable-custom-card'; // Import the new custom card

export default function ExploreTab({ habitsByCategory, onSelect }) {
	// Change expandedCategory to a Set to allow multiple categories to be expanded
	const [expandedCategory, setExpandedCategory] = useState(new Set());
	const [expandedCard, setExpandedCard] = useState(null);

	const cardRefs = useRef({});

	useEffect(() => {
		const savedCategory = localStorage.getItem('expandedCategory');
		if (savedCategory) {
			// When loading from localStorage, convert the saved string back to a Set
			try {
				const parsedCategories = JSON.parse(savedCategory);
				if (Array.isArray(parsedCategories)) {
					setExpandedCategory(new Set(parsedCategories));
				}
			} catch (e) {
				console.error('Failed to parse saved expanded categories:', e);
				// Fallback to empty Set if parsing fails
				setExpandedCategory(new Set());
			}
		}
	}, []);

	// Update localStorage whenever expandedCategory changes
	useEffect(() => {
		localStorage.setItem(
			'expandedCategory',
			JSON.stringify(Array.from(expandedCategory))
		);
	}, [expandedCategory]);

	const displayCustomCard = () => {
		return (
			<div
				className="rounded-xl shadow-md bg-subtle-background"
				style={{ backgroundColor: '#828E6F' }} // This color will be overridden by custom card's state
			>
				<MinimizableCustomCard
					onSelect={onSelect}
					isExpanded={expandedCard === 'custom'}
					onExpand={() => handleExpand('custom')}
				/>
			</div>
		);
	};

	// Modified toggleCategory to add/remove categories from the Set
	const toggleCategory = (category) => {
		setExpandedCategory((prevExpanded) => {
			const newExpanded = new Set(prevExpanded); // Create a new Set to avoid direct mutation
			if (newExpanded.has(category)) {
				newExpanded.delete(category); // If already expanded, minimize it
			} else {
				newExpanded.add(category); // If not expanded, expand it
			}
			return newExpanded;
		});
		// Also ensure individual cards within the category are minimized when category is toggled
		setExpandedCard(null);
	};

	const handleExpand = (id) => {
		setExpandedCard((prevExpandedCard) =>
			prevExpandedCard === id ? null : id
		);
	};

	return (
		<div className="explore-container p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold mb-4 text-primary">
				Explore Habits
			</h2>

			<div className="space-y-4">
				{/* Custom Card */}
				{displayCustomCard()}

				{Object.keys(habitsByCategory).map((category) => (
					<div
						key={category}
						className="p-3 rounded-lg bg-warm-sand cursor-pointer category-container"
					>
						<div
							className="flex justify-between items-center"
							onClick={() => toggleCategory(category)}
						>
							<h3 className="text-lg font-semibold text-charcoal">
								{category}
							</h3>

							<span className="text-xl expand-arrow">
								{/* Check if the category is in the Set */}
								{expandedCategory.has(category) ? '▼' : '►'}
							</span>
						</div>
						{/* Render content if the category is in the Set */}
						{expandedCategory.has(category) && (
							<div className="mt-2 space-y-2 habits-container">
								{habitsByCategory[category].map((habit) => (
									<div
										key={habit.id}
										ref={(el) =>
											(cardRefs.current[habit.id] = el)
										}
										className="rounded-xl shadow-md bg-subtle-background"
										style={{ backgroundColor: habit.color }}
									>
										<MinimizableCard
											habit={habit}
											onSelect={onSelect}
											isExpanded={
												expandedCard === habit.id
											}
											onExpand={() =>
												handleExpand(habit.id)
											}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
			<div className="flex justify-center items-center min-h-[200px]">
				{!expandedCategory.size > 0 && expandedCard === null && (
					<p className="text-gray-600">
						Select a category to see habits.
					</p>
				)}
			</div>
		</div>
	);
}
