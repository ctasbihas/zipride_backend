import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthControllers } from "./auth.controller";
import { changePasswordSchema, loginSchema } from "./auth.validation";

const router = Router();

router.post("/login", validateRequest(loginSchema), AuthControllers.login);
router.post("/logout", AuthControllers.logout);
// THis can be used for forgot password, reset password etc....
router.patch(
	"/change-password/:userId",
	validateRequest(changePasswordSchema),
	AuthControllers.changePassword
);

export const AuthRoutes = router;
