import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../utils/AppError";
import { hashPassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import { IUser, UserRole } from "./user.interface";
import { UserModel } from "./user.model";

const createUser = async (userData: IUser) => {
	const { name, email, password, role } = userData;

	const existingUser = await UserModel.findOne({
		email,
	});

	if (existingUser) {
		throw new AppError(
			"User already exists with this email",
			httpStatus.CONFLICT
		);
	}
	if (role) {
		if (!Object.values(UserRole).includes(role)) {
			throw new AppError("Invalid user role", httpStatus.BAD_REQUEST);
		}
		if (role === UserRole.ADMIN) {
			throw new AppError(
				"Cannot create user with ADMIN role",
				httpStatus.FORBIDDEN
			);
		}
	}

	const hashedPassword = await hashPassword(password);

	const user = await UserModel.create({
		name: name.trim(),
		email,
		password: hashedPassword,
		role,
	});

	const { password: _, ...rest } = user.toObject();

	const token = generateToken({
		userId: user._id.toString(),
		email: user.email,
		role: user.role,
	});

	return {
		user: rest,
		token,
	};
};

const getAllUsers = async () => {
	const users = await UserModel.find()
		.select("-password")
		.sort({ createdAt: -1 });

	return {
		data: users,
		meta: {
			total: users.length,
		},
	};
};

const getUserById = async (id: string, currentUser: JwtPayload) => {
	if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
		throw new AppError("Unauthorized access", httpStatus.FORBIDDEN);
	}
	const user = await UserModel.findById(id).select("-password");

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	return user;
};

const updateUser = async (
	id: string,
	currentUser: JwtPayload,
	updatedData: Partial<IUser>
) => {
	if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
		throw new AppError(
			"You can only update your own profile",
			httpStatus.FORBIDDEN
		);
	}
	if (
		updatedData.isBlocked !== undefined &&
		currentUser.role !== UserRole.ADMIN
	) {
		throw new AppError(
			"You are not allowed to change the blocked status",
			httpStatus.FORBIDDEN
		);
	}
	if (updatedData.email) {
		const existingUser = await UserModel.findOne({
			email: updatedData.email,
		});
		if (existingUser && String(existingUser._id) !== id) {
			throw new AppError("Email already in use", httpStatus.CONFLICT);
		}
	}
	if (updatedData.role && currentUser.role !== UserRole.ADMIN) {
		throw new AppError(
			"You are not allowed to change user roles",
			httpStatus.FORBIDDEN
		);
	}

	const user = await UserModel.findByIdAndUpdate(id, updatedData, {
		new: true,
		runValidators: true,
	}).select("-password");

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	return user;
};

const blockUser = async (id: string, currentUser: JwtPayload) => {
	// Admin cannot block themselves
	if (currentUser.userId === id) {
		throw new AppError("You cannot block yourself", httpStatus.BAD_REQUEST);
	}

	const user = await UserModel.findById(id);
	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	if (user.isBlocked) {
		throw new AppError("User is already blocked", httpStatus.BAD_REQUEST);
	}

	const updatedUser = await UserModel.findByIdAndUpdate(
		id,
		{ isBlocked: true },
		{
			new: true,
			runValidators: true,
		}
	).select("-password");

	return updatedUser;
};

export const UserServices = {
	createUser,
	getAllUsers,
	getUserById,
	updateUser,
	blockUser,
};
