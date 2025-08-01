import { NextFunction, Request, Response } from "express";
import { UserRole } from "../modules/user/user.interface";
import AppError from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export const checkAuth = (...roles: Partial<UserRole>[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.headers.authorization;
			if (!token) {
				throw new AppError("Authorization token is required", 401);
			}

			const tokenData = verifyToken(token);
			if (!roles.includes(tokenData.role)) {
				throw new AppError("Unauthorized access", 403);
			}

			req.user = tokenData;
			next();
		} catch (err) {
			next(err);
		}
	};
};
