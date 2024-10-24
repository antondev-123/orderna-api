import { rm } from "fs/promises";
import { join } from "path";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";

winstonLoggerConfig.debug({ message: "Setup beforeEach() Test Condition", context: "Setup beforeEach() Test Condition" });

global.beforeEach(async () => {
	try {
		winstonLoggerConfig.debug("Removing test.sqlite...");
		await rm(join(__dirname, "..", "test.sqlite"));
	} catch (err) { }
});