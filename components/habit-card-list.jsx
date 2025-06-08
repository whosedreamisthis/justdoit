import MinimizableCard from './minimizable-card';
import MinimizableCustomCard from './minimizable-custom-card';

export default function HabitCardList({
	habits,
	customHabit,
	selectedGoals,
	onSelect,
	expandedCard,
	onExpand,
}) {
	return (
		<div className="flex flex-col gap-4">
			{customHabit && (
				<MinimizableCustomCard
					onSelect={onSelect}
					isExpanded={expandedCard === 'custom'}
					onExpand={() => onExpand('custom')}
				/>
			)}
			{habits.map((habit, index) => (
				<MinimizableCard
					key={habit.id}
					index={index}
					habit={habit}
					onSelect={onSelect}
					isExpanded={expandedCard === habit.id}
					onExpand={() => onExpand(habit.id)}
				/>
			))}
		</div>
	);
}
