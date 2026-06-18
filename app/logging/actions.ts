"use server";

// context exports (bindRequestContext/getContext/runWithContext/setContextValue) exist at runtime
// but are not yet reflected in the published .d.ts — use require to avoid TS2305
import { createLogger } from "@yedoma-labs/suruk-logger";
// biome-ignore lint/suspicious/noExplicitAny: untyped runtime context exports from suruk-logger
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { bindRequestContext, getContext, runWithContext, setContextValue } =
	require("@yedoma-labs/suruk-logger") as Record<string, (...args: unknown[]) => unknown>;
import { actionLogger, logger } from "@/lib/logger";

// Test 1: Log Levels
export async function testLogLevels(): Promise<string> {
	let output = "=== Testing Log Levels ===\n\n";

	logger.debug("This is a DEBUG message", {
		level: "debug",
		timestamp: Date.now(),
	});
	output += "✅ DEBUG: Detailed diagnostic information\n";

	logger.info("This is an INFO message", {
		level: "info",
		event: "user_action",
	});
	output += "✅ INFO: General informational messages\n";

	logger.warn("This is a WARN message", {
		level: "warn",
		warning: "low_disk_space",
	});
	output += "✅ WARN: Warning messages for potential issues\n";

	logger.error("This is an ERROR message", {
		level: "error",
		errorCode: "E001",
	});
	output += "✅ ERROR: Error conditions\n";

	try {
		throw new Error("Critical system failure");
	} catch (error) {
		logger.fatal(error as Error, "This is a FATAL message");
		output += "✅ FATAL: Fatal errors that may cause shutdown\n";
	}

	output += "\n💡 Check your terminal/console to see the actual log output\n";
	output += "In development: Pretty formatted logs\n";
	output += "In production: JSON formatted logs\n";

	return output;
}

// Test 2: Structured Logging
export async function testStructuredLogging(): Promise<string> {
	let output = "=== Testing Structured Logging ===\n\n";

	// Simple structured log
	logger.info("User logged in", {
		userId: "user_123",
		email: "john@example.com",
		loginMethod: "oauth",
		timestamp: new Date().toISOString(),
	});
	output += "✅ Simple structured log with user context\n";

	// Complex nested data
	logger.info("API request processed", {
		request: {
			method: "POST",
			path: "/api/users",
			body: { name: "John Doe", email: "john@example.com" },
		},
		response: {
			status: 201,
			duration: 45,
			size: 1024,
		},
		metadata: {
			userAgent: "Mozilla/5.0",
			ipAddress: "192.168.1.1",
		},
	});
	output += "✅ Complex nested structured data\n";

	// Array data
	logger.info("Batch operation completed", {
		operation: "user_import",
		items: ["user1", "user2", "user3"],
		count: 3,
		failed: 0,
		duration: 1234,
	});
	output += "✅ Structured log with arrays\n";

	output += "\n💡 All context fields are searchable in log aggregation tools\n";

	return output;
}

// Test 3: Child Loggers
export async function testChildLoggers(): Promise<string> {
	let output = "=== Testing Child Loggers ===\n\n";

	// Create child loggers with inherited context
	const authLogger = logger.child({ module: "auth", service: "user-service" });
	const dbLogger = logger.child({
		module: "database",
		service: "user-service",
	});
	const apiLogger = logger.child({ module: "api", version: "v1" });

	authLogger.info("User authentication started", { userId: "user_123" });
	output += '✅ Auth logger (includes module: "auth")\n';

	dbLogger.info("Database query executed", {
		query: "SELECT * FROM users",
		duration: 23,
	});
	output += '✅ DB logger (includes module: "database")\n';

	apiLogger.info("API endpoint called", { endpoint: "/users", method: "GET" });
	output += '✅ API logger (includes module: "api")\n';

	// Nested child loggers
	const userAuthLogger = authLogger.child({
		feature: "login",
		userId: "user_456",
	});
	userAuthLogger.info("Login attempt", { success: true });
	output += "✅ Nested child logger (inherits all parent context)\n";

	output +=
		"\n💡 Each child logger automatically includes its context in every log\n";
	output += "Great for filtering logs by module, service, or feature!\n";

	return output;
}

// Test 4: Error Logging
export async function testErrorLogging(): Promise<string> {
	let output = "=== Testing Error Logging ===\n\n";

	// Basic error
	try {
		throw new Error("Database connection failed");
	} catch (error) {
		logger.error(error as Error, "Failed to connect to database");
		output += "✅ Basic error with stack trace\n";
	}

	// Error with context
	try {
		throw new Error("User not found");
	} catch (error) {
		logger.error("User lookup failed", {
			error: error,
			userId: "user_999",
			operation: "getUserById",
			timestamp: Date.now(),
		});
		output += "✅ Error with additional context\n";
	}

	// Custom error object
	try {
		const customError = new Error("Validation failed");
		(customError as any).code = "VALIDATION_ERROR";
		(customError as any).fields = ["email", "password"];
		throw customError;
	} catch (error) {
		logger.error("Form validation error", {
			error: error,
			form: "registration",
			invalidFields: ["email", "password"],
		});
		output += "✅ Custom error object with metadata\n";
	}

	// API error simulation
	try {
		throw new Error("API request failed");
	} catch (error) {
		actionLogger.error("External API call failed", {
			error: error,
			api: "stripe",
			endpoint: "/charges",
			statusCode: 500,
			retries: 3,
			action: "processPayment",
		});
		output += "✅ API error with retry information\n";
	}

	output += "\n💡 Errors include full stack traces for debugging\n";
	output += "Context helps trace the error cause quickly\n";

	return output;
}

