import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
	const result = await UserServices.createUser(req.body);

	res.cookie("token", result.token, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "User created successfully",
		data: result.user,
		meta: {
			accessToken: result.token,
		},
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await UserServices.getAllUsers();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});
const currentUser = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const result = await UserServices.currentUser(user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Current user retrieved successfully",
		data: result,
	});
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
	const requestedUserId = req.params.id;
	const currentUser = req.user;
	const user = await UserServices.getUserById(requestedUserId, currentUser);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User retrieved successfully",
		data: user,
	});
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
	const targetedUserId = req.params.id;
	const currentUser = req.user;
	const updateDocument = req.body;

	const user = await UserServices.updateUser(
		targetedUserId,
		currentUser,
		updateDocument
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User updated successfully",
		data: user,
	});
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
	const userId = req.params.id;
	const currentUser = req.user;

	const user = await UserServices.blockUser(userId, currentUser);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User blocked successfully",
		data: user,
	});
});

export const UserControllers = {
	createUser,
	getAllUsers,
	currentUser,
	getUserById,
	updateUser,
	blockUser,
};
