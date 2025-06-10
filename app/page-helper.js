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

/**
 * Prepares goal data for archiving by returning its completedDays.
 * The actual archiving (saving to DB) is handled in page.js based on this return value.
 *
 * @param {Object} goal The goal object to be archived.
 * @returns {Object|null} The `completedDays` object of the goal, or null if invalid input.
 */
export const archiveGoal = (goal) => {
	if (
		!goal ||
		typeof goal.title !== 'string' ||
		typeof goal.completedDays !== 'object'
	) {
		console.warn('archiveGoal received invalid goal:', goal);
		return null; // Return null to indicate failure or invalid input
	}
	// Return the completedDays to be handled by the parent component (page.js)
	// No localStorage interaction here.
	return goal.completedDays;
};

// Removed: restoreGoal is no longer needed as archivedGoals will be loaded directly from DB into page.js state.

/**
 * Handles the setting of goals, including sorting them.
 * This function is designed to be used with a `setGoals` state setter in a React component.
 *
 * @param {Function|Array} update A function that receives the current goals and returns the new array,
 * or directly the new array of goals.
 * @param {Array} goals The current goals array state.
 * @param {Function} setGoals The React state setter function for goals.
 */
export const preSetGoals = (update, goals, setGoals) => {
	console.log('preSetGoals goals', goals);
	if (!Array.isArray(goals)) {
		console.error('goals is undefined or not an array:', goals);
		return;
	}

	let finalGoalsArray = typeof update === 'function' ? update(goals) : update;
	console.log('finalGoalsArray', finalGoalsArray);
	if (!Array.isArray(finalGoalsArray)) {
		console.error(
			'finalGoalsArray is undefined or not an array:',
			finalGoalsArray
		);
		return;
	}

	const sortedGoals = sortGoals(finalGoalsArray);

	// Always allow empty array update if there are no goals remaining
	if (sortedGoals.length === 0) {
		console.warn(
			'No goals remaining: Allowing state update to empty array.'
		);
		setGoals([]);
		return;
	}

	setGoals(sortedGoals);
};