// Test 5: Redaction
export async function testRedaction(): Promise<string> {
	let output = "=== Testing Automatic Redaction ===\n\n";

	// Create logger with redaction (using wildcard paths for nested fields)
	const secureLogger = createLogger({
		name: "secure-app",
		level: "info",
		pretty: process.env.NODE_ENV !== "production",
		redact: [
			"password", // Top-level password field
			"cardNumber", // Top-level cardNumber field
			"cvv", // Top-level cvv field
			"token", // Top-level token field
			"apiKey", // Top-level apiKey field
			"ssn", // Top-level ssn field
			"req.headers.authorization", // Nested authorization header
			"*.password", // Any password in any object (wildcard)
			"*.*.password", // Deeper nesting
			"*.ssn",
			"*.*.ssn",
			"*.cardNumber",
			"*.*.cardNumber",
			"*.cvv",
			"*.*.cvv",
		],
	});

	output += "Demo 1: Top-level sensitive fields\n";
	output += "----------------------------------------\n";

	// Test password redaction (top-level)
	secureLogger.info("User registration (top-level fields)", {
		email: "user@example.com",
		password: "SuperSecret123!", // Will be redacted
		name: "John Doe",
	});
	output += '✅ Top-level password: "SuperSecret123!" → [Redacted]\n';

	// Test credit card redaction (top-level)
	secureLogger.info("Payment processed (top-level fields)", {
		cardNumber: "4111111111111111", // Will be redacted
		cvv: "123", // Will be redacted
		amount: 99.99,
		currency: "USD",
	});
	output += '✅ Top-level cardNumber: "4111..." → [Redacted]\n';
	output += '✅ Top-level cvv: "123" → [Redacted]\n';

	// Test token redaction (top-level)
	secureLogger.info("API request (top-level fields)", {
		endpoint: "/api/users",
		token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Will be redacted
		userId: "user_123",
	});
	output += '✅ Top-level token: "Bearer eyJ..." → [Redacted]\n';

	// Test API key redaction (top-level)
	secureLogger.info("External service call (top-level fields)", {
		service: "SendGrid",
		apiKey: "SG.abc123def456...", // Will be redacted
		status: "success",
	});
	output += '✅ Top-level apiKey: "SG.abc..." → [Redacted]\n\n';

	output += "Demo 2: Nested sensitive fields (with wildcards)\n";
	output += "----------------------------------------\n";

	// Wildcard redaction demonstration
	secureLogger.info("Nested sensitive data (wildcard match)", {
		publicData: {
			name: "John Doe",
			email: "john@example.com",
		},
		sensitiveData: {
			password: "secret123", // Will be redacted via *.password
			ssn: "123-45-6789", // Will be redacted via *.ssn
		},
		paymentInfo: {
			cardNumber: "4111111111111111", // Will be redacted via *.cardNumber
			cvv: "999", // Will be redacted via *.cvv
			amount: 100,
		},
	});
	output += "✅ Nested password (sensitiveData.password) → [Redacted]\n";
	output += "✅ Nested ssn (sensitiveData.ssn) → [Redacted]\n";
	output += "✅ Nested cardNumber (paymentInfo.cardNumber) → [Redacted]\n";
	output += "✅ Nested cvv (paymentInfo.cvv) → [Redacted]\n\n";

	output += "Demo 3: What gets logged (simulation)\n";
	output += "----------------------------------------\n";
	output += "Original data:\n";
	output += '  { password: "MyPassword123", email: "user@example.com" }\n\n';
	output += "Logged output:\n";
	output += '  { password: "[Redacted]", email: "user@example.com" }\n\n';

	output += "💡 Redaction Configuration:\n";
	output += "----------------------------------------\n";
	output += "Top-level paths:\n";
	output += "  - password, cardNumber, cvv, token, apiKey, ssn\n\n";
	output += "Wildcard paths (for nested objects):\n";
	output += "  - *.password → Matches any object with password field\n";
	output += "  - *.*.password → Matches deeper nesting\n";
	output += "  - *.cardNumber, *.cvv, *.ssn → Same for other fields\n\n";
	output += "📋 Check your terminal to see actual [Redacted] output!\n";
	output += 'Sensitive values are replaced with "[Redacted]" in logs.\n';

	return output;
}

