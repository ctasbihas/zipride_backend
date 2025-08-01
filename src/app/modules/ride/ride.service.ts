import { JwtPayload } from "jsonwebtoken";
import AppError from "../../utils/AppError";
import { DriverActiveStatus, DriverStatus } from "../driver/driver.interface";
import { DriverModel } from "../driver/driver.model";
import { UserRole } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import { IRide, RideStatus } from "./ride.interface";
import { RideModel } from "./ride.model";

const createRide = async (rideData: IRide, tokenData: JwtPayload) => {
	// Validate token user role early
	if (tokenData.role !== UserRole.RIDER) {
		throw new AppError("You are not a rider", 403);
	}

	// Find rider and select only the role field
	const rider = await UserModel.findById(rideData.rider).select(
		"role isBlocked"
	);
	if (!rider) {
		throw new AppError("Rider not found", 404);
	}

	// Find driver info and ensure the driver exists
	const driverInfo = await DriverModel.findOne({
		driverProfile: rideData.driver,
	});
	const driver = await UserModel.findById(rideData.driver);
	if (!driverInfo || !driver) {
		throw new AppError("Driver not found", 404);
	}

	// Ensure the token user is the same as the rider
	if (tokenData.userId !== rider.id) {
		throw new AppError("You can only create rides for yourself", 403);
	}

	// Validate rider role
	if (rider.role !== UserRole.RIDER) {
		throw new AppError("Targeted rider isn't a rider", 400);
	}
	// Validate driver role
	if (driver.role !== UserRole.DRIVER) {
		throw new AppError("Targeted driver isn't a driver", 400);
	}

	// Check if the rider already has an active ride
	const existingRide = await RideModel.findOne({
		rider: rider._id,
		rideStatus: {
			$in: [
				RideStatus.PENDING,
				RideStatus.ACCEPTED,
				RideStatus.PICKED_UP,
				RideStatus.IN_TRANSIT,
			],
		},
	});
	if (existingRide) {
		throw new AppError(`One Ride already ${existingRide.rideStatus}`, 400);
	}

	// Validate driver approval status
	if (driverInfo.approvalStatus === DriverStatus.PENDING) {
		throw new AppError("This driver is not approved yet", 400);
	}
	if (driverInfo.approvalStatus === DriverStatus.REJECTED) {
		throw new AppError("This driver is rejected", 400);
	}
	if (driverInfo.approvalStatus === DriverStatus.SUSPENDED) {
		throw new AppError("This driver is suspended", 400);
	}

	// Validate driver active status
	if (driverInfo.activeStatus !== DriverActiveStatus.ONLINE) {
		throw new AppError("This driver is not online", 400);
	}

	// Check if driver is blocked
	if (driver.isBlocked) {
		throw new AppError("This driver is blocked", 400);
	}

	// Check if rider is blocked
	if (rider.isBlocked) {
		throw new AppError("Your account is blocked", 403);
	}

	// Check if driver is already assigned to a ride
	const driverActiveRide = await RideModel.findOne({
		driver: driver.id,
		rideStatus: {
			$in: [
				RideStatus.ACCEPTED,
				RideStatus.PICKED_UP,
				RideStatus.IN_TRANSIT,
			],
		},
	});

	if (driverActiveRide) {
		throw new AppError("Driver is not available", 400);
	}

	// Check if number of passengers exceeds vehicle capacity
	if (rideData.passengers > driverInfo.vehicleCapacity) {
		throw new AppError(
			"Number of passengers exceeds vehicle capacity",
			400
		);
	}

	// Create and return the new ride
	const newRide = await RideModel.create({
		...rideData,
		rider: rider.id,
		driver: driver.id,
	});

	return newRide;
};
const getDriverRides = async (driverId: string, tokenData: JwtPayload) => {
	// Validate token user role
	if (
		tokenData.role !== UserRole.DRIVER &&
		tokenData.role !== UserRole.ADMIN
	) {
		throw new AppError("You are not authorized", 403);
	}

	// Ensure the token user is the same as the driver
	if (tokenData.userId !== driverId && tokenData.role !== UserRole.ADMIN) {
		throw new AppError("You can only view your own rides", 403);
	}

	// Find and return the driver's rides
	const rides = await RideModel.find({ driver: driverId });
	return rides;
};

