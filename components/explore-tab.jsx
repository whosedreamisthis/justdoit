// components/explore-tab.js
'use client';

import { useState, useEffect, useRef } from 'react';
import MinimizableCustomCard from './minimizable-custom-card';
import MinimizableCard from './minimizable-card';
import EditableHabitCard from './editable-habit-card';
import styles from '@/styles/explore-tab.module.css';
import '@/app/globals.css';
// FontAwesome imports are no longer needed if the button is removed, but I'll leave them if other icons are used.
// Checking the current file, faPlus is the only FontAwesome usage related to the removed button.
// If no other FontAwesomeIcons are used in explore-tab.jsx, you can remove these two lines as well:
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function ExploreTab({
	habitsByCategory,
	onSelect,
	onAddCustomHabit, // This prop might become unused if no other 'Add Custom Habit' mechanism exists
	customHabits,
	onUpdateCustomHabit,
	onDeleteCustomHabit,
	expandedCategory,
	setExpandedCategory,
}) {
	const [expandedCard, setExpandedCard] = useState(null);
	const cardRefs = useRef({});
	const categoryRefs = useRef({}); // New ref for categories

	const toggleCategory = (key) => {
		setExpandedCategory((prev) => {
			const next = new Set(prev);
			const willExpand = !next.has(key); // Check if the category is about to expand
			next.has(key) ? next.delete(key) : next.add(key);

			// If the category is expanding, scroll to it
			if (willExpand && categoryRefs.current[key]) {
				// Use a timeout to allow the DOM to update before scrolling
				setTimeout(() => {
					categoryRefs.current[key].scrollIntoView({
						behavior: 'smooth',
						block: 'start', // Scroll to the top of the category
					});
				}, 100); // Small delay to ensure rendering
			}

			return next;
		});
		setExpandedCard(null);
	};

	const handleExpandCard = (id) =>
		setExpandedCard((prev) => (prev === id ? null : id));

	return (
		<div className={`${styles.exploreContainer} p-3 bg-subtle-background`}>
			<div className="space-y-4">
				{/* "Add Custom Habit" card remains */}
				<div
					className="rounded-xl shadow-md"
					style={{ backgroundColor: '#A7B39E' }}
				>
					<MinimizableCustomCard
						onSelect={onAddCustomHabit}
						isExpanded={expandedCard === 'custom-add'}
						onExpand={() => handleExpandCard('custom-add')}
					/>
				</div>

				{Object.entries(habitsByCategory).map(([category, habits]) => {
					const isCustomCategory = category === 'Your Custom Habits';

					const displayEmptyMessage =
						habits.length === 0 &&
						(isCustomCategory || category !== 'Your Custom Habits');

					return (
						<div
							key={category}
							ref={(el) => (categoryRefs.current[category] = el)} // Attach ref to category div
							className={`p-3 rounded-lg bg-warm-sand ${styles.categoryContainer} border-1`}
						>
							<div
								role="button"
								tabIndex={0}
								className="flex justify-between items-center cursor-pointer"
								onClick={() => toggleCategory(category)}
								aria-expanded={expandedCategory.has(category)}
							>
								<h3 className="text-lg font-semibold text-charcoal">
									{category}
								</h3>
								<span
									className={`text-xl ${styles.expandArrow}`}
								>
									{expandedCategory.has(category) ? '▼' : '►'}
								</span>
							</div>
							{expandedCategory.has(category) && (
								<div
									className={`mt-2 space-y-2 ${styles.habitsContainer}`}
								>
									{displayEmptyMessage ? (
										<p className="text-gray-600 italic p-3">
											{isCustomCategory
												? 'Your custom habits will appear here after you add them.'
												: 'No habits in this category yet.'}
										</p>
									) : (
										habits.map((h) => (
											<div
												key={h.id}
												className="rounded-xl shadow-md"
												style={{
													backgroundColor: h.color,
												}}
											>
												{isCustomCategory ? (
													<EditableHabitCard
														habit={h}
														onSelect={onSelect}
														onUpdateHabit={
															onUpdateCustomHabit
														}
														onDelete={
															onDeleteCustomHabit
														}
														isExpanded={
															expandedCard ===
															h.id
														}
														onExpand={() =>
															handleExpandCard(
																h.id
															)
														}
													/>
												) : (
													<MinimizableCard
														habit={h}
														onSelect={onSelect}
														isExpanded={
															expandedCard ===
															h.id
														}
														onExpand={() =>
															handleExpandCard(
																h.id
															)
														}
													/>
												)}
											</div>
										))
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
			<div className="flex justify-center items-center min-h-[200px]">
				{!expandedCategory.size && expandedCard === null && (
					<p className="text-gray-600">
						Select a category to see habits.
					</p>
				)}
			</div>
			{/* The "Add Custom Habit Button" (blue plus button) has been removed from here. */}
		</div>
	);
}
