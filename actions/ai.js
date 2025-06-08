'use server';
import db from '@/utils/db';
import Query from '@/models/query';

export async function fetchGoals(email) {
	try {
		await db(); // Ensure the database connection is established

		const userQuery = await Query.findOne({ email });

		if (!userQuery) {
			console.log('[INFO] No goals found for this user.');
			return { goals: [], ok: true };
		}

		return { goals: JSON.parse(userQuery.goals), ok: true };
	} catch (error) {
		console.error('[ERROR] Failed to fetch goals:', error);
		return { error: error.message, ok: false };
	}
}

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
