export default function PageHelper() {}

export const sortGoals = (goalsArray) => {
	console.log('SORT GOALS', goalsArray);
	const incomplete = goalsArray.filter((goal) => !goal.isCompleted);
	const completed = goalsArray.filter((goal) => goal.isCompleted);

	incomplete.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
	completed.sort(
		(a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);

	return [...incomplete, ...completed];
};

export const preSetGoals = (update, goals, setGoals) => {
	console.log('preSetGoals called with:', update);

	let finalGoalsArray = typeof update === 'function' ? update(goals) : update;
	console.log('Current goals before update:', goals);
	console.log('Final goals array before sorting:', finalGoalsArray);

	const sortedGoals = sortGoals(finalGoalsArray);
	console.log('Sorted goals before setting state:', sortedGoals);

	if (!sortedGoals || sortedGoals.length === 0) {
		console.warn('Skipping update: Preventing accidental wipe.');
		return;
	}

	setGoals(sortedGoals);
};
