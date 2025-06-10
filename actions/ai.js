'use server';
import db from '@/utils/db';
import Query from '@/models/query';

/**
 * Saves a new query or updates an existing one for a given email.
 * This function now handles goals, archived goals, last daily reset time, and custom habits.
 *
 * @param {string} email The email address associated with the query.
 * @param {Array} goals An array of goal objects.
 * @param {Object} archivedGoals An object containing archived goal data.
 * @param {Date|null} lastDailyResetTime The timestamp of the last daily reset, or null.
 * @param {Array} customHabits An array of custom habit objects.
 * @returns {Promise<{ ok: boolean, result?: Object, error?: any }>} An object indicating success or failure,
 * and either the updated/created query document or an error object.
 */
export async function saveQuery(
	email,
	goals,
	archivedGoals,
	lastDailyResetTime,
	customHabits // Added customHabits parameter
) {
	try {
		await db(); // Ensure database connection is established

		// Convert lastDailyResetTime to a Date object if it's not null/undefined
		const resetTimeForDb =
			lastDailyResetTime instanceof Date
				? lastDailyResetTime
				: lastDailyResetTime
				? new Date(lastDailyResetTime)
				: null;

		const updateData = {
			goals: goals,
			archivedGoals: archivedGoals,
			lastDailyResetTime: resetTimeForDb, // Use the converted Date object
			customHabits: customHabits, // Include customHabits
			// Mongoose will automatically update 'updatedAt' due to timestamps: true in schema
		};

		const result = await Query.findOneAndUpdate(
			{ email: email }, // Filter: Find a document where the 'email' field matches the provided email
			updateData, // Update: Set the fields to the new values
			{
				upsert: true, // <--- Crucial: If no document matches, create a new one
				new: true, // <--- Important: Return the modified document rather than the original
				setDefaultsOnInsert: true, // Applies schema defaults when upserting a new document
			}
		).lean(); // <--- Add .lean() here to get a plain JS object from Mongoose

		// Manually convert _id and Dates for client-side serialization
		// This is crucial for MongoDB ObjectId and Date objects
		if (result) {
			if (result._id) result._id = result._id.toString();
			if (result.createdAt)
				result.createdAt = result.createdAt.toISOString();
			if (result.updatedAt)
				result.updatedAt = result.updatedAt.toISOString();
			// Convert lastDailyResetTime to ISO string for client
			if (result.lastDailyResetTime)
				result.lastDailyResetTime =
					result.lastDailyResetTime.toISOString();
		}

		// Ensure the object is a plain JavaScript object before returning to client
		// This is the final safeguard for any nested structures or types
		const safeResult = JSON.parse(JSON.stringify(result));

		return {
			ok: true,
			result: safeResult,
		};
	} catch (error) {
		console.error('Error saving query:', error);
		return {
			ok: false,
			error: error.message || 'Failed to save query',
		};
	}
}

/**
 * Loads the most recent query for a given email address.
 *
 * @param {string} email The email address to search for.
 * @returns {Promise<{ ok: boolean, queries?: Object, error?: any }>} An object indicating success or failure,
 * and either the most recent query or an error object.
 */
export async function loadQueriesByEmail(email) {
	try {
		await db(); // Connect to the database

		const latestQuery = await Query.findOne({ email })
			.sort({ createdAt: -1 })
			.lean(); // Use .lean() to get plain JavaScript objects

		if (!latestQuery) {
			return {
				ok: false,
				error: 'No queries found for this email',
			};
		}

		// Convert _id and Dates to ISO strings for client-side serialization
		if (latestQuery._id) latestQuery._id = latestQuery._id.toString();
		if (latestQuery.createdAt)
			latestQuery.createdAt = latestQuery.createdAt.toISOString();
		if (latestQuery.updatedAt)
			latestQuery.updatedAt = latestQuery.updatedAt.toISOString();
		if (latestQuery.lastDailyResetTime)
			latestQuery.lastDailyResetTime =
				latestQuery.lastDailyResetTime.toISOString();

		// Convert nested goal dates if necessary (though they should be ISO strings if saved as such)
		if (latestQuery.goals && Array.isArray(latestQuery.goals)) {
			latestQuery.goals = latestQuery.goals.map((goal) => {
				if (goal.createdAt && goal.createdAt instanceof Date) {
					return { ...goal, createdAt: goal.createdAt.toISOString() };
				}
				return goal;
			});
		}

		// Final safeguard for the single query object
		// This ensures deep cloning and proper serialization for all fields, including nested objects/arrays
		const safeLatestQuery = JSON.parse(JSON.stringify(latestQuery));

		return {
			ok: true,
			queries: [safeLatestQuery], // Return as an array for consistency with original client-side expectation
		};
	} catch (error) {
		console.error('Error loading query by email:', error);
		return {
			ok: false,
			error: error.message || 'Failed to load query by email',
		};
	}
}

// Keeping loadQueryById just in case, though it's not used in the client code provided
export async function loadQueryById(id) {
	try {
		await db(); // Connect to the database

		const query = await Query.findById(id).lean();

		if (!query) {
			return {
				ok: false,
				error: 'Query not found',
			};
		}

		// Manually convert _id and Dates for client-side serialization
		if (query._id) query._id = query._id.toString();
		if (query.createdAt) query.createdAt = query.createdAt.toISOString();
		if (query.updatedAt) query.updatedAt = query.updatedAt.toISOString();
		if (query.lastDailyResetTime)
			query.lastDailyResetTime = query.lastDailyResetTime.toISOString();

		const safeQuery = JSON.parse(JSON.stringify(query));

		return {
			ok: true,
			query: safeQuery, // Return as a single object
		};
	} catch (error) {
		console.error('Error loading query by ID:', error);
		return {
			ok: false,
			error: error.message || 'Failed to load query by ID',
		};
	}
}
