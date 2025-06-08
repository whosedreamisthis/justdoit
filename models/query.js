import mongoose, { Schema, model } from 'mongoose'; // Keep this import

const QuerySchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			index: true,
		},
		goals: {
			type: String,
		},
		lastDailyResetTime: {},
	},
	{ timestamps: true }
);

// The crucial change:
// Mongoose's `model()` function is designed to handle this.
// If a model with the given name already exists, it returns it.
// If not, it creates and registers a new one.
let Query;
try {
	Query = mongoose.model('Query'); // Attempt to retrieve existing model
} catch (e) {
	// If the model doesn't exist, mongoose.model() throws an error (e.g., MissingSchemaError)
	// Catch the error and define the model
	Query = mongoose.model('Query', QuerySchema);
}

// Or, a more concise way that often works if 'model' is directly imported:
// This assumes 'model' is mongoose.model from the import.
// const Query = mongoose.models.Query || mongoose.model('Query', QuerySchema);
// This is the original line that failed if mongoose.models was undefined.

// A more direct way to avoid the 'undefined' issue and still prevent re-compilation:
// The `model` function (which is `mongoose.model`) implicitly checks if the model exists.
// If it does, and you provide a schema, it might throw an error.
// The most common pattern for Next.js and similar environments is:
// if (mongoose.models.Query) { // Check if 'models' is an object first, then check property
//     Query = mongoose.models.Query;
// } else {
//     Query = mongoose.model('Query', QuerySchema);
// }

// Better still, and commonly used to avoid re-defining models in hot-reloading environments:
// The `mongoose.models` object is only guaranteed to be an object after at least one model
// has been defined. So, checking `mongoose.models.Query` directly before any models
// are loaded can be problematic.

// The *most robust* way that handles `mongoose.models` being undefined initially
// and also prevents recompilation:
if (
	mongoose.connection &&
	mongoose.connection.models &&
	mongoose.connection.models.Query
) {
	Query = mongoose.connection.models.Query;
} else {
	Query = mongoose.model('Query', QuerySchema);
}

export default Query;
