import { z } from "zod";
import { UserRole } from "./user.interface";

export const createUserSchema = z.object({
	name: z
		.string({
			message: "Name is required and must be a string",
		})
		.min(2, "Name must be at least 2 characters long")
		.max(50, "Name cannot exceed 50 characters")
		.trim(),
	email: z
		.string({
			message: "Email is required and must be a string",
		})
		.email("Invalid email format")
		.toLowerCase(),
	password: z
		.string({
			message: "Password is required and must be a string",
		})
		.min(8, "Password must be at least 8 characters long")
		.max(100, "Password cannot exceed 100 characters")
		.regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
		.regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
		.regex(/[0-9]/, "Password must contain at least 1 number")
		.regex(
			/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
			"Password must contain at least 1 special character"
		),
	role: z
		.enum([UserRole.DRIVER, UserRole.RIDER], {
			message: "Role must be one of the predefined user roles",
		})
		.optional()
		.default(UserRole.RIDER),
});

// Update User validation schema
export const updateUserSchema = z.object({
	name: z
		.string({
			message: "Name must be a string",
		})
		.min(2, "Name must be at least 2 characters long")
		.max(50, "Name cannot exceed 50 characters")
		.trim()
		.optional(),
	email: z
		.string({
			message: "Email must be a string",
		})
		.email("Invalid email format")
		.toLowerCase()
		.optional(),
	role: z
		.enum(Object.values(UserRole), {
			message: "Role must be one of the predefined user roles",
		})
		.optional(),
	isBlocked: z
		.boolean({
			message: "isBlocked must be a boolean",
		})
		.optional(),
});
