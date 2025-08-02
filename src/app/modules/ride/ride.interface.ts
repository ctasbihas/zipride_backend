import { Types } from "mongoose";

export enum RideStatus {
	PENDING = "pending",
	ACCEPTED = "accepted",
	PICKED_UP = "picked_up",
	IN_TRANSIT = "in_transit",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
	REJECTED = "rejected",
}

export interface IStatusHistory {
	status: RideStatus;
	timestamp: Date;
}

export interface IRide {
	_id?: Types.ObjectId;
	driver?: Types.ObjectId;
	rider: Types.ObjectId;
	passengers: number;
	from: string;
	to: string;
	fare: number;
	rideStatus: RideStatus;
	statusHistory: IStatusHistory[];
}
