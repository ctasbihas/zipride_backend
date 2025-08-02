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
		message:
			"⚡ ZipRide request created successfully! Looking for available drivers...",
		data: newRide,
	});
});

const getAvailableRides = catchAsync(async (req: Request, res: Response) => {
	const tokenData = req.user;
	const result = await RideServices.getAvailableRides(tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Available ZipRide requests retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getDriverRides = catchAsync(async (req: Request, res: Response) => {
	const driverId = req.params.driverId;
	const tokenData = req.user;
	const result = await RideServices.getDriverRides(driverId, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Driver rides retrieved successfully",
		data: result.data,
		meta: result.meta,
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
	const result = await RideServices.getCurrentUserRides(tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User rides retrieved successfully",
		data: result.data,
		meta: result.meta,
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
// PATCH /rides/:id/accept - Driver accepts a ride
const acceptRide = catchAsync(async (req: Request, res: Response) => {
	const rideId = req.params.id;
	const tokenData = req.user;
	const acceptedRide = await RideServices.acceptRide(rideId, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "⚡ ZipRide accepted successfully! Time to zip to the rider!",
		data: acceptedRide,
	});
});

// GET /rides - Get all rides (admin only)
const getAllRides = catchAsync(async (req: Request, res: Response) => {
	const result = await RideServices.getAllRides();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All rides retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getRiderRides = catchAsync(async (req: Request, res: Response) => {
	const riderId = req.params.riderId;
	const tokenData = req.user;
	const result = await RideServices.getRiderRides(riderId, tokenData);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Rider rides retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

export const RideControllers = {
	createRide,
	getAvailableRides,
	acceptRide,
	getDriverRides,
	updateRideStatus,
	getRiderRides,
	getCurrentUserRides,
	cancelRide,
	getAllRides,
};
