"use client";

/**
 * Client-side logger wrapper
 * Provides a consistent API for client-side logging
 * In production, you might want to integrate with a service like Sentry or LogRocket
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogData = Record<string, unknown>;

class ClientLogger {
	private module: string;

	constructor(module: string = "app") {
		this.module = module;
	}

	private log(level: LogLevel, message: string, data?: LogData) {
		const timestamp = new Date().toISOString();
		const logData = { timestamp, module: this.module, ...data };

		const formattedMessage = `[${this.module}] ${message}`;

		switch (level) {
			case "debug":
				console.debug(formattedMessage, logData);
				break;
			case "info":
				console.log(formattedMessage, logData);
				break;
			case "warn":
				console.warn(formattedMessage, logData);
				break;
			case "error":
				console.error(formattedMessage, logData);
				break;
		}
	}

	debug(message: string, data?: LogData) {
		this.log("debug", message, data);
	}

	info(message: string, data?: LogData) {
		this.log("info", message, data);
	}

	warn(message: string, data?: LogData) {
		this.log("warn", message, data);
	}

	error(message: string, data?: LogData) {
		this.log("error", message, data);
	}

	child(context: LogData) {
		const childLogger = new ClientLogger(this.module);
		const originalLog = childLogger.log.bind(childLogger);

		childLogger.log = (level: LogLevel, message: string, data?: LogData) => {
			originalLog(level, message, { ...context, ...data });
		};

		return childLogger;
	}
}

// Create base logger for the application
export const clientLogger = new ClientLogger("app");

// Create scoped loggers for different modules
export const formLogger = clientLogger.child({ module: "forms" });
export const storeLogger = clientLogger.child({ module: "state" });
