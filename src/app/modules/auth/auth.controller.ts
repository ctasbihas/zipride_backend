import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthServices.login(req.body);

	res.cookie("token", result.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "none",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: result.token,
	});
});

const logout = catchAsync(async (req: Request, res: Response) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged out successfully",
		data: null,
	});
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
	const { currentPassword, newPassword } = req.body;
	const userId = req.params.userId;

	await AuthServices.changePassword(userId, currentPassword, newPassword);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Password changed successfully",
		data: null,
	});
});

export const AuthControllers = {
	login,
	logout,
	changePassword,
};
