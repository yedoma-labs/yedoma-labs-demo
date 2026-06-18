"use server";

/**
 * ⚠️ WARNING: DEMO ONLY - DO NOT USE IN PRODUCTION
 *
 * This demo uses module-level state for simplicity. In production:
 * - Use Redis/database for cross-instance state
 * - Use proper session management for multi-user scenarios
 * - Implement proper cleanup on process exit
 * - Consider Server-Sent Events instead of polling
 */

import path from "node:path";
import { watchConfig } from "@yedoma-labs/turar-config";
import { configSchema } from "@/lib/config.server";

// Module-level state (DEMO ONLY - not suitable for production/serverless)
let watchHandle: Awaited<ReturnType<typeof watchConfig>> | null = null;
let configChanges: Array<{
	type: "added" | "changed" | "removed";
	path: string;
	timestamp: string;
}> = [];
let isStarting = false; // Prevent race conditions on concurrent calls

export async function startWatching() {
	"use server";

	// Prevent race conditions from double-clicks
	if (isStarting) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return startWatching(); // Retry after brief delay
	}

	if (watchHandle) {
		// Already watching
		return {
			success: true,
			message: "Already watching",
			config: formatConfig(watchHandle.getConfig()),
		};
	}

	isStarting = true;

	try {
		watchHandle = await watchConfig({
			schema: configSchema,
			configDir: path.join(process.cwd(), "config"),
			onChange: (_newConfig, change, _oldConfig) => {
				// Track changes (only store metadata, not full configs)
				configChanges.unshift({
					type: change.type,
					path: change.path,
					timestamp: new Date().toISOString(),
				});

				// Keep only last 20 changes
				configChanges = configChanges.slice(0, 20);

				console.log(`[Hot Reload] Config ${change.type}: ${change.path}`);
			},
			debounce: 500,
			ignoreInitial: true,
		});

		isStarting = false;

		return {
			success: true,
			message: "Started watching config files",
			config: formatConfig(watchHandle.getConfig()),
		};
	} catch (error) {
		isStarting = false;
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to start watching",
			config: null,
		};
	}
}

export async function stopWatching() {
	"use server";

	if (!watchHandle) {
		return {
			success: true,
			message: "Not watching",
		};
	}

	try {
		await watchHandle.stop();
		watchHandle = null;
		configChanges = [];
		isStarting = false;

		return {
			success: true,
			message: "Stopped watching config files",
		};
	} catch (error) {
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to stop watching",
		};
	}
}

// Cleanup on process exit (prevent file descriptor leaks)
if (typeof process !== "undefined") {
	process.on("beforeExit", async () => {
		if (watchHandle) {
			console.log("[Hot Reload] Cleaning up file watcher on process exit");
			await watchHandle.stop().catch(console.error);
		}
	});
}

export async function getConfigChanges() {
	"use server";

	if (!watchHandle) {
		return {
			changes: [],
			currentConfig: null,
		};
	}

	return {
		changes: configChanges,
		currentConfig: formatConfig(watchHandle.getConfig()),
	};
}

function formatConfig(config: any) {
	const isDatabaseLocal =
		config.database_host === "localhost" ||
		config.database_host === "127.0.0.1" ||
		config.database_host.startsWith("localhost:");

	return {
		app: {
			name: config.app_name,
			version: config.app_version,
			port: config.app_port,
		},
		features: {
			enableAnalytics: config.features_enableAnalytics,
			enableLogging: config.features_enableLogging,
			maxUploadSize: config.features_maxUploadSize,
		},
		api: {
			baseUrl: config.api_baseUrl,
			timeout: config.api_timeout,
			retries: config.api_retries,
		},
		database: {
			host: isDatabaseLocal ? config.database_host : "***redacted***",
			port: config.database_port,
			name: config.database_name,
			poolSize: config.database_poolSize,
		},
		cache: {
			ttl: config.cache_ttl,
			maxSize: config.cache_maxSize,
		},
	};
}
