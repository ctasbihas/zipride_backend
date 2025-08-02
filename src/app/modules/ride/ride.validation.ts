import z from "zod";
import { RideStatus } from "./ride.interface";

export const createRideSchema = z.object({
	passengers: z.number().min(1).max(8).default(1),
	from: z.string().min(2).max(100).nonempty(),
	to: z.string().min(2).max(100).nonempty(),
	fare: z.number().min(0).default(0),
});
export const updateRideStatusSchema = z.object({
	rideStatus: z.enum(Object.values(RideStatus)),
});
