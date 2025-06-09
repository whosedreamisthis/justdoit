'use server';
import db from '@/utils/db';
import Query from '@/models/query';

export async function saveQuery(email, goals) {
	try {
		await db(); // Ensure database connection is established

		// Use findOneAndUpdate with upsert: true to update if exists, insert if not
		const result = await Query.findOneAndUpdate(
			{ email: email }, // Filter: Find a document where the 'email' field matches the provided email
			{ goals: goals }, // Update: Set the 'goals' field to the new goals array
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
		}

		// Ensure the object is a plain JavaScript object before returning to client
		// This is the final safeguard for any nested structures or types that might still be problematic
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
	try {
		await db(); // Connect to the database

		const queries = await Query.find({ email }).lean(); // .lean() returns plain JavaScript objects

		// IMPORTANT: Map over the queries to ensure each object is fully serializable
		const safeQueries = queries.map((query) => {
			// Convert _id to string
			if (query._id) query._id = query._id.toString();
			// Convert Date objects to ISO strings
			if (query.createdAt)
				query.createdAt = query.createdAt.toISOString();
			if (query.updatedAt)
				query.updatedAt = query.updatedAt.toISOString();
			// Final safeguard: deep clone and strip non-serializable properties
			return JSON.parse(JSON.stringify(query));
		});

		return {
			ok: true,
			queries: safeQueries, // Return the fully serialized array
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

		const query = await Query.findById(queryId).lean();

		if (!query) {
			return {
				ok: false,
				error: 'Query not found',
			};
		}

		// Convert _id and Dates
		if (query._id) query._id = query._id.toString();
		if (query.createdAt) query.createdAt = query.createdAt.toISOString();
		if (query.updatedAt) query.updatedAt = query.updatedAt.toISOString();

		// Final safeguard for the single query object
		const safeQuery = JSON.parse(JSON.stringify(query));

		return {
			ok: true,
			query: safeQuery, // Return the fully serialized object
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

		const latestQuery = await Query.findOne({ email })
			.sort({ createdAt: -1 })
			.lean();

		if (!latestQuery) {
			return {
				ok: false,
				error: 'No queries found for this email',
			};
		}

		// Convert _id and Dates
		if (latestQuery._id) latestQuery._id = latestQuery._id.toString();
		if (latestQuery.createdAt)
			latestQuery.createdAt = latestQuery.createdAt.toISOString();
		if (latestQuery.updatedAt)
			latestQuery.updatedAt = latestQuery.updatedAt.toISOString();

		// Final safeguard for the single query object
		const safeLatestQuery = JSON.parse(JSON.stringify(latestQuery));

		return {
			ok: true,
			query: safeLatestQuery, // Return the fully serialized object
		};
	} catch (error) {
		console.error('Error loading latest query:', error);
		return {
			ok: false,
			error: error.message || 'Failed to load latest query',
		};
	}
}
