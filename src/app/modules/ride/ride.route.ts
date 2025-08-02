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
router.patch(
	"/:id/status",
	checkAuth(UserRole.DRIVER, UserRole.RIDER),
	validateRequest(updateRideStatusSchema),
	RideControllers.updateRideStatus
);
router.patch(
	"/:id/accept",
	checkAuth(UserRole.DRIVER),
	RideControllers.acceptRide
);

router.get(
	"/me",
	checkAuth(UserRole.DRIVER, UserRole.RIDER),
	RideControllers.getCurrentUserRides
);

router.post(
	"/request",
	checkAuth(UserRole.RIDER),
	validateRequest(createRideSchema),
	RideControllers.createRide
);

export const RideRoutes = router;
