import mongoose from "mongoose";

// Connects to MongoDB. Called once from server.ts when the app starts.
// Models live in /models, so this file only knows about the connection.
export async function connectDatabase(): Promise<mongoose.Connection> {
	const uri = process.env.DB_STRING;
	if (!uri) {
		throw new Error("DB_STRING is missing. Add it to your .env file.");
	}
	await mongoose.connect(uri);
	return mongoose.connection;
}