const updateRideStatus = async (
	rideId: string,
	rideData: Partial<IRide>,
	tokenData: JwtPayload
) => {
	if (
		tokenData.role === UserRole.RIDER &&
		rideData.rideStatus !== RideStatus.CANCELLED
	) {
		throw new AppError("You are not authorized to update rides", 403);
	}

	// Validate ride status early to avoid unnecessary DB calls
	if (!rideData.rideStatus) {
		throw new AppError("Ride status is required", 400);
	}
	if (!Object.values(RideStatus).includes(rideData.rideStatus)) {
		throw new AppError("Invalid ride status", 400);
	}

	// Fetch only required fields for performance
	const ride = await RideModel.findById(rideId).select("driver rideStatus");
	if (!ride) {
		throw new AppError("Ride not found", 404);
	}

	// Ensure the token user is the same as the driver
	if (tokenData.userId !== String(ride.driver)) {
		throw new AppError("You can only update your own rides", 403);
	}

	// Enforce step-by-step status transitions
	const allowedTransitions: Record<RideStatus, RideStatus[]> = {
		[RideStatus.PENDING]: [
			RideStatus.ACCEPTED,
			RideStatus.REJECTED,
			RideStatus.CANCELLED,
		],
		[RideStatus.ACCEPTED]: [RideStatus.PICKED_UP],
		[RideStatus.PICKED_UP]: [RideStatus.IN_TRANSIT],
		[RideStatus.IN_TRANSIT]: [RideStatus.COMPLETED],
		[RideStatus.COMPLETED]: [],
		[RideStatus.REJECTED]: [],
		[RideStatus.CANCELLED]: [],
	};

	const currentStatus = ride.rideStatus as RideStatus;
	const nextStatus = rideData.rideStatus as RideStatus;

	if (!allowedTransitions[currentStatus].includes(nextStatus)) {
		throw new AppError(
			`Cannot change status from ${currentStatus} to ${nextStatus}`,
			400
		);
	}

	// Use findOneAndUpdate for atomicity and to avoid double DB round-trip
	const updatedRide = await RideModel.findOneAndUpdate(
		{ _id: rideId, driver: ride.driver, rideStatus: currentStatus },
		{ rideStatus: nextStatus },
		{ new: true }
	);

	if (!updatedRide) {
		throw new AppError("Ride not found or status already changed", 404);
	}

	return updatedRide;
};

const getRiderRides = async (riderId: string, tokenData: JwtPayload) => {
	// Validate token user role
	if (tokenData.role !== UserRole.RIDER) {
		throw new AppError("You are not authorized", 403);
	}

	// Ensure the token user is the same as the rider
	if (tokenData.userId !== riderId) {
		throw new AppError("You can only view your own rides", 403);
	}

	// Find and return the rider's rides
	const rides = await RideModel.find({ rider: riderId });
	return rides;
};

// GET /rides/me - Get current user's rides (rider or driver)
const getCurrentUserRides = async (tokenData: JwtPayload) => {
	if (tokenData.role === UserRole.RIDER) {
		return await RideModel.find({ rider: tokenData.userId });
	} else if (tokenData.role === UserRole.DRIVER) {
		return await RideModel.find({ driver: tokenData.userId });
	} else {
		throw new AppError("You are not authorized to view rides", 403);
	}
};

// PATCH /rides/:id/cancel - Cancel ride (rider only)
const cancelRide = async (rideId: string, tokenData: JwtPayload) => {
	// Only riders can cancel rides
	if (tokenData.role !== UserRole.RIDER) {
		throw new AppError("Only riders can cancel rides", 403);
	}

	const ride = await RideModel.findById(rideId);
	if (!ride) {
		throw new AppError("Ride not found", 404);
	}

	// Check if the rider owns this ride
	if (String(ride.rider) !== tokenData.userId) {
		throw new AppError("You can only cancel your own rides", 403);
	}

	// Check if ride can be cancelled
	if (ride.rideStatus !== RideStatus.PENDING) {
		throw new AppError("Ride can only be cancelled when pending", 400);
	}

	// Update ride status to cancelled
	const cancelledRide = await RideModel.findByIdAndUpdate(
		rideId,
		{ rideStatus: RideStatus.CANCELLED },
		{ new: true }
	);

	return cancelledRide;
};

// GET /rides - Get all rides (admin only)
const getAllRides = async () => {
	return await RideModel.find()
		.populate("rider", "name email")
		.populate("driver", "name email")
		.sort({ createdAt: -1 });
};

export const RideServices = {
	createRide,
	getDriverRides,
	getRiderRides,
	updateRideStatus,
	getCurrentUserRides,
	cancelRide,
	getAllRides,
};
