import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { RideControllers } from "./ride.controller";
import { createRideSchema, updateRideStatusSchema } from "./ride.validation";

const router = Router();

// POST /rides/request - Rider requests a ride
router.post(
	"/request",
	checkAuth(UserRole.RIDER),
	validateRequest(createRideSchema),
	RideControllers.createRide
);

// GET /rides/me - Get current user's rides (rider or driver)
router.get(
	"/me",
	checkAuth(UserRole.RIDER, UserRole.DRIVER),
	RideControllers.getCurrentUserRides
);

// PATCH /rides/:id/status - Update ride status (driver only)
router.patch(
	"/:id/status",
	checkAuth(UserRole.DRIVER),
	validateRequest(updateRideStatusSchema),
	RideControllers.updateRideStatus
);

// PATCH /rides/:id/cancel - Cancel ride (rider only)
router.patch(
	"/:id/cancel",
	checkAuth(UserRole.RIDER),
	RideControllers.cancelRide
);

// GET /rides - Get all rides (admin only)
router.get("/", checkAuth(UserRole.ADMIN), RideControllers.getAllRides);

export const RideRoutes = router;
