import { JwtPayload } from "jsonwebtoken";
import AppError from "../../utils/AppError";
import { RideStatus } from "../ride/ride.interface";
import { RideModel } from "../ride/ride.model";
import { UserRole } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import {
	DriverActiveStatus,
	DriverStatus,
	IDriver,
	PopulatedDriver,
} from "./driver.interface";
import { DriverModel } from "./driver.model";

const createDriver = async (driverData: IDriver, currentUser: JwtPayload) => {
	const driver = await UserModel.findById(currentUser.userId);
	if (!driver) {
		throw new AppError("User not found", 404);
	}
	if (driver.isBlocked) {
		throw new AppError("Your account has been blocked", 403);
	}
	const existingDriver = await DriverModel.findOne({
		driverProfile: currentUser.userId,
	});
	if (existingDriver) {
		throw new AppError(
			`This user is already a driver with status of ${existingDriver.approvalStatus}`,
			400
		);
	}

	const vehicleLicense = driverData.vehicleLicense.toUpperCase();
	const newDriver = await DriverModel.create({
		...driverData,
		vehicleLicense,
		driverProfile: currentUser.userId,
	});

	return newDriver;
};
const getDrivers = async () => {
	const drivers = await DriverModel.find().populate(
		"driverProfile",
		"name email role isBlocked"
	);
	return drivers;
};
const updateDriver = async (
	id: string,
	updatedData: Partial<IDriver>,
	currentUser: JwtPayload
) => {
	const driver = await DriverModel.findOne({
		driverProfile: id,
	});
	if (!driver) {
		throw new AppError("Driver not found", 404);
	}

	const isOwner = currentUser.userId === driver.driverProfile.id;

	if (!isOwner) {
		throw new AppError("You are not authorized", 403);
	}

	if (updatedData.approvalStatus) {
		throw new AppError("Only admin can update approval status", 403);
	}

	if (updatedData.activeStatus) {
		if (
			!Object.values(DriverActiveStatus).includes(
				updatedData.activeStatus
			)
		) {
			throw new AppError("Invalid active status", 400);
		}
		if (driver.approvalStatus !== DriverStatus.APPROVED) {
			throw new AppError(
				"Active status can only be updated for approved drivers",
				400
			);
		}
	}

	if (updatedData.driverProfile) {
		throw new AppError("Driver profile cannot be updated", 400);
	}

	if (updatedData.vehicleLicense) {
		updatedData.vehicleLicense = updatedData.vehicleLicense.toUpperCase();
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		updatedData,
		{
			new: true,
			runValidators: true,
		}
	).populate("driverProfile", "name email role");

	return updatedDriver;
};
const getDriverById = async (id: string, tokenData: JwtPayload) => {
	const driver = await DriverModel.findOne({ driverProfile: id }).populate(
		"driverProfile",
		"name email role isBlocked"
	);
	if (!driver) {
		throw new AppError("Driver not found", 404);
	}
	const isAdmin = tokenData.role === UserRole.ADMIN;
	const isOwner = tokenData.userId === driver.driverProfile.id;
	if (!isAdmin && !isOwner) {
		throw new AppError("You are not authorized to view this driver", 403);
	}

	const totalEarnings = await RideModel.find({
		driver: driver.driverProfile.id,
		rideStatus: RideStatus.COMPLETED,
	}).then((rides) => rides.reduce((acc, ride) => acc + ride.fare, 0));

	return {
		data: driver,
		meta: {
			totalEarnings,
		},
	};
};
const approveDriver = async (id: string) => {
	const driverInfo: PopulatedDriver | null = await DriverModel.findOne({
		driverProfile: id,
	})
		.populate("driverProfile", "isBlocked")
		.select("activeStatus approvalStatus vehicleCapacity");
	if (!driverInfo) {
		throw new AppError("Driver not found", 404);
	}
	if (driverInfo.driverProfile.isBlocked) {
		throw new AppError("The account is blocked", 403);
	}

	if (driverInfo.approvalStatus === DriverStatus.APPROVED) {
		throw new AppError("Driver is already approved", 400);
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		{ approvalStatus: DriverStatus.APPROVED },
		{
			new: true,
			runValidators: true,
		}
	).populate("driverProfile", "name email role");

	return updatedDriver;
};
const suspendDriver = async (id: string) => {
	const driverInfo: PopulatedDriver | null = await DriverModel.findOne({
		driverProfile: id,
	})
		.populate("driverProfile", "isBlocked")
		.select("activeStatus approvalStatus vehicleCapacity");
	if (!driverInfo) {
		throw new AppError("Driver not found", 404);
	}
	if (driverInfo.driverProfile.isBlocked) {
		throw new AppError("The account is blocked", 403);
	}

	if (driverInfo.approvalStatus === DriverStatus.SUSPENDED) {
		throw new AppError("Driver is already suspended", 400);
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		{
			approvalStatus: DriverStatus.SUSPENDED,
			activeStatus: DriverActiveStatus.OFFLINE,
		},
		{
			new: true,
			runValidators: true,
		}
	).populate("driverProfile", "name email role");

	return updatedDriver;
};
const rejectDriver = async (id: string) => {
	const driverInfo = await DriverModel.findOne({
		driverProfile: id,
	});
	if (!driverInfo) {
		throw new AppError("Driver not found", 404);
	}

	if (driverInfo.approvalStatus === DriverStatus.REJECTED) {
		throw new AppError("Driver is already rejected", 400);
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		{
			approvalStatus: DriverStatus.REJECTED,
		},
		{
			new: true,
			runValidators: true,
		}
	).populate("driverProfile", "name email role");

	return updatedDriver;
};
const updateDriverStatus = async (
	id: string,
	driverData: { activeStatus: DriverActiveStatus },
	tokenData: JwtPayload
) => {
	const driver = await DriverModel.findOne({ driverProfile: id }).populate(
		"driverProfile",
		"name email role"
	);

	if (!driver) {
		throw new AppError("Driver not found", 404);
	}

	const isOwner = tokenData.userId === driver.driverProfile.id;
	if (!isOwner) {
		throw new AppError("You can only update your own active status", 403);
	}

	if (driver.approvalStatus !== DriverStatus.APPROVED) {
		throw new AppError(
			"Only approved drivers can update active status",
			400
		);
	}
	if (!Object.values(DriverActiveStatus).includes(driverData.activeStatus)) {
		throw new AppError("Invalid active status", 400);
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		{ activeStatus: driverData.activeStatus },
		{
			new: true,
			runValidators: true,
		}
	).populate("driverProfile", "name email role");

	return updatedDriver;
};

export const DriverServices = {
	createDriver,
	getDrivers,
	updateDriver,
	getDriverById,
	approveDriver,
	suspendDriver,
	rejectDriver,
	updateDriverStatus,
};
