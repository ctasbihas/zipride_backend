import mongoose from "mongoose";
import { IRide, IStatusHistory, RideStatus } from "./ride.interface";

const statusHistorySchema = new mongoose.Schema<IStatusHistory>(
	{
		status: {
			type: String,
			enum: Object.values(RideStatus),
			required: true,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: false, versionKey: false }
);

const rideSchema = new mongoose.Schema<IRide>(
	{
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		rider: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		passengers: { type: Number, required: true },
		from: { type: String, required: true },
		to: { type: String, required: true },
		fare: { type: Number, required: true },
		rideStatus: {
			type: String,
			enum: Object.values(RideStatus),
			default: RideStatus.PENDING,
		},
		statusHistory: {
			type: [statusHistorySchema],
			default: [],
		},
	},
	{ timestamps: true, versionKey: false }
);

export const RideModel = mongoose.model<IRide>("Ride", rideSchema);
