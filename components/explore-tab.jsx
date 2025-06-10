'use client';

import { useState, useEffect, useRef } from 'react';
import MinimizableCustomCard from './minimizable-custom-card';
import MinimizableCard from './minimizable-card';
import EditableHabitCard from './editable-habit-card';
import styles from '@/styles/explore-tab.module.css';
import '@/app/globals.css';

export default function ExploreTab({
	habitsByCategory,
	onSelect,
	onAddCustomHabit, // Received as prop for adding custom habits
	customHabits, // Received as prop (the array of custom habits)
	onUpdateCustomHabit, // Received as prop for updating custom habits
	onDeleteCustomHabit, // Received as prop for deleting custom habits
}) {
	// Initialize expandedCategory to an empty Set on both server and client initially.
	// The localStorage value will be loaded and applied only after hydration to prevent mismatch.
	const [expandedCategory, setExpandedCategory] = useState(new Set());
	const [expandedCard, setExpandedCard] = useState(null);

	// customHabits state removed, now using customHabits prop directly

	const cardRefs = useRef({});

	useEffect(() => {
		// This effect runs only on the client after hydration.
		const saved = localStorage.getItem('expandedCategory');
		if (saved) {
			try {
				setExpandedCategory(new Set(JSON.parse(saved)));
			} catch (e) {
				console.error(
					'Error parsing expandedCategory from localStorage:',
					e
				);
			}
		}
	}, []); // Empty dependency array means it runs once after initial render

	// This useEffect saves the expandedCategory state to localStorage on changes
	useEffect(() => {
		localStorage.setItem(
			'expandedCategory',
			JSON.stringify(Array.from(expandedCategory))
		);
	}, [expandedCategory]);

	// REMOVED: useEffect for saving customHabits to localStorage
	// REMOVED: customHabits state initialization from localStorage

	const toggleCategory = (key) => {
		setExpandedCategory((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
		setExpandedCard(null); // Collapse any open card when category is toggled
	};

	const handleExpandCard = (id) =>
		setExpandedCard((prev) => (prev === id ? null : id));

	// REMOVED: handleAddCustomHabit, handleUpdateCustomHabit, handleDeleteCustomHabit functions
	// These are now expected as props from page.js

	return (
		<div className={`${styles.exploreContainer} p-3 bg-subtle-background`}>
			<h2 className="text-3xl font-bold mb-4 text-primary text-center">
				Explore Habits
			</h2>
			<div className="space-y-4">
				{/* The "Add Custom Habit" card remains the first element */}
				<div
					className="rounded-xl shadow-md overflow-hidden"
					style={{ backgroundColor: '#A7B39E' }}
				>
					<MinimizableCustomCard
						onSelect={onAddCustomHabit} // Now calls the prop function
						isExpanded={expandedCard === 'custom-add'}
						onExpand={() => handleExpandCard('custom-add')}
					/>
				</div>

				{/* Render Pre-defined Categories */}
				{Object.entries(habitsByCategory).map(([cat, habits]) => (
					<div
						key={cat}
						className={`p-3 rounded-lg bg-warm-sand ${styles.categoryContainer}`}
					>
						<div
							role="button"
							tabIndex={0}
							className="flex justify-between items-center cursor-pointer"
							onClick={() => toggleCategory(cat)}
							aria-expanded={expandedCategory.has(cat)}
						>
							<h3 className="text-lg font-semibold text-charcoal">
								{cat}
							</h3>
							<span className={`text-xl ${styles.expandArrow}`}>
								{expandedCategory.has(cat) ? '▼' : '►'}
							</span>
						</div>
						{expandedCategory.has(cat) && (
							<div
								className={`mt-2 space-y-2 ${styles.habitsContainer}`}
							>
								{habits.map((h) => (
									<div
										key={h.id}
										ref={(el) =>
											(cardRefs.current[h.id] = el)
										}
										className="rounded-xl shadow-md overflow-hidden"
										style={{ backgroundColor: h.color }}
									>
										<MinimizableCard
											habit={h}
											onSelect={onSelect}
											isExpanded={expandedCard === h.id}
											onExpand={() =>
												handleExpandCard(h.id)
											}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				))}

				{/* Custom Habits Category - now displays habits from the customHabits prop */}
				<div
					className={`p-3 rounded-lg bg-warm-sand ${styles.categoryContainer}`}
				>
					<div
						role="button"
						tabIndex={0}
						className="flex justify-between items-center cursor-pointer"
						onClick={() => toggleCategory('Custom Habits')}
						aria-expanded={expandedCategory.has('Custom Habits')}
					>
						<h3 className="text-lg font-semibold text-charcoal">
							Custom Habits
						</h3>
						<span className={`text-xl ${styles.expandArrow}`}>
							{expandedCategory.has('Custom Habits') ? '▼' : '►'}
						</span>
					</div>
					{expandedCategory.has('Custom Habits') && (
						<div
							className={`mt-2 space-y-2 ${styles.habitsContainer}`}
						>
							{customHabits.length === 0 ? (
								<p className="text-gray-600 italic p-3">
									Your custom habits will appear here after
									you add them.
								</p>
							) : (
								customHabits.map((h) => (
									<div
										key={h.id}
										ref={(el) =>
											(cardRefs.current[h.id] = el)
										}
										className="rounded-xl shadow-md overflow-hidden"
										style={{ backgroundColor: h.color }}
									>
										<EditableHabitCard
											habit={h}
											onSelect={onSelect}
											onUpdateHabit={onUpdateCustomHabit} // Now calls the prop function
											onDelete={onDeleteCustomHabit} // Now calls the prop function
											isExpanded={expandedCard === h.id}
											onExpand={() =>
												handleExpandCard(h.id)
											}
										/>
									</div>
								))
							)}
						</div>
					)}
				</div>
			</div>
			<div className="flex justify-center items-center min-h-[200px]">
				{!expandedCategory.size && expandedCard === null && (
					<p className="text-gray-600">
						Select a category to see habits.
					</p>
				)}
			</div>
		</div>
	);
}
