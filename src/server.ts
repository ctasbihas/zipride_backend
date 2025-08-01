import dotenv from "dotenv";
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { env } from "./app/config/env";

dotenv.config();

let server: Server;
const PORT = env.PORT;

const startServer = async () => {
	try {
		await mongoose.connect(env.MONGO_URI);
		console.log("⚡ ZipRide connected to MongoDB at lightning speed!");

		server = app.listen(PORT, () => {
			console.log(
				`🚀 ZipRide server running on http://localhost:${PORT}`
			);
			console.log("⚡ Ready to zip riders to their destinations!");
		});
	} catch (error) {
		console.error("❌ ZipRide server startup error:", error);
	}
};
startServer();

// ZipRide Graceful shutdown
process.on("SIGTERM", () => {
	console.log("⚡ ZipRide SIGTERM received - shutting down gracefully");
	if (server) {
		server.close(() => {
			console.log("🛑 ZipRide server closed");
			mongoose.connection.close();
		});
	}
});

process.on("SIGINT", () => {
	console.log("⚡ ZipRide SIGINT received - shutting down gracefully");
	if (server) {
		server.close(() => {
			console.log("🛑 ZipRide server closed");
			mongoose.connection.close();
		});
	}
});
