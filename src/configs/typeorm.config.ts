import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { config } from 'dotenv';
import { join } from "path";
import { DataSourceOptions } from "typeorm/data-source";
config();

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) { }

	createTypeOrmOptions(): TypeOrmModuleOptions {
		const dbConfig: Partial<DataSourceOptions> = {
			synchronize: false,
			migrationsTableName: "migrations",
		};

		switch (process.env.NODE_ENV) {

			case "development":
				Object.assign(dbConfig, {
					type: "postgres",
					username: this.configService.get<string>("DB_USERNAME"),
					password: this.configService.get<string>("DB_PASSWORD"),
					host: this.configService.get<string>("DB_HOST"),
					port: this.configService.get<number>("DB_PORT"),
					database: this.configService.get<string>("DB_DATABASE_NAME"),
					migrationsRun: true,
					entities: ["**/*.entity.js"],
					ssl: process.env.DB_CERT
						? {
							requestCert: true,
							rejectUnauthorized: false,
							ca: process.env.DB_CERT
						}
						: false
				});
				break;
			case "test":
				Object.assign(dbConfig, {
					type: "postgres",
					username: this.configService.get<string>("DB_USERNAME"),
					password: this.configService.get<string>("DB_PASSWORD"),
					host: this.configService.get<string>("DB_HOST"),
					port: this.configService.get<number>("DB_PORT"),
					database: this.configService.get<string>("DB_DATABASE_NAME"),
					synchronize: true,
					migrations: [join(__dirname + "**/db/migrations/*.ts")],
					entities: ["**/*.entity.ts"],
					migrationsRun: true, //run migrations after each test
				});
				break;
			case "docker":
				Object.assign(dbConfig, {
					type: "postgres",
					username: this.configService.get<string>("DB_USERNAME"),
					password: this.configService.get<string>("DB_PASSWORD"),
					host: this.configService.get<string>("DB_HOST"),
					port: this.configService.get<number>("DB_PORT"),
					database: this.configService.get<string>("DB_DATABASE_NAME"),
					migrationsRun: true,
					entities: ["**/*.entity.js"],
					ssl: false,
				});
				break;
			case "production":
				Object.assign(dbConfig, {
					type: "postgres",
					username: this.configService.get<string>("DB_USERNAME"),
					password: this.configService.get<string>("DB_PASSWORD"),
					host: this.configService.get<string>("DB_HOST"),
					port: this.configService.get<number>("DB_PORT"),
					database: this.configService.get<string>("DB_DATABASE_NAME"),
					migrationsRun: true,
					entities: ["**/*.entity.js"],
					ssl: process.env.DB_CERT
						? {
							requestCert: true,
							rejectUnauthorized: false,
							ca: process.env.DB_CERT
						}
						: false
				});
				break;
			default:
				throw new Error("unknown environment");
		}
		return dbConfig;
	}
}
