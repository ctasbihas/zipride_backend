import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { verifyPassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import { UserModel } from "../user/user.model";

interface LoginData {
	email: string;
	password: string;
}

const login = async (loginData: LoginData) => {
	const { email, password } = loginData;

	const user = await UserModel.findOne({
		email,
	});
	if (!user) {
		throw new AppError("Invalid credentials", httpStatus.UNAUTHORIZED);
	}
	if (user.isBlocked) {
		throw new AppError("Your account is blocked", httpStatus.FORBIDDEN);
	}

	const isPasswordValid = await verifyPassword(password, user.password);

	if (!isPasswordValid) {
		throw new AppError("Invalid credentials", httpStatus.UNAUTHORIZED);
	}

	const token = generateToken({
		userId: user._id,
		email: user.email,
		role: user.role,
	});

	const { password: _, ...userWithoutPassword } = user.toObject();

	return {
		user: userWithoutPassword,
		token,
	};
};

const changePassword = async (
	userId: string,
	oldPassword: string,
	newPassword: string
) => {
	const user = await UserModel.findById(userId);
	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	const isOldPasswordValid = await verifyPassword(oldPassword, user.password);
	if (!isOldPasswordValid) {
		throw new AppError("Invalid current password", httpStatus.UNAUTHORIZED);
	}

	user.password = newPassword;
	await user.save();
};

export const AuthServices = {
	login,
	changePassword,
};
