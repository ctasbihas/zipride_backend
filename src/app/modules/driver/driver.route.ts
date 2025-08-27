import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { DriverControllers } from "./driver.controller";
import { createDriverSchema, updateDriverSchema } from "./driver.validation";

const router = Router();

router.post(
	"/create",
	checkAuth(UserRole.DRIVER),
	validateRequest(createDriverSchema),
	DriverControllers.createDriver
);
router.get("/", checkAuth(UserRole.ADMIN), DriverControllers.getDrivers);
router.patch(
	"/:id",
	checkAuth(UserRole.DRIVER),
	validateRequest(updateDriverSchema),
	DriverControllers.updateDriver
);
router.patch(
	"/approve/:id",
	checkAuth(UserRole.ADMIN),
	DriverControllers.approveDriver
);
router.patch(
	"/suspend/:id",
	checkAuth(UserRole.ADMIN),
	DriverControllers.suspendDriver
);
router.patch(
	"/reject/:id",
	checkAuth(UserRole.ADMIN),
	DriverControllers.rejectDriver
);
router.patch(
	"/:id/status",
	checkAuth(UserRole.DRIVER),
	validateRequest(updateDriverSchema),
	DriverControllers.updateDriverStatus
);
router.get(
	"/:id",
	checkAuth(UserRole.DRIVER, UserRole.ADMIN),
	DriverControllers.getDriverById
);
router.get(
	"/earnings/summary",
	checkAuth(UserRole.DRIVER),
	DriverControllers.getEarningsSummary
);

router.get(
	"/earnings/chart",
	checkAuth(UserRole.DRIVER),
	DriverControllers.getEarningsChart
);

export const DriverRoutes = router;
