import { JwtPayload } from "jsonwebtoken";
import AppError from "../../utils/AppError";
import { RideStatus } from "../ride/ride.interface";
import { RideModel } from "../ride/ride.model";
import { UserRole } from "../user/user.interface";
import { DriverStatus, IDriver } from "./driver.interface";
import { DriverModel } from "./driver.model";

const createDriver = async (driverData: IDriver, tokenData: JwtPayload) => {
	if (tokenData.role !== UserRole.DRIVER) {
		throw new AppError("User is not a driver", 403);
	}
	const existingDriver = await DriverModel.findOne({
		driverProfile: tokenData.userId,
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
		driverProfile: tokenData.userId,
	});

	return newDriver;
};
const getDrivers = async () => {
	const drivers = await DriverModel.find().populate(
		"driverProfile",
		"name email"
	);
	return drivers;
};
const updateDriver = async (
	id: string,
	driverData: Partial<IDriver>,
	tokenData: JwtPayload
) => {
	const driver = await DriverModel.findOne({
		driverProfile: id,
	}).populate("driverProfile", "name email role");
	if (!driver) {
		throw new AppError("Driver not found", 404);
	}

	const isAdmin = tokenData.role === UserRole.ADMIN;
	const isOwner = tokenData.userId === driver.driverProfile.id;

	// Only owner or admin can update
	if (!isOwner && !isAdmin) {
		throw new AppError("You are not authorized to update this driver", 403);
	}

	// Only admin can update approvalStatus
	if (driverData.approvalStatus && !isAdmin) {
		throw new AppError("Only admin can update approval status", 403);
	}

	// Only approved drivers can have activeStatus updated
	if (
		driverData.activeStatus &&
		driver.approvalStatus !== DriverStatus.APPROVED
	) {
		throw new AppError(
			"Active status can only be updated for approved drivers",
			400
		);
	}

	// Only owner can update activeStatus, not admin
	if (driverData.activeStatus && isAdmin) {
		throw new AppError("Admin cannot update active status", 400);
	}

	// Prevent updating driverProfile
	if (driverData.driverProfile) {
		throw new AppError("Driver profile cannot be updated", 400);
	}

	const updateData: Partial<IDriver> = { ...driverData };
	if (driverData.vehicleLicense) {
		updateData.vehicleLicense = driverData.vehicleLicense.toUpperCase();
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		updateData,
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

const approveDriver = async (id: string, tokenData: JwtPayload) => {
	// Only admin can approve drivers
	if (tokenData.role !== UserRole.ADMIN) {
		throw new AppError("Only admin can approve drivers", 403);
	}

	const driver = await DriverModel.findOne({ driverProfile: id }).populate(
		"driverProfile",
		"name email role"
	);

	if (!driver) {
		throw new AppError("Driver not found", 404);
	}

	if (driver.approvalStatus === DriverStatus.APPROVED) {
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

const suspendDriver = async (id: string, tokenData: JwtPayload) => {
	// Only admin can suspend drivers
	if (tokenData.role !== UserRole.ADMIN) {
		throw new AppError("Only admin can suspend drivers", 403);
	}

	const driver = await DriverModel.findOne({ driverProfile: id }).populate(
		"driverProfile",
		"name email role"
	);

	if (!driver) {
		throw new AppError("Driver not found", 404);
	}

	if (driver.approvalStatus === DriverStatus.SUSPENDED) {
		throw new AppError("Driver is already suspended", 400);
	}

	const updatedDriver = await DriverModel.findOneAndUpdate(
		{ driverProfile: id },
		{ 
			approvalStatus: DriverStatus.SUSPENDED,
			activeStatus: false // Inactive when suspended
		},
		{
			new: true,
			runValidators: true,
		}
	).populate("driverProfile", "name email role");

	return updatedDriver;
};

const updateDriverStatus = async (id: string, driverData: { activeStatus: boolean }, tokenData: JwtPayload) => {
	const driver = await DriverModel.findOne({ driverProfile: id }).populate(
		"driverProfile",
		"name email role"
	);

	if (!driver) {
		throw new AppError("Driver not found", 404);
	}

	const isOwner = tokenData.userId === driver.driverProfile.id;

	// Only the driver can update their active status
	if (!isOwner) {
		throw new AppError("You can only update your own active status", 403);
	}

	// Only approved drivers can update active status
	if (driver.approvalStatus !== DriverStatus.APPROVED) {
		throw new AppError("Only approved drivers can update active status", 400);
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
	updateDriverStatus,
};
