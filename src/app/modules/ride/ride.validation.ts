import z from "zod";
import { RideStatus } from "./ride.interface";

export const createRideSchema = z.object({
	driver: z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId"),
	rider: z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId"),
	passengers: z.number().min(1).optional(),
	from: z.string().min(2).max(100).nonempty(),
	to: z.string().min(2).max(100).nonempty(),
	fare: z.number().min(0).optional(),
	rideStatus: z.enum(Object.values(RideStatus)).default(RideStatus.PENDING),
});
export const updateRideStatusSchema = z.object({
	rideStatus: z.enum(Object.values(RideStatus)),
});
