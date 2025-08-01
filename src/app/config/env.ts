import { config } from "dotenv";

config();

interface IEnv {
	PORT: string;
	MONGO_URI: string;
	NODE_ENV: "development" | "production";
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
	BCRYPT_SALT_ROUNDS: string;
	FRONTEND_URL: string;
}

const loadEnvs = (): IEnv => {
	const requiredEnvs: string[] = [
		"PORT",
		"MONGO_URI",
		"NODE_ENV",
		"JWT_SECRET",
		"JWT_EXPIRES_IN",
		"BCRYPT_SALT_ROUNDS",
		"FRONTEND_URL",
	];
	requiredEnvs.forEach((env) => {
		if (!process.env[env]) {
			throw new Error(`Environment variable ${env} is not defined`);
		}
	});
	return {
		PORT: process.env.PORT!,
		MONGO_URI: process.env.MONGO_URI!,
		NODE_ENV: process.env.NODE_ENV! as "development" | "production",
		JWT_SECRET: process.env.JWT_SECRET!,
		JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
		BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS!,
		FRONTEND_URL: process.env.FRONTEND_URL!,
	};
};

export const env = loadEnvs();
