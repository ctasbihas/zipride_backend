import { Types } from "mongoose";

export enum UserRole {
	ADMIN = "admin",
	RIDER = "rider",
	DRIVER = "driver",
}

export interface IUser {
	_id?: Types.ObjectId;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	isBlocked: boolean;
}
