import mongoose from "mongoose";
import { DriverActiveStatus, DriverStatus, IDriver } from "./driver.interface";

const driverSchema = new mongoose.Schema<IDriver>(
	{
		driverProfile: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			unique: true,
			ref: "User",
		},
		activeStatus: {
			type: String,
			enum: Object.values(DriverActiveStatus),
			default: DriverActiveStatus.OFFLINE,
		},
		approvalStatus: {
			type: String,
			enum: Object.values(DriverStatus),
			default: DriverStatus.PENDING,
		},
		vehicleLicense: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: function (v: string) {
					return /^[A-Za-z]+-[A-Za-z]+-\d+-\d+$/.test(v);
				},
				message:
					"License number must follow Bangladesh format: CITY-CLASS-SERIES-NUMBER (e.g., DHAKA-D-11-9999)",
			},
		},
		vehicleCapacity: { type: Number, required: true, min: 1 },
		vehicleImages: {
			type: [String],
		},
	},
	{ timestamps: true, versionKey: false }
);
export const DriverModel = mongoose.model<IDriver>("Driver", driverSchema);
