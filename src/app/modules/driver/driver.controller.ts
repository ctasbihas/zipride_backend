import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DriverServices } from "./driver.service";

const createDriver = catchAsync(async (req: Request, res: Response) => {
	const driverData = req.body;
	const tokenData = req.user;
	const newDriver = await DriverServices.createDriver(driverData, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Driver created successfully",
		data: newDriver,
	});
});
const getDrivers = catchAsync(async (req: Request, res: Response) => {
	const drivers = await DriverServices.getDrivers();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Drivers retrieved successfully",
		data: drivers,
	});
});
const updateDriver = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const updatedData = req.body;
	const currentUser = req.user;
	const updatedDriver = await DriverServices.updateDriver(
		id,
		updatedData,
		currentUser
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver updated successfully",
		data: updatedDriver,
	});
});
const approveDriver = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const approvedDriver = await DriverServices.approveDriver(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver approved successfully",
		data: approvedDriver,
	});
});
const suspendDriver = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const suspendedDriver = await DriverServices.suspendDriver(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver suspended successfully",
		data: suspendedDriver,
	});
});
const rejectDriver = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const rejectedDriver = await DriverServices.rejectDriver(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver rejected successfully",
		data: rejectedDriver,
	});
});
const updateDriverStatus = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const statusData = req.body;
	const tokenData = req.user;
	const updatedDriver = await DriverServices.updateDriverStatus(
		id,
		statusData,
		tokenData
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver status updated successfully",
		data: updatedDriver,
	});
});
const getDriverById = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const tokenData = req.user;
	const result = await DriverServices.getDriverById(id, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

export const DriverControllers = {
	createDriver,
	updateDriver,
	getDriverById,
	approveDriver,
	suspendDriver,
	rejectDriver,
	updateDriverStatus,
	getDrivers,
};
