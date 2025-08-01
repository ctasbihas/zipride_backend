import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { UserRole } from "./user.interface";
import { createUserSchema, updateUserSchema } from "./user.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(createUserSchema),
	UserControllers.createUser
);
router.get("/", checkAuth(UserRole.ADMIN), UserControllers.getAllUsers);
router.get("/:id", checkAuth(UserRole.ADMIN), UserControllers.getUserById);
router.patch(
	"/block/:id",
	checkAuth(UserRole.ADMIN),
	UserControllers.blockUser
);
router.patch(
	"/:id",
	checkAuth(UserRole.ADMIN, UserRole.RIDER, UserRole.DRIVER),
	validateRequest(updateUserSchema),
	UserControllers.updateUser
);

export const UserRoutes = router;
