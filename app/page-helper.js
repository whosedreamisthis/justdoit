// page-helper.js

// Empty default export function for potential future use or API consistency
export default function PageHelper() {}

// Sort goals: incomplete goals sorted newest-first, completed goals sorted oldest-first
export const sortGoals = (goalsArray) => {
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

// Store completedDays when deleting a goal with minimal validation
export const archiveGoal = (goal) => {
	if (
		!goal ||
		typeof goal.title !== 'string' ||
		typeof goal.completedDays !== 'object'
	) {
		console.warn('archiveGoal received invalid goal:', goal);
		return;
	}
	let archivedGoals = JSON.parse(localStorage.getItem('archivedGoals')) || {};
	archivedGoals[goal.title] = goal.completedDays; // Save completedDays
	localStorage.setItem('archivedGoals', JSON.stringify(archivedGoals));
};

// Retrieve completedDays when re-adding a goal
export const restoreGoal = (goalTitle) => {
	let archivedGoals = JSON.parse(localStorage.getItem('archivedGoals')) || {};

	return archivedGoals[goalTitle] || {}; // Retrieve past stats
};

export const preSetGoals = (update, goals, setGoals) => {
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
