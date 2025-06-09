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
); // _id: false means Mongoose won't automatically add an _id to each sub-document

// 2. Define the main Query Schema
const QuerySchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			index: true,
			unique: true, // Make sure this is here if you only want one document per email
		},
		// IMPORTANT CHANGE HERE: Define goals as an array of goalSchema
		goals: [goalSchema], // <--- THIS IS THE CRUCIAL LINE. IT MUST BE `[goalSchema]`
		lastDailyResetTime: { type: Date }, // Assuming this will be a Date object
	},
	{ timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// 3. Robust model definition for Next.js hot-reloading environments
let Query;
// Check if the model already exists in Mongoose's cache
if (mongoose.models.Query) {
	Query = mongoose.models.Query;
} else {
	// If not, define and register the new model
	Query = mongoose.model('Query', QuerySchema);
}

export default Query;
