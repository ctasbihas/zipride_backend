import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { RideControllers } from "./ride.controller";
import { createRideSchema, updateRideStatusSchema } from "./ride.validation";

const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), RideControllers.getAllRides);

router.get(
	"/available",
	checkAuth(UserRole.DRIVER),
	RideControllers.getAvailableRides
);

router.get(
	"/me",
	checkAuth(UserRole.DRIVER, UserRole.RIDER),
	RideControllers.getCurrentUserRides
);

router.get(
	"/driver/:driverId",
	checkAuth(UserRole.DRIVER, UserRole.ADMIN),
	RideControllers.getDriverRides
);

router.get(
	"/rider/:riderId",
	checkAuth(UserRole.RIDER, UserRole.ADMIN),
	RideControllers.getRiderRides
);

router.post(
	"/request",
	checkAuth(UserRole.RIDER),
	validateRequest(createRideSchema),
	RideControllers.createRide
);

router.patch(
	"/:id/accept",
	checkAuth(UserRole.DRIVER),
	RideControllers.acceptRide
);

router.patch(
	"/:id/cancel",
	checkAuth(UserRole.RIDER),
	RideControllers.cancelRide
);

router.patch(
	"/:id/status",
	checkAuth(UserRole.DRIVER, UserRole.RIDER),
	validateRequest(updateRideStatusSchema),
	RideControllers.updateRideStatus
);

export const RideRoutes = router;
