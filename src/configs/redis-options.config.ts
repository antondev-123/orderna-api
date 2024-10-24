import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";
import { CommonModule } from "src/common/common.module";
import { RedisInitException } from "src/common/exceptions/redis-init.exception";
import { CustomLoggerService } from "src/common/services/custom-logger.service";

export const RedisOptions: CacheModuleAsyncOptions = {
	isGlobal: true,
	imports: [ConfigModule, CommonModule],
	useFactory: async (
		configService: ConfigService,
		loggerService: CustomLoggerService

	) => {
		try {
			const redisHost = configService.get<string>('REDIS_HOST') ?? "127.0.0.1";
			const redisPort = parseInt(configService.get<string>('REDIS_PORT')!) ?? 6379;
			const redisPassword = configService.get<string>('REDIS_PASSWORD') ?? "foobared";

			if (!redisHost || !redisPort || !redisPassword) {
				loggerService.error({ message: `Host not set: ${redisHost}.`, context: "RedisOption" });
				loggerService.error({ message: `Port not set: ${redisPort}.`, context: "RedisOption" });
				loggerService.error({ message: `Password not set: ${redisPassword}.`, context: "RedisOption" });
				throw new RedisInitException('Redis vars are not set.');
			}

			// throw new RedisInitException('Redis client not initialized');
			const store = await redisStore({
				name: "orderna-redis",
				socket: {
					host: redisHost,
					port: redisPort,
				},
				username: "default",
				password: redisPassword,
			});

			loggerService.log({ message: "Redis store initialized successfully.", context: "RedisOption" });
			return {
				store: () => store,
			};
		} catch (error) {
			loggerService.error({ message: `${error}.`, context: "RedisOption" });
			throw new RedisInitException('Redis client not initialized.');
		}
	},
	inject: [ConfigService, CustomLoggerService],
};