/**
 * Server-only configuration module
 * This file must only be imported in server components or server actions
 */

import "server-only";
import path from "node:path";
import { eg } from "@yedoma-labs/bylyt-env-guard";
import { createConfigSync } from "@yedoma-labs/turar-config";

/**
 * Server-side configuration using turar-config
 * Loads from config files with environment cascading
 *
 * Note: turar-config uses flat schema keys with underscores
 * to map to nested JSON objects in config files.
 * e.g., app_name maps to { "app": { "name": "..." } }
 */
export const configSchema = {
	app_name: eg.string().default("Yedoma Labs Demo"),
	app_version: eg.string().default("0.3.0"),
	app_port: eg.number().default(3000),

	features_enableAnalytics: eg.boolean().default(false),
	features_enableLogging: eg.boolean().default(true),
	features_maxUploadSize: eg.number().default(5242880), // 5MB

	api_baseUrl: eg.url().default("http://localhost:3000/api"),
	api_timeout: eg.number().default(30000),
	api_retries: eg.number().default(3),

	database_host: eg.string().default("localhost"),
	database_port: eg.number().default(5432),
	database_name: eg.string().default("demo_db"),
	database_poolSize: eg.number().default(10),

	cache_ttl: eg.number().default(3600),
	cache_maxSize: eg.number().default(100),
} as const;

export const config = createConfigSync({
	schema: configSchema,
	configDir: path.join(process.cwd(), "config"),
	strict: false, // Allow extra fields in config files
});

export type AppConfig = typeof config;
