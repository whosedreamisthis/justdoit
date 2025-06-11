// components/explore-tab.js
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
	onAddCustomHabit,
	customHabits, // Still passed as a prop, though primarily used by MinimizableCustomCard
	onUpdateCustomHabit,
	onDeleteCustomHabit,
	expandedCategory,
	setExpandedCategory,
}) {
	// const [expandedCategory, setExpandedCategory] = useState(new Set());
	const [expandedCard, setExpandedCard] = useState(null);
	const cardRefs = useRef({});

	// useEffect(() => {
	// 	localStorage.setItem(
	// 		'expandedCategory',
	// 		JSON.stringify(Array.from(expandedCategory))
	// 	);
	// }, [expandedCategory]);

	const toggleCategory = (key) => {
		setExpandedCategory((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
		setExpandedCard(null);
	};

	const handleExpandCard = (id) =>
		setExpandedCard((prev) => (prev === id ? null : id));

	return (
		<div className={`${styles.exploreContainer} p-3 bg-subtle-background`}>
			<h2 className="text-3xl font-bold mb-4 text-primary text-center">
				Explore Habits
			</h2>
			<div className="space-y-4">
				{/* This "Add Custom Habit" card remains the first element */}
				<div
					className="rounded-xl shadow-md overflow-hidden"
					style={{ backgroundColor: '#A7B39E' }}
				>
					<MinimizableCustomCard
						onSelect={onAddCustomHabit}
						isExpanded={expandedCard === 'custom-add'}
						onExpand={() => handleExpandCard('custom-add')}
					/>
				</div>

				{/* Render ALL Categories dynamically, including 'Your Custom Habits' */}
				{Object.entries(habitsByCategory).map(([cat, habits]) => {
					// Determine if the current category being mapped is "Your Custom Habits"
					const isCustomHabitsCategory = cat === 'Your Custom Habits';

					// If it's the "Your Custom Habits" category and there are no custom habits,
					// or if it's any other category and it's empty, display a message.
					const displayEmptyMessage =
						habits.length === 0 &&
						(isCustomHabitsCategory ||
							cat !== 'Your Custom Habits');

					return (
						<div
							key={cat}
							className={`p-3 rounded-lg bg-warm-sand ${styles.categoryContainer} border-1`}
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
								<span
									className={`text-xl ${styles.expandArrow}`}
								>
									{expandedCategory.has(cat) ? '▼' : '►'}
								</span>
							</div>
							{expandedCategory.has(cat) && (
								<div
									className={`mt-2 space-y-2 ${styles.habitsContainer}`}
								>
									{displayEmptyMessage ? (
										<p className="text-gray-600 italic p-3">
											{isCustomHabitsCategory
												? 'Your custom habits will appear here after you add them.'
												: 'No habits in this category yet.'}
										</p>
									) : (
										habits.map((h) => (
											<div
												key={h.id}
												ref={(el) =>
													(cardRefs.current[h.id] =
														el)
												}
												className="rounded-xl shadow-md overflow-hidden"
												style={{
													backgroundColor: h.color,
												}}
											>
												{/* Use EditableHabitCard for custom habits, MinimizableCard for others */}
												{isCustomHabitsCategory ? (
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
		</div>
	);
}
