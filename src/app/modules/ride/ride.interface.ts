import { Types } from "mongoose";
import { IDriver } from "../driver/driver.interface";
import { UserRole } from "../user/user.interface";

export enum RideStatus {
	PENDING = "pending",
	ACCEPTED = "accepted",
	PICKED_UP = "picked_up",
	IN_TRANSIT = "in_transit",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
	REJECTED = "rejected",
}

export interface IRide {
	_id?: Types.ObjectId;
	driver: Types.ObjectId;
	rider: Types.ObjectId;
	passengers: number;
	from: string;
	to: string;
	fare: number;
	rideStatus: RideStatus;
}

export interface PopulatedDriver extends Omit<IDriver, "driverProfile"> {
	driverProfile: {
		id: string;
		role: UserRole;
	};
}
