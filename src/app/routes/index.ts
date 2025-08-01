import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DriverRoutes } from "../modules/driver/driver.route";
import { RideRoutes } from "../modules/ride/ride.route";
import { UserRoutes } from "../modules/user/user.route";

const router = Router();

router.use("/user", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/drivers", DriverRoutes);
router.use("/rides", RideRoutes);

export const indexRoutes = router;
