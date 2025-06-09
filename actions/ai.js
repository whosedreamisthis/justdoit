'use server';
import db from '@/utils/db';
import Query from '@/models/query';
export async function saveQuery(email, goals) {
	try {
		await db();

		const newQuery = new Query({
			email,
			goals,
		});
		console.log('new query', newQuery);
		await newQuery.save();
		return {
			ok: true,
		};
	} catch (error) {
		console.log(error);
		return {
			error: error,
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
	try {
		await db(); // Connect to the database

		// Find all queries where the email matches
		const queries = await Query.find({ email }).lean(); // .lean() returns plain JavaScript objects, which is often more efficient for read operations

		console.log(`Loaded queries for ${email}:`, queries);

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
