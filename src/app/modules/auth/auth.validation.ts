import { z } from "zod";

export const loginSchema = z.object({
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
		.min(1, "Password is required"),
});
export const changePasswordSchema = z.object({
	currentPassword: z
		.string({
			message: "Current password is required and must be a string",
		})
		.min(1, "Current password is required"),
	newPassword: z
		.string({
			message: "Password is required and must be a string",
		})
		.min(2, "Password must be at least 2 characters long")
		.max(100, "Password cannot exceed 100 characters")
		.regex(
			/[A-Z].*[A-Z]/,
			"Password must contain at least 2 uppercase letters"
		)
		.regex(
			/[a-z].*[a-z]/,
			"Password must contain at least 2 lowercase letters"
		)
		.regex(/[0-9].*[0-9]/, "Password must contain at least 2 numbers")
		.regex(
			/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
			"Password must contain at least 2 special characters"
		),
});
