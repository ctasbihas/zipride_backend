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
	const driverData = req.body;
	const tokenData = req.user;
	const updatedDriver = await DriverServices.updateDriver(
		id,
		driverData,
		tokenData
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver updated successfully",
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

// PATCH /drivers/approve/:id - Approve driver (admin only)
const approveDriver = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const tokenData = req.user!;
	const approvedDriver = await DriverServices.approveDriver(id, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver approved successfully",
		data: approvedDriver,
	});
});

// PATCH /drivers/suspend/:id - Suspend driver (admin only)
const suspendDriver = catchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const tokenData = req.user!;
	const suspendedDriver = await DriverServices.suspendDriver(id, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver suspended successfully",
		data: suspendedDriver,
	});
});

// PATCH /drivers/:id/status - Set driver online/offline status (driver only)
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

export const DriverControllers = {
	createDriver,
	getDrivers,
	updateDriver,
	getDriverById,
	approveDriver,
	suspendDriver,
	updateDriverStatus,
};
