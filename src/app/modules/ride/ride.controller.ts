import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RideServices } from "./ride.service";

const createRide = catchAsync(async (req: Request, res: Response) => {
	const rideData = req.body;
	const tokenData = req.user;
	const newRide = await RideServices.createRide(rideData, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Ride created successfully",
		data: newRide,
	});
});
const getDriverRides = catchAsync(async (req: Request, res: Response) => {
	const driverId = req.params.driverId;
	const tokenData = req.user;
	const rides = await RideServices.getDriverRides(driverId, tokenData);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver rides retrieved successfully",
		data: rides,
	});
});
const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
	const rideId = req.params.id;
	const rideData = req.body;
	const tokenData = req.user;
	const updatedRide = await RideServices.updateRideStatus(
		rideId,
		rideData,
		tokenData
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ride status updated successfully",
		data: updatedRide,
	});
});

// GET /rides/me - Get current user's rides (rider or driver)
const getCurrentUserRides = catchAsync(async (req: Request, res: Response) => {
	const tokenData = req.user;
	const rides = await RideServices.getCurrentUserRides(tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User rides retrieved successfully",
		data: rides,
	});
});

// PATCH /rides/:id/cancel - Cancel ride (rider only)
const cancelRide = catchAsync(async (req: Request, res: Response) => {
	const rideId = req.params.id;
	const tokenData = req.user;
	const cancelledRide = await RideServices.cancelRide(rideId, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ride cancelled successfully",
		data: cancelledRide,
	});
});

// GET /rides - Get all rides (admin only)
const getAllRides = catchAsync(async (req: Request, res: Response) => {
	const rides = await RideServices.getAllRides();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All rides retrieved successfully",
		data: rides,
	});
});

const getRiderRides = catchAsync(async (req: Request, res: Response) => {
	const riderId = req.params.riderId;
	const tokenData = req.user;
	const rides = await RideServices.getRiderRides(riderId, tokenData);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Rider rides retrieved successfully",
		data: rides,
	});
});

export const RideControllers = {
	createRide,
	getDriverRides,
	updateRideStatus,
	getRiderRides,
	getCurrentUserRides,
	cancelRide,
	getAllRides,
};
