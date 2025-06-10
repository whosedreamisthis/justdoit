import mongoose, { Schema } from 'mongoose';

// 1. Define the sub-schema for individual goal objects
const goalSchema = new Schema(
	{
		id: { type: String, required: true }, // Using String for UUIDs (e.g., from uuidv4())
		title: { type: String, required: true },
		description: { type: String },
		color: { type: String },
		progress: { type: Number, default: 0 },
		isCompleted: { type: Boolean, default: false },
		completedDays: { type: Object, default: {} },
		createdAt: { type: Date, default: Date.now },
	},
	{ _id: false }
);

// 2. Define the main Query Schema
const QuerySchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			index: true,
			unique: true,
		},
		goals: [goalSchema],
		// ADD THIS NEW FIELD FOR ARCHIVED GOALS
		archivedGoals: {
			type: Object, // Use Object for a flexible dictionary/map
			default: {}, // Default to an empty object
		},
		lastDailyResetTime: { type: Date },
	},
	{ timestamps: true }
);

// 3. Robust model definition for Next.js hot-reloading environments
let Query;
if (mongoose.models.Query) {
	Query = mongoose.models.Query;
} else {
	Query = mongoose.model('Query', QuerySchema);
}

export default Query;
