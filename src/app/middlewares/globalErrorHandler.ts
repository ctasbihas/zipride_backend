import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { ZodError } from "zod";

interface CustomError extends Error {
	statusCode?: number;
	code?: number;
	keyValue?: any;
	errors?: any;
}

const handleCastError = (error: mongoose.Error.CastError) => ({
	statusCode: httpStatus.BAD_REQUEST,
	message: `Invalid ${error.path}: ${error.value}`,
});

const handleDuplicateKeyError = (error: any) => {
	const field = Object.keys(error.keyValue)[0];
	const value = error.keyValue[field];
	return {
		statusCode: httpStatus.CONFLICT,
		message: `${field} '${value}' already exists`,
	};
};

const handleValidationError = (error: mongoose.Error.ValidationError) => {
	const errors = Object.values(error.errors).map((err: any) => err.message);
	return {
		statusCode: httpStatus.BAD_REQUEST,
		message: `Validation Error: ${errors.join(". ")}`,
	};
};

const handleZodError = (error: ZodError) => {
	const errorMessages = error.issues.map((issue) => {
		const path = issue.path.join(".");
		return `${path}: ${issue.message}`;
	});

	return {
		statusCode: httpStatus.BAD_REQUEST,
		message: `Validation Error: ${errorMessages.join(", ")}`,
		errorSources: error.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
		})),
	};
};

const globalErrorHandler = (
	error: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
	let message = error.message || "Something went wrong";
	let errorSources: any[] = [];

	// Handle different types of errors
	if (error instanceof ZodError) {
		const simplifiedError = handleZodError(error);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorSources = simplifiedError.errorSources;
	} else if (error.name === "CastError") {
		const simplifiedError = handleCastError(
			error as mongoose.Error.CastError
		);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
	} else if (error.code === 11000) {
		const simplifiedError = handleDuplicateKeyError(error);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
	} else if (error.name === "ValidationError") {
		const simplifiedError = handleValidationError(
			error as mongoose.Error.ValidationError
		);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
	}

	res.status(statusCode).json({
		success: false,
		statusCode,
		message,
		...(errorSources.length > 0 && { errorSources }),
	});
};

export default globalErrorHandler;
