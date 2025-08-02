import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
	const result = await UserServices.createUser(req.body);

	res.status(httpStatus.CREATED).json({
		success: true,
		statusCode: httpStatus.CREATED,
		message: "User created successfully",
		data: result.user,
		meta: {
			accessToken: result.token,
		},
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await UserServices.getAllUsers();

	res.status(httpStatus.OK).json({
		success: true,
		statusCode: httpStatus.OK,
		message: "Users retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
	const requestedUserId = req.params.id;
	const currentUser = req.user;
	const user = await UserServices.getUserById(requestedUserId, currentUser);

	res.status(httpStatus.OK).json({
		success: true,
		statusCode: httpStatus.OK,
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

	res.status(httpStatus.OK).json({
		success: true,
		statusCode: httpStatus.OK,
		message: "User updated successfully",
		data: user,
	});
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
	const userId = req.params.id;
	const currentUser = req.user;

	const user = await UserServices.blockUser(userId, currentUser);

	res.status(httpStatus.OK).json({
		success: true,
		statusCode: httpStatus.OK,
		message: "User blocked successfully",
		data: user,
	});
});

export const UserControllers = {
	createUser,
	getAllUsers,
	getUserById,
	updateUser,
	blockUser,
};
