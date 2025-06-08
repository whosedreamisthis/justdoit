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

// Wrapper for setting goals with sorting and safety check to prevent wiping out goals accidentally
export const preSetGoals = (update, goals, setGoals) => {
	console.log('preSetGoals called with:', update);

	// Determine final goals array after applying update (function or direct array)
	let finalGoalsArray = typeof update === 'function' ? update(goals) : update;

	console.log('Current goals before update:', goals);
	console.log('Final goals array before sorting:', finalGoalsArray);

	// Sort goals before setting state
	const sortedGoals = sortGoals(finalGoalsArray);
	console.log('Sorted goals before setting state:', sortedGoals);

	// Safety check: prevent wiping out all goals unintentionally
	if (!sortedGoals || sortedGoals.length === 0) {
		console.warn('Skipping update: Preventing accidental wipe.');
		return;
	}

	// Set the sorted goals in state
	setGoals(sortedGoals);
};
