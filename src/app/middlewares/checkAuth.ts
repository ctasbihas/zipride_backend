import { NextFunction, Request, Response } from "express";
import { UserRole } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";
import AppError from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export const checkAuth = (...roles: Partial<UserRole>[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.headers.authorization;
			if (!token) {
				throw new AppError("Authorization token is required", 401);
			}

			const tokenData = verifyToken(token);
			if (!roles.includes(tokenData.role)) {
				throw new AppError("Unauthorized access", 403);
			}
			const user = await UserModel.findById(tokenData.userId).select(
				"isBlocked"
			);
			if (!user) {
				throw new AppError("User not found", 404);
			}
			if (user.isBlocked) {
				throw new AppError("Your account is blocked", 403);
			}

			req.user = tokenData;
			next();
		} catch (err) {
			next(err);
		}
	};
};
