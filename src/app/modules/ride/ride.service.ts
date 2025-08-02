import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../utils/AppError";
import { addStatusHistoryEntry } from "../../utils/rideHelpers";
import {
	DriverActiveStatus,
	DriverStatus,
	PopulatedDriver,
} from "../driver/driver.interface";
import { DriverModel } from "../driver/driver.model";
import { UserRole } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import { IRide, RideStatus } from "./ride.interface";
import { RideModel } from "./ride.model";

const createRide = async (
	rideData: Partial<IRide>,
	currentUser: JwtPayload
) => {
	const rider = await UserModel.findById(currentUser.userId).select(
		"role isBlocked"
	);
	if (!rider) {
		throw new AppError("Rider not found", httpStatus.NOT_FOUND);
	}

	if (rider.role !== UserRole.RIDER) {
		throw new AppError(
			"Something went wrong. Please re-login",
			httpStatus.INTERNAL_SERVER_ERROR
		);
	}

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
		throw new AppError(
			`You already have ${
				existingRide.rideStatus === RideStatus.PENDING
					? "requested for a ride"
					: "an on-going ride"
			}`,
			httpStatus.FORBIDDEN
		);
	}

	if (rider.isBlocked) {
		throw new AppError("Your account is blocked", httpStatus.FORBIDDEN);
	}

	const newRide = await RideModel.create({
		...rideData,
		rider: rider.id,
		statusHistory: [
			{
				status: rideData.rideStatus || RideStatus.PENDING,
				timestamp: new Date(),
			},
		],
	});

	return newRide;
};
const getAllRides = async () => {
	const rides = await RideModel.find()
		.populate("rider", "name email")
		.populate("driver", "name email")
		.sort({ createdAt: -1 });

	return {
		data: rides,
		meta: {
			total: rides.length,
		},
	};
};
const getCurrentUserRides = async (tokenData: JwtPayload) => {
	const filter: any = {};

	if (tokenData.role === UserRole.RIDER) {
		filter.rider = tokenData.userId;
	} else if (tokenData.role === UserRole.DRIVER) {
		filter.driver = tokenData.userId;
	} else {
		throw new AppError("You are not authorized to view rides", 403);
	}

	const rides = await RideModel.find(filter)
		.populate("rider", "name email")
		.populate("driver", "name email")
		.sort({ createdAt: -1 });

	return {
		data: rides,
		meta: {
			total: rides.length,
		},
	};
};
const getDriverRides = async (driverId: string, tokenData: JwtPayload) => {
	if (
		tokenData.role !== UserRole.DRIVER &&
		tokenData.role !== UserRole.ADMIN
	) {
		throw new AppError("You are not authorized", 403);
	}

	if (tokenData.userId !== driverId && tokenData.role !== UserRole.ADMIN) {
		throw new AppError("You can only view your own rides", 403);
	}

	const rides = await RideModel.find({ driver: driverId })
		.populate("rider", "name email")
		.populate("driver", "name email")
		.sort({ createdAt: -1 });

	return {
		data: rides,
		meta: {
			total: rides.length,
		},
	};
};
const getRiderRides = async (riderId: string, tokenData: JwtPayload) => {
	if (tokenData.role !== UserRole.RIDER) {
		throw new AppError("You are not authorized", 403);
	}

	if (tokenData.userId !== riderId) {
		throw new AppError("You can only view your own rides", 403);
	}

	const rides = await RideModel.find({ rider: riderId })
		.populate("rider", "name email")
		.populate("driver", "name email")
		.sort({ createdAt: -1 });

	return {
		data: rides,
		meta: {
			total: rides.length,
		},
	};
};
const getAvailableRides = async (currentUser: JwtPayload) => {
	const driver = await UserModel.findById(currentUser.userId).select(
		"role isBlocked"
	);
	if (!driver) {
		throw new AppError("Unauthorized", httpStatus.FORBIDDEN);
	}
	if (driver.isBlocked) {
		throw new AppError("Your account is blocked", httpStatus.FORBIDDEN);
	}

	const availableRides = await RideModel.find({
		rideStatus: RideStatus.PENDING,
	})
		.populate("rider", "name email")
		.sort({ createdAt: -1 });

	return {
		data: availableRides,
		meta: {
			total: availableRides.length,
		},
	};
};
const cancelRide = async (rideId: string, tokenData: JwtPayload) => {
	if (tokenData.role !== UserRole.RIDER) {
		throw new AppError("Only riders can cancel rides", 403);
	}

	const ride = await RideModel.findById(rideId);
	if (!ride) {
		throw new AppError("Ride not found", 404);
	}

	if (String(ride.rider) !== tokenData.userId) {
		throw new AppError("You can only cancel your own rides", 403);
	}

	if (ride.rideStatus !== RideStatus.PENDING) {
		throw new AppError("Ride can only be cancelled when pending", 400);
	}

	addStatusHistoryEntry(ride, RideStatus.CANCELLED);

	const cancelledRide = await RideModel.findByIdAndUpdate(
		rideId,
		{
			rideStatus: RideStatus.CANCELLED,
			statusHistory: ride.statusHistory,
		},
		{ new: true }
	)
		.populate("rider", "name email")
		.populate("driver", "name email");

	return cancelledRide;
};
const acceptRide = async (rideId: string, currentUser: JwtPayload) => {
	const ride = await RideModel.findById(rideId);
	if (!ride) {
		throw new AppError("Ride not found", httpStatus.NOT_FOUND);
	}

	const driverInfo: PopulatedDriver | null = await DriverModel.findOne({
		driverProfile: currentUser.userId,
	})
		.populate("driverProfile", "isBlocked")
		.select("activeStatus approvalStatus vehicleCapacity");

	if (!driverInfo) {
		throw new AppError("Driver not found", httpStatus.NOT_FOUND);
	}
	if (driverInfo.driverProfile.isBlocked) {
		throw new AppError("Your account is blocked", httpStatus.FORBIDDEN);
	}
	if (driverInfo.approvalStatus !== DriverStatus.APPROVED) {
		throw new AppError(
			"You are not approved to accept rides",
			httpStatus.FORBIDDEN
		);
	}
	if (driverInfo.activeStatus !== DriverActiveStatus.ONLINE) {
		throw new AppError("You are not online", httpStatus.FORBIDDEN);
	}
	if (driverInfo.vehicleCapacity < ride.passengers) {
		throw new AppError(
			"Your vehicle capacity is not enough for this ride",
			httpStatus.FORBIDDEN
		);
	}
	if (ride.rideStatus !== RideStatus.PENDING) {
		throw new AppError(
			"Ride is no longer available",
			httpStatus.BAD_REQUEST
		);
	}

	addStatusHistoryEntry(ride, RideStatus.ACCEPTED);

	ride.rideStatus = RideStatus.ACCEPTED;
	ride.driver = currentUser.userId;
	await ride.save();

	const populatedRide = await RideModel.findById(ride._id)
		.populate("rider", "name email")
		.populate("driver", "name email");

	return populatedRide;
};
const updateRideStatus = async (
	rideId: string,
	rideData: Partial<IRide>,
	tokenData: JwtPayload
) => {
	if (!rideData.rideStatus) {
		throw new AppError("Ride status is required", 400);
	}
	if (!Object.values(RideStatus).includes(rideData.rideStatus)) {
		throw new AppError("Invalid ride status", 400);
	}

	const ride = await RideModel.findById(rideId).select(
		"driver rider rideStatus"
	);
	if (!ride) {
		throw new AppError("Ride not found", 404);
	}

	if (tokenData.role === UserRole.RIDER) {
		if (String(ride.rider) !== tokenData.userId) {
			throw new AppError("You can only update your own rides", 403);
		}
		if (rideData.rideStatus !== RideStatus.CANCELLED) {
			throw new AppError("Riders can only cancel rides", 403);
		}
		if (ride.rideStatus !== RideStatus.PENDING) {
			throw new AppError("You can only cancel pending rides", 400);
		}
	} else if (tokenData.role === UserRole.DRIVER) {
		if (tokenData.userId !== String(ride.driver)) {
			throw new AppError(
				"You can only update rides assigned to you",
				403
			);
		}
	} else {
		throw new AppError("You are not authorized to update rides", 403);
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

	const fullRide = await RideModel.findById(rideId);
	if (!fullRide) {
		throw new AppError("Ride not found", 404);
	}

	addStatusHistoryEntry(fullRide, nextStatus);

	const updatedRide = await RideModel.findOneAndUpdate(
		{ _id: rideId, rideStatus: currentStatus },
		{
			rideStatus: nextStatus,
			statusHistory: fullRide.statusHistory,
		},
		{ new: true }
	)
		.populate("rider", "name email")
		.populate("driver", "name email");

	if (!updatedRide) {
		throw new AppError("Ride not found or status already changed", 404);
	}

	return updatedRide;
};

export const RideServices = {
	createRide,
	getDriverRides,
	getRiderRides,
	updateRideStatus,
	getCurrentUserRides,
	cancelRide,
	getAllRides,
	getAvailableRides,
	acceptRide,
};
