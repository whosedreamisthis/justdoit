import db from '@/utils/db';
import Query from '@/models/query';
export async function saveQuery(email, goals) {
	try {
		await db();

		const newQuery = new Query({
			email,
			goals,
		});
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
