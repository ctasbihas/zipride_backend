import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (payload: JwtPayload) => {
	return jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN,
	} as SignOptions);
};
export const verifyToken = (token: string) => {
	return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
