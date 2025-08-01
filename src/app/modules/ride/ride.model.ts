import mongoose from "mongoose";
import { IRide, RideStatus } from "./ride.interface";

const rideSchema = new mongoose.Schema<IRide>(
	{
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		rider: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
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
	},
	{ timestamps: true, versionKey: false }
);

export const RideModel = mongoose.model<IRide>("Ride", rideSchema);
