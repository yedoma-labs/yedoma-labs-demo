import { createLogger } from "@yedoma-labs/suruk-logger";

// Create base logger for the application
export const logger = createLogger({
	name: "yedoma-labs-demo",
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	pretty: process.env.NODE_ENV !== "production",
	redact: [
		// Top-level sensitive fields
		"password",
		"cardNumber",
		"cvv",
		"token",
		"apiKey",
		"ssn",
		// Nested fields (wildcard patterns)
		"*.password",
		"*.*.password",
		"*.cardNumber",
		"*.*.cardNumber",
		"*.cvv",
		"*.*.cvv",
		"*.token",
		"*.*.token",
		"*.apiKey",
		"*.*.apiKey",
		"*.ssn",
		"*.*.ssn",
		// HTTP headers that might contain sensitive data
		"req.headers.authorization",
		"req.headers.cookie",
	],
});

// Create scoped loggers for different modules
export const formLogger = logger.child({ module: "forms" });
export const actionLogger = logger.child({ module: "actions" });
export const storeLogger = logger.child({ module: "state" });
export const adapterLogger = logger.child({ module: "adapter" });
