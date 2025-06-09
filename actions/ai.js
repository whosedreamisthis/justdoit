'use server';
import db from '@/utils/db';
import Query from '@/models/query';

export async function saveQuery(email, goals) {
	try {
		await db();

		const result = await Query.findOneAndUpdate(
			{ email: email },
			{ goals: goals },
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			}
		).lean(); // <--- Add .lean() here too for save/update operations!

		console.log('Query saved/updated for email:', email, result);

		// Manually convert _id and Dates for client-side serialization if .lean() isn't enough
		// This is crucial for MongoDB ObjectId and Date objects
		if (result) {
			result._id = result._id.toString();
			if (result.createdAt)
				result.createdAt = result.createdAt.toISOString();
			if (result.updatedAt)
				result.updatedAt = result.updatedAt.toISOString();
		}

		// Ensure the object is a plain JavaScript object before returning to client
		const serializableResult = JSON.parse(JSON.stringify(result));

		return {
			ok: true,
			data: serializableResult,
		};
	} catch (error) {
		console.error('Error saving/updating query:', error);
		return {
			error:
				error.message ||
				'An unexpected error occurred during save/update',
			ok: false,
		};
	}
}

/**
 * Loads all queries associated with a given email address.
 *
 * @param {string} email The email address to search for.
 * @returns {Promise<{ ok: boolean, queries?: Array<Object>, error?: any }>} An object indicating success or failure,
 * and either an array of queries or an error object.
 */
export async function loadQueriesByEmail(email) {
	console.log(`4444444444444444441 loadQueriesByEmail`);
	try {
		console.log(`1 loadQueriesByEmail`);
		await db(); // Connect to the database
		// 	console.log(`2 loadQueriesByEmail`);
		// 	// Find all queries where the email matches
		const queries = await Query.find({ email }).lean(); // .lean() returns plain JavaScript objects, which is often more efficient for read operations
		queries.forEach((query) => (query._id = query._id.toString()));
		queries.forEach((query) => {
			query.createdAt = query.createdAt.toISOString();
			query.updatedAt = query.updatedAt.toISOString();
		});

		console.log('Formatted Queries:', JSON.stringify(queries, null, 2));
		const safeQueries = JSON.parse(JSON.stringify(queries));
		console.log('Safe queries ready for client:', safeQueries);

		// 	console.log(`Loaded queries for ${email}:`, queries);
		// throw new Error(
		// 	`FORCED ERRI TO CHECK THIS BLICK ${JSON.stringify(
		// 		queries,
		// 		null,
		// 		2
		// 	)}`
		// );
		return {
			ok: true,
			queries,
		};
	} catch (error) {
		console.error('Error loading queries:', error);
		return {
			ok: false,
			error: error.message || 'Failed to load queries',
		};
	}
}

/**
 * Loads a single query by its unique ID.
 * This is useful if you have a specific query ID you want to retrieve.
 *
 * @param {string} queryId The unique ID of the query to load.
 * @returns {Promise<{ ok: boolean, query?: Object, error?: any }>} An object indicating success or failure,
 * and either the query object or an error object.
 */
export async function loadQueryById(queryId) {
	try {
		await db(); // Connect to the database

		// Find a single query by its ID
		const query = await Query.findById(queryId).lean();

		if (!query) {
			return {
				ok: false,
				error: 'Query not found',
			};
		}

		console.log(`Loaded query by ID ${queryId}:`, query);

		return {
			ok: true,
			query,
		};
	} catch (error) {
		console.error('Error loading query by ID:', error);
		return {
			ok: false,
			error: error.message || 'Failed to load query by ID',
		};
	}
}

/**
 * Loads the most recent query for a given email address.
 *
 * @param {string} email The email address to search for.
 * @returns {Promise<{ ok: boolean, query?: Object, error?: any }>} An object indicating success or failure,
 * and either the most recent query or an error object.
 */
export async function loadLatestQueryByEmail(email) {
	try {
		await db(); // Connect to the database

		// Find one query, sort by createdAt in descending order (latest first)
		const latestQuery = await Query.findOne({ email })
			.sort({ createdAt: -1 }) // Assuming you have a `createdAt` timestamp in your schema
			.lean();

		if (!latestQuery) {
			return {
				ok: false,
				error: 'No queries found for this email',
			};
		}

		console.log(`Loaded latest query for ${email}:`, latestQuery);

		return {
			ok: true,
			query: latestQuery,
		};
	} catch (error) {
		console.error('Error loading latest query:', error);
		return {
			ok: false,
			error: error.message || 'Failed to load latest query',
		};
	}
}
