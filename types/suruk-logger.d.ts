declare module "@yedoma-labs/suruk-logger" {
	export interface LoggerOptions {
		name?: string;
		level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
		pretty?: boolean;
		redact?: string[];
		destination?: unknown;
		serializers?: Record<string, (value: unknown) => unknown>;
		mixin?: () => Record<string, unknown>;
	}

	export interface Logger {
		trace: (msg: string | Error, obj?: unknown) => void;
		trace: (obj: unknown, msg?: string) => void;
		debug: (msg: string | Error, obj?: unknown) => void;
		debug: (obj: unknown, msg?: string) => void;
		info: (msg: string | Error, obj?: unknown) => void;
		info: (obj: unknown, msg?: string) => void;
		warn: (msg: string | Error, obj?: unknown) => void;
		warn: (obj: unknown, msg?: string) => void;
		error: (msg: string | Error, obj?: unknown) => void;
		error: (obj: unknown, msg?: string) => void;
		fatal: (msg: string | Error, obj?: unknown) => void;
		fatal: (obj: unknown, msg?: string) => void;
		child: (bindings: Record<string, unknown>) => Logger;
	}

	export function createLogger(options?: LoggerOptions): Logger;
}
