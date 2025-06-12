// page-helper.js

// Empty default export function for potential future use or API consistency
export default function PageHelper() {}

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
