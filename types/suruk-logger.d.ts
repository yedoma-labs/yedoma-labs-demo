declare module "@yedoma-labs/suruk-logger" {
	export interface LoggerOptions {
		name?: string;
		level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
		pretty?: boolean;
		redact?: string[];
		destination?: any;
		serializers?: Record<string, (value: any) => any>;
		mixin?: () => Record<string, any>;
	}

	export interface Logger {
		trace: (msg: string | Error, obj?: any) => void;
		trace: (obj: any, msg?: string) => void;
		debug: (msg: string | Error, obj?: any) => void;
		debug: (obj: any, msg?: string) => void;
		info: (msg: string | Error, obj?: any) => void;
		info: (obj: any, msg?: string) => void;
		warn: (msg: string | Error, obj?: any) => void;
		warn: (obj: any, msg?: string) => void;
		error: (msg: string | Error, obj?: any) => void;
		error: (obj: any, msg?: string) => void;
		fatal: (msg: string | Error, obj?: any) => void;
		fatal: (obj: any, msg?: string) => void;
		child: (bindings: Record<string, any>) => Logger;
	}

	export function createLogger(options?: LoggerOptions): Logger;
}
