import { Types } from "mongoose";
import { IUser } from "../user/user.interface";

export enum DriverActiveStatus {
	ONLINE = "online",
	OFFLINE = "offline",
}
export enum DriverStatus {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
	SUSPENDED = "suspended",
}

export interface IDriver {
	_id?: Types.ObjectId;
	driverProfile: Types.ObjectId;
	activeStatus: DriverActiveStatus;
	approvalStatus: DriverStatus;
	vehicleLicense: string;
	vehicleCapacity: number;
	vehicleImages?: string[];
}

export interface PopulatedDriver extends Omit<IDriver, "driverProfile"> {
	driverProfile: IUser;
}
