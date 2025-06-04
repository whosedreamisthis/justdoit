import { useState, useEffect, useRef } from 'react';
import MinimizableCard from './minimizable-card';
import '@/app/globals.css';

export default function ExploreTab({ habitsByCategory, onSelect }) {
	const [expandedCategory, setExpandedCategory] = useState(null);
	const [expandedCard, setExpandedCard] = useState(null);

	const cardRefs = useRef({});

	useEffect(() => {
		const savedCategory = localStorage.getItem('expandedCategory');
		if (savedCategory) {
			setExpandedCategory(savedCategory);
		}
	}, []);

	const displayCustomCard = () => {
		const customHabit = {
			id: 'custom-id',
			title: 'custom title',
			color: '#ff0000',
			shortDescription: 'short custom habit description',
			detailedDescription: '',
		};
		return (
			<div
				// 	key={habit.id}
				// 	ref={(el) =>
				// 		(cardRefs.current[habit.id] = el)
				// 	}
				className="rounded-xl shadow-md bg-subtle-background"
				style={{ backgroundColor: 'red' }}
			>
				<MinimizableCard
					habit={customHabit}
					onSelect={onSelect}
					isExpanded={expandedCard === 'custom'}
					onExpand={() => handleExpand('custom')}
				/>
			</div>
		);
	};

	const toggleCategory = (category) => {
		const newCategory = expandedCategory === category ? null : category;
		setExpandedCategory(newCategory);
		localStorage.setItem('expandedCategory', newCategory);
		setExpandedCard(null);
	};

	const handleExpand = (id) => {
		setExpandedCard((prevExpandedCard) => {
			const newExpandedCard = prevExpandedCard === id ? null : id;

			if (newExpandedCard !== null) {
				setTimeout(() => {
					const element = cardRefs.current[newExpandedCard];
					if (element) {
						element.scrollIntoView({
							behavior: 'smooth',
							block: 'center', // Changed from 'nearest' to 'start'
						});
					}
				}, 50);
			}
			return newExpandedCard;
		});
	};

	return (
		<div className="p-6 bg-subtle-background">
			<h2 className="text-3xl font-bold text-primary mb-4">
				Explore New Habits
			</h2>

			<div className="flex flex-col gap-3">
				<div>{displayCustomCard()}</div>

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
								{expandedCategory === category ? '▼' : '►'}
							</span>
						</div>
						{expandedCategory === category && (
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
				{!expandedCategory && (
					<p className="text-lg text-charcoal text-center">
						Find habits that fit your lifestyle—start by choosing a
						category!
					</p>
				)}
			</div>
		</div>
	);
}
