import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import {
	DocumentBuilder,
	SwaggerCustomOptions,
	SwaggerModule,
} from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";
import { AppModule } from "./app.module";
import { urlsConstant } from "./common/constants/url.constant";
import { getRuntimeEnvironment } from "./common/utils/environment-handler.util";
import { winstonLoggerConfig } from "./configs/winston-logger.config";

async function bootstrap() {
	const port = process.env.PORT || 3000;
	const host = "0.0.0.0";

	// Max file upload size is 10 mb
	const fastifyAdapter = new FastifyAdapter({
		bodyLimit: 10 * 1024 * 1024,
	});
	const logger = {

		logger: WinstonModule.createLogger(
			{
				instance: winstonLoggerConfig,
			},
		),
	};
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		fastifyAdapter,
		logger,
	);
	app.enableCors({
		origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
		// origin: ["http://localhost:4200", "http://127.0.0.1:4200", /\.orderna\.com$/],
		methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
		preflightContinue: false
	})
	app.setGlobalPrefix(urlsConstant.API_PREFIX_V1);
	// app.useLogger(winstonLogger);

	const config = new DocumentBuilder()
		.setTitle("Orderna API documentation")
		.setDescription("Documentation for ORDERNA API endpoints.")
		.setVersion("1.0")
		.addTag("ORDERNA")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			"authorization",
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	const customOptions: SwaggerCustomOptions = {
		swaggerOptions: {
			docExpansion: "none",
			filter: true,
			showRequestDuration: true,
			persistAuthorization: true,
		},
	};
	SwaggerModule.setup("docs", app, document, customOptions);

	await app.listen(port, host)
		.then(async () => {
			logger.logger.log({ message: "#################### - ORDERNA - ####################", context: "Main" })
			logger.logger.log({ message: `Orderna application is running on: ${await app.getUrl()}`, context: "Main" });
			logger.logger.log({ message: `Orderna swagger documentation is running on: ${await app.getUrl()}/docs`, context: "Main" });
			logger.logger.log({ message: `Orderna runs on port: ${port}`, context: "Main" });
			logger.logger.log({ message: `Orderna runtime environment: ${getRuntimeEnvironment()}`, context: "Main" });
			logger.logger.log({ message: "#####################################################", context: "Main" })
		})
		.catch((error) => {
			logger.logger.error({ message: `Error starting application: ${error}`, context: "Main" })
			process.exit(1);
		});
}
bootstrap();
