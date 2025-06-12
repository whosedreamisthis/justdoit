// db.js
import mongoose from 'mongoose';

export default async function db() {
	if (mongoose.connection.readyState >= 1) {
		console.log(
			'MongoDB already connected, returning existing connection.'
		);
		return;
	}

	const mongoUri = process.env.DATABASE;

	// --- ADD THIS LOG AND CHECK ---

	if (!mongoUri) {
		console.error(
			'CRITICAL ERROR: MongoDB URI (process.env.DATABASE) is UNDEFINED at connection attempt!'
		);
		throw new Error(
			'MongoDB URI is not set. Please check your .env.local file and ensure a full server restart.'
		);
	}
	// --- END ADDED LOG AND CHECK ---

	try {
		await mongoose.connect(mongoUri);
		console.log('MongoDB connected successfully!');
	} catch (error) {
		console.error('MongoDB connection failed:', error.message);
		// It's good to re-throw the error so higher-level code knows about the failure
		throw error;
	}
}