// Test 6: Performance
export async function testPerformance(): Promise<string> {
	let output = "=== Testing Performance ===\n\n";

	const iterations = 1000;

	// Test 1: Simple logs
	const start1 = Date.now();
	for (let i = 0; i < iterations; i++) {
		logger.info("Performance test message", { iteration: i });
	}
	const duration1 = Date.now() - start1;
	output += `✅ ${iterations} simple logs: ${duration1}ms (${((iterations / duration1) * 1000).toFixed(0)} logs/sec)\n`;

	// Test 2: Structured logs
	const start2 = Date.now();
	for (let i = 0; i < iterations; i++) {
		logger.info("Performance test with data", {
			iteration: i,
			timestamp: Date.now(),
			user: { id: "user_123", name: "John Doe" },
			metadata: { version: "1.0", env: "test" },
		});
	}
	const duration2 = Date.now() - start2;
	output += `✅ ${iterations} structured logs: ${duration2}ms (${((iterations / duration2) * 1000).toFixed(0)} logs/sec)\n`;

	// Test 3: Child logger
	const childLogger = logger.child({ module: "performance-test" });
	const start3 = Date.now();
	for (let i = 0; i < iterations; i++) {
		childLogger.info("Child logger test", { iteration: i });
	}
	const duration3 = Date.now() - start3;
	output += `✅ ${iterations} child logger logs: ${duration3}ms (${((iterations / duration3) * 1000).toFixed(0)} logs/sec)\n`;

	output += "\n💡 Pino is asynchronous and non-blocking\n";
	output += "Logging operations don't slow down your application\n";
	output += "In production, logs are written in the background\n";

	return output;
}

// Test 7: Async Logging
export async function testAsyncLogging(): Promise<string> {
	let output = "=== Testing Async Logging ===\n\n";

	// Simulate async operations
	const promises = [];

	for (let i = 0; i < 5; i++) {
		const promise = (async () => {
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
			logger.info("Async operation completed", {
				operationId: `op_${i}`,
				duration: Math.floor(Math.random() * 100),
				status: "success",
			});
			return `Operation ${i} logged`;
		})();
		promises.push(promise);
	}

	await Promise.all(promises);
	output += "✅ 5 async operations logged concurrently\n";

	// Simulate high-throughput scenario
	output += "\n💡 High-throughput test:\n";
	const start = Date.now();

	const batchPromises = Array.from({ length: 10 }, async (_, batch) => {
		for (let i = 0; i < 100; i++) {
			logger.info("Batch operation", {
				batch,
				item: i,
				timestamp: Date.now(),
			});
		}
		return `Batch ${batch} complete`;
	});

	await Promise.all(batchPromises);
	const duration = Date.now() - start;

	output += `✅ 1000 logs across 10 async batches: ${duration}ms\n`;
	output += `   Throughput: ${((1000 / duration) * 1000).toFixed(0)} logs/sec\n`;

	output += "\n💡 Async logging ensures:\n";
	output += "- Non-blocking I/O\n";
	output += "- High throughput\n";
	output += "- No backpressure on application\n";

	return output;
}

// Test 8: Request Context
export async function testRequestContext(): Promise<string> {
	let output = "=== Testing Request Context ===\n\n";

	// Demo 1: runWithContext — scoped context for the duration of a function
	const capturedCtx = runWithContext(
		{ requestId: "req-abc123", userId: "user-456", ip: "127.0.0.1" },
		() => {
			const ctx = getContext();
			logger.info("Request handler started", { endpoint: "/api/users" });
			setContextValue("step", "validation");
			logger.info("Input validation complete");
			setContextValue("step", "db-query");
			logger.info("Database query executed", { rows: 42, duration: 18 });
			setContextValue("step", "response");
			logger.info("Response sent", { statusCode: 200 });
			return ctx;
		},
	);
	output += "✅ runWithContext: scoped context for the whole handler\n";
	output += `   Context at start: ${JSON.stringify(capturedCtx)}\n\n`;

	// Demo 2: bindRequestContext — attach request metadata to async context
	runWithContext({}, () => {
		bindRequestContext("req-xyz789", {
			userId: "user-999",
			route: "/api/orders",
		});
		const bound = getContext();
		logger.info("Order processing started", { orderId: "ord-001" });
		logger.info("Inventory check passed", { sku: "PROD-42", stock: 8 });
		output +=
			"✅ bindRequestContext: requestId + fields on current async context\n";
		output += `   Bound context: ${JSON.stringify(bound)}\n\n`;
	});

	// Demo 3: setContextValue — mutate individual keys mid-request
	runWithContext({ requestId: "req-pipeline", phase: "init" }, () => {
		logger.info("Pipeline starting");
		setContextValue("phase", "fetch");
		logger.info("Fetching upstream data");
		setContextValue("phase", "transform");
		logger.info("Transforming records", { count: 1024 });
		setContextValue("phase", "persist");
		logger.info("Writing to store");
		setContextValue("phase", "complete");
		logger.info("Pipeline finished", { duration: 347 });
	});
	output +=
		"✅ setContextValue: evolve specific keys as request progresses\n\n";

	output += "💡 All logs above carry full context in your terminal!\n";
	output +=
		"Context propagates automatically through async boundaries — no prop drilling.\n";

	return output;
}
