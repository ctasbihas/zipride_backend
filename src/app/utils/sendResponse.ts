import { Response } from "express";

interface SendResponseData {
	statusCode: number;
	success: boolean;
	message: string;
	data: any;
	meta?: any;
}

const sendResponse = (res: Response, data: SendResponseData) => {
	res.status(data.statusCode).json({
		success: data.success,
		statusCode: data.statusCode,
		message: data.message,
		data: data.data,
		meta: data.meta,
	});
};

export default sendResponse;
