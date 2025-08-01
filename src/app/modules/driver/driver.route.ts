import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { DriverControllers } from "./driver.controller";
import { createDriverSchema, updateDriverSchema } from "./driver.validation";

const router = Router();

// POST /drivers/create - Create driver profile
router.post(
	"/create",
	checkAuth(UserRole.DRIVER),
	validateRequest(createDriverSchema),
	DriverControllers.createDriver
);

// PATCH /drivers/approve/:id - Approve driver (admin only)
router.patch(
	"/approve/:id",
	checkAuth(UserRole.ADMIN),
	DriverControllers.approveDriver
);

// PATCH /drivers/suspend/:id - Suspend driver (admin only)
router.patch(
	"/suspend/:id",
	checkAuth(UserRole.ADMIN),
	DriverControllers.suspendDriver
);

// PATCH /drivers/:id/status - Set driver online/offline status (driver only)
router.patch(
	"/:id/status",
	checkAuth(UserRole.DRIVER),
	validateRequest(updateDriverSchema),
	DriverControllers.updateDriverStatus
);

// GET /drivers - Get all drivers (admin only)
router.get("/", checkAuth(UserRole.ADMIN), DriverControllers.getDrivers);

// GET /drivers/:id - Get driver by ID
router.get(
	"/:id",
	checkAuth(UserRole.DRIVER, UserRole.ADMIN),
	DriverControllers.getDriverById
);

export const DriverRoutes = router;
