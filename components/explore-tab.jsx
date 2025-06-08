'use client';

import { useState, useEffect, useRef } from 'react';
import MinimizableCard from './minimizable-card';
import MinimizableCustomCard from './minimizable-custom-card';
import styles from '@/styles/explore-tab.module.css';
import '@/app/globals.css';

export default function ExploreTab({ habitsByCategory, onSelect }) {
	const [expandedCategory, setExpandedCategory] = useState(new Set());
	const [expandedCard, setExpandedCard] = useState(null);
	// Initialize customHabits from localStorage so it persists across mounts
	const [customHabits, setCustomHabits] = useState(() => {
		try {
			const stored = localStorage.getItem('customHabits');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});

	const cardRefs = useRef({});

	// Persist expanded categories
	useEffect(() => {
		const saved = localStorage.getItem('expandedCategory');
		if (saved) {
			try {
				setExpandedCategory(new Set(JSON.parse(saved)));
			} catch {}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(
			'expandedCategory',
			JSON.stringify(Array.from(expandedCategory))
		);
	}, [expandedCategory]);

	// Persist custom habits whenever they change
	useEffect(() => {
		localStorage.setItem('customHabits', JSON.stringify(customHabits));
	}, [customHabits]);

	const handleAddCustomHabit = (habit) => {
		setCustomHabits((prev) => [...prev, habit]);
		if (typeof onSelect === 'function') onSelect(habit);
		// auto-expand custom category so user sees it
		setExpandedCategory((prev) => {
			const next = new Set(prev);
			next.add('Custom Habits');
			return next;
		});
	};

	const toggleCategory = (key) => {
		setExpandedCategory((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
		setExpandedCard(null);
	};

	const handleExpandCard = (id) => {
		setExpandedCard((prev) => (prev === id ? null : id));
	};

	return (
		<div className={`${styles.exploreContainer} p-3 bg-subtle-background`}>
			<h2 className="text-3xl font-bold mb-4 text-primary text-center">
				Explore Habits
			</h2>

			<div className="space-y-4">
				{/* Always show Add-Custom-Habit card at top */}
				<div className="rounded-xl shadow-md overflow-hidden">
					<MinimizableCustomCard
						onSelect={handleAddCustomHabit}
						isExpanded={expandedCard === 'custom-add'}
						onExpand={() => handleExpandCard('custom-add')}
					/>
				</div>

				{/* Render preset categories */}
				{Object.entries(habitsByCategory).map(([category, habits]) => (
					<div
						key={category}
						className={`p-3 rounded-lg bg-warm-sand ${styles.categoryContainer}`}
					>
						<div
							role="button"
							tabIndex={0}
							className="flex justify-between items-center cursor-pointer"
							onClick={() => toggleCategory(category)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ')
									toggleCategory(category);
							}}
							aria-expanded={expandedCategory.has(category)}
						>
							<h3 className="text-lg font-semibold text-charcoal">
								{category}
							</h3>
							<span className={`text-xl ${styles.expandArrow}`}>
								{expandedCategory.has(category) ? '▼' : '►'}
							</span>
						</div>

						{expandedCategory.has(category) && (
							<div
								className={`mt-2 space-y-2 ${styles.habitsContainer}`}
							>
								{habits.map((habit) => (
									<div
										key={habit.id}
										ref={(el) =>
											(cardRefs.current[habit.id] = el)
										}
										className="rounded-xl shadow-md overflow-hidden"
										style={{ backgroundColor: habit.color }}
									>
										<MinimizableCard
											habit={habit}
											onSelect={onSelect}
											isExpanded={
												expandedCard === habit.id
											}
											onExpand={() =>
												handleExpandCard(habit.id)
											}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				))}

				{/* Custom Habits category at bottom */}
				<div
					className={`p-3 rounded-lg bg-warm-sand ${styles.categoryContainer}`}
				>
					<div
						role="button"
						tabIndex={0}
						className="flex justify-between items-center cursor-pointer"
						onClick={() => toggleCategory('Custom Habits')}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ')
								toggleCategory('Custom Habits');
						}}
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
								customHabits.map((habit) => (
									<div
										key={habit.id}
										ref={(el) =>
											(cardRefs.current[habit.id] = el)
										}
										className="rounded-xl shadow-md overflow-hidden"
										style={{ backgroundColor: habit.color }}
									>
										<MinimizableCard
											habit={habit}
											onSelect={onSelect}
											isExpanded={
												expandedCard === habit.id
											}
											onExpand={() =>
												handleExpandCard(habit.id)
											}
										/>
									</div>
								))
							)}
						</div>
					)}
				</div>
			</div>

			{/* Placeholder when nothing expanded */}
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
