'use client';

import { useState, useEffect, useRef } from 'react';
import MinimizableCustomCard from './minimizable-custom-card';
import MinimizableCard from './minimizable-card';
import EditableHabitCard from './editable-habit-card';
import styles from '@/styles/explore-tab.module.css';
import '@/app/globals.css';

export default function ExploreTab({ habitsByCategory, onSelect }) {
	const [expandedCategory, setExpandedCategory] = useState(new Set());
	const [expandedCard, setExpandedCard] = useState(null);
	const [customHabits, setCustomHabits] = useState(() => {
		try {
			const stored = localStorage.getItem('customHabits');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});
	console.log('Loaded custom habits:', customHabits);

	const cardRefs = useRef({});

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
	useEffect(() => {
		localStorage.setItem('customHabits', JSON.stringify(customHabits));
	}, [customHabits]);

	const handleAddCustomHabit = (habit) => {
		console.log('Adding custom habit:', habit);

		setCustomHabits((prev) => [...prev, habit]);
		onSelect?.(habit);
		setExpandedCategory((prev) => new Set(prev).add('Custom Habits'));
	};
	const handleUpdateCustomHabit = (id, updated) =>
		setCustomHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
	const handleDeleteCustomHabit = (id) =>
		setCustomHabits((prev) => prev.filter((h) => h.id !== id));

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
				<div className="rounded-xl shadow-md overflow-hidden">
					<MinimizableCustomCard
						onSelect={handleAddCustomHabit}
						isExpanded={expandedCard === 'custom-add'}
						onExpand={() => handleExpandCard('custom-add')}
					/>
				</div>
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
											onUpdateHabit={
												handleUpdateCustomHabit
											}
											onDelete={handleDeleteCustomHabit}
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
