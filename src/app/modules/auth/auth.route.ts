import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";
import { changePasswordSchema, loginSchema } from "./auth.validation";

const router = Router();

router.post("/login", validateRequest(loginSchema), AuthControllers.login);
router.post("/logout", AuthControllers.logout);
// THis can be used for forgot password, reset password etc....
router.patch(
	"/change-password",
	validateRequest(changePasswordSchema),
	checkAuth(UserRole.ADMIN, UserRole.RIDER, UserRole.DRIVER),
	AuthControllers.changePassword
);

export const AuthRoutes = router;
