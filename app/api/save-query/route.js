// app/api/save-query/route.js
import db from '@/utils/db'; // Ensure this path is correct
import Query from '@/models/query'; // Ensure this path is correct
import { NextResponse } from 'next/server';

export async function POST(request) {
	try {
		await db(); // Connect to the database on the server

		const { email, goals } = await request.json();

		const newQuery = new Query({
			email,
			goals,
		});
		await newQuery.save();

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error('Failed to save query to DB:', error);
		return NextResponse.json(
			{ error: 'Failed to save query' },
			{ status: 500 }
		);
	}
}
