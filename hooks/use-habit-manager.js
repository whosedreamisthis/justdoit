import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchHabits, saveGoalsToDB } from '@/lib/api';

export default function useHabitManager() {
	const [displayedHabits, setDisplayedHabits] = useState([]);
	const [customHabit, setCustomHabit] = useState({});
	const [selectedGoals, setSelectedGoals] = useState([]);
	const [expandedCard, setExpandedCard] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		(async () => {
			const data = await fetchHabits();
			setDisplayedHabits(data.habits);
			setCustomHabit(data.customHabit);
		})();
	}, []);

	const toggleGoalSelection = (habit) => {
		setSelectedGoals((prev) => {
			const exists = prev.find((h) => h.id === habit.id);
			if (exists) {
				return prev.filter((h) => h.id !== habit.id);
			} else {
				return [...prev, habit];
			}
		});
	};

	const expandCard = (id) => {
		setExpandedCard((prev) => (prev === id ? null : id));
	};

	const saveGoals = async () => {
		setIsSaving(true);
		try {
			await saveGoalsToDB(selectedGoals);
			oast.success('Goals saved successfully');
		} catch (error) {
			toast.error('Failed to save goals');
		} finally {
			setIsSaving(false);
		}
	};

	return {
		displayedHabits,
		customHabit,
		selectedGoals,
		toggleGoalSelection,
		expandedCard,
		expandCard,
		saveGoals,
		isSaving,
	};
}
