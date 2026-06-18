import { createEnv, eg } from "@yedoma-labs/bylyt-env-guard";

export const env = createEnv({
	schema: {
		NODE_ENV: eg
			.enum(["development", "staging", "production"] as const)
			.default("development"),
		NEXT_PUBLIC_API_URL: eg.url().default("http://localhost:3000/api"),
		DEMO_MODE: eg.boolean().default(true),
	},
});
