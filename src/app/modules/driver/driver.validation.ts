import { z } from "zod";
import { DriverActiveStatus, DriverStatus } from "./driver.interface";

export const createDriverSchema = z.object({
	vehicleLicense: z
		.string()
		.min(1, "Vehicle license is required")
		.regex(
			/^[A-Za-z]+-[A-Za-z]{1,2}-\d{2}-\d{4}$/,
			"License number must follow Bangladesh format: CITY-CLASS-SERIES-NUMBER (e.g., DHAKA-D-11-9999)"
		),
	vehicleCapacity: z.number().min(1, "Vehicle capacity must be at least 1"),
	vehicleImages: z.array(z.string()).optional(),
});

export const updateDriverSchema = z.object({
	activeStatus: z.enum(Object.values(DriverActiveStatus)).optional(),
	approvalStatus: z.enum(Object.values(DriverStatus)).optional(),
	vehicleLicense: z
		.string()
		.regex(
			/^[A-Za-z]+-[A-Za-z]+-\d+-\d+$/,
			"License number must follow Bangladesh format: CITY-CLASS-SERIES-NUMBER (e.g., DHAKA-D-11-9999)"
		)
		.optional(),
	vehicleCapacity: z
		.number()
		.min(1, "Vehicle capacity must be at least 1")
		.optional(),
	vehicleImages: z.array(z.string()).optional(),
});
