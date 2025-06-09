// page-helper.js

// Empty default export function for potential future use or API consistency
export default function PageHelper() {}

// Sort goals: incomplete goals sorted newest-first, completed goals sorted oldest-first
export const sortGoals = (goalsArray) => {
	console.log('SORT GOALS', goalsArray);

	// Separate incomplete and completed goals
	const incomplete = goalsArray.filter((goal) => !goal.isCompleted);
	const completed = goalsArray.filter((goal) => goal.isCompleted);

	// Sort incomplete goals by createdAt descending (newest first)
	incomplete.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	// Sort completed goals by createdAt ascending (oldest first)
	completed.sort(
		(a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);

	// Return combined sorted array: incomplete first, then completed
	return [...incomplete, ...completed];
};
export const preSetGoals = (update, goals, setGoals) => {
	console.log('preSetGoals called with update:', update);
	console.log('preSetGoals called with goals:', goals);

	if (!Array.isArray(goals)) {
		console.error('goals is undefined or not an array:', goals);
		return;
	}

	let finalGoalsArray = typeof update === 'function' ? update(goals) : update;

	if (!Array.isArray(finalGoalsArray)) {
		console.error(
			'finalGoalsArray is undefined or not an array:',
			finalGoalsArray
		);
		return;
	}

	const sortedGoals = sortGoals(finalGoalsArray);

	// FINAL FIX: Always allow empty array update if there are no goals remaining
	if (sortedGoals.length === 0) {
		console.warn(
			'No goals remaining: Allowing state update to empty array.'
		);
		setGoals([]);
		return;
	}

	setGoals(sortedGoals);
};
