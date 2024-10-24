import { isNotEmpty } from "class-validator";
import { createLogger, format, transports } from "winston";

const customFormat = format.printf(
	({ level = "info", message, ms, timestamp, context, request, response, stack, ...metadata }) => {

		let logString = `[winston] [PID: ${process.pid}] ${timestamp} [${ms}] [${level}]`;

		if (isNotEmpty(context)) {
			logString += ` [${context}]`;
		}

		logString += ` ${message}`;

		if (request) {
			logString += ` "req" = ${JSON.stringify(request)}`;
		}

		if (response) {
			logString += ` "res" = ${JSON.stringify(response)}`;
		}

		if (metadata) {
			for (const key in metadata) {
				if (metadata.hasOwnProperty(key) && isNotEmpty(metadata[key])) {
					logString += ` [${key}: ${metadata[key]}]`;
				}
			}
		}

		if (isNotEmpty(stack)) {
			logString += ` | Stacktrace: ${stack}`;
		}

		return logString;
	}
);

// for production environment
const instanceLogger = {
	format: format.combine(
		format.prettyPrint(),
		format.ms(),
		format.splat(),
		format.colorize({ all: true }),
		format.timestamp({
			format: "MM-DD-YYYY HH:mm:ss",
		}),
		format.errors({ stack: true }),
		customFormat
	),
	transports: [new transports.Console({
		level: 'info',
	})]
}

// export log instance based on the current environment
export const winstonLoggerConfig = createLogger(instanceLogger);
