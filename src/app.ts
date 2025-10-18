import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { env } from "./app/config/env";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { indexRoutes } from "./app/routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
	env.DEVELOPMENT_FRONTEND_URL,
	env.PRODUCTION_FRONTEND_URL,
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) return callback(null, true);
			return callback(new Error("Origin not allowed by CORS"));
		},
		credentials: true,
	})
);

app.get("/", (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "⚡ ZipRide API - Lightning Fast Ride Booking",
		timestamp: new Date().toISOString(),
		version: "1.0.0",
		slogan: "Zip to your destination at lightning speed! 🚗💨",
	});
});

app.use("/api/v1", indexRoutes);

app.use(globalErrorHandler);

export default app;
