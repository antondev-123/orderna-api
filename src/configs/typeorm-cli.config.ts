import { config as dotenvConfig } from 'dotenv';
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { resolve } from 'path';
import { existsSync } from 'fs';

const configService = new ConfigService()
const envFilePath = resolve(__dirname, `../../environments/.env.${process.env.NODE_ENV}`);

if (existsSync(envFilePath)) {
	dotenvConfig({ path: envFilePath });
}

const appDataSource: DataSourceOptions = {
	type: "postgres",
	username: configService.get<string>('DB_USERNAME'),
	password: configService.get<string>('DB_PASSWORD'),
	host: configService.get<string>('DB_HOST'),
	port: configService.get<number>('DB_PORT'),
	database: configService.get<string>('DB_DATABASE_NAME'),
	synchronize: false,
	migrationsTableName: "migrations",
	migrations: ["**/db/migrations/*{.js,.ts}"],
	entities: ["**/*.entity{.js,.ts}"],
	ssl: process.env.DB_CERT
		? {
			requestCert: true,
			rejectUnauthorized: false,
			ca: process.env.DB_CERT
		}
		: false
}
export const AppDataSource = new DataSource(appDataSource);
