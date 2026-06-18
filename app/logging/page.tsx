"use client";

import Link from "next/link";
import { useState } from "react";
import pkg from "../../package.json";

const LOGGER_VERSION = (pkg.dependencies as Record<string, string>)[
	"@yedoma-labs/suruk-logger"
];

import { clientLogger, formLogger } from "@/lib/clientLogger";
import {
	testAsyncLogging,
	testChildLoggers,
	testErrorLogging,
	testLogLevels,
	testPerformance,
	testRedaction,
	testRequestContext,
	testStructuredLogging,
} from "./actions";

export default function LoggingPage() {
	const [output, setOutput] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [activeTest, setActiveTest] = useState<string | null>(null);

	const runTest = async (testFn: () => Promise<string>, testName: string) => {
		setLoading(true);
		setActiveTest(testName);
		setOutput(`▶ Running ${testName}…\n`);
		try {
			const result = await testFn();
			setOutput(result);
			formLogger.info("Test completed", { testName });
		} catch (error) {
			setOutput(`✗ Error: ${error}`);
			formLogger.error("Test failed", { testName, error: String(error) });
		} finally {
			setLoading(false);
			setActiveTest(null);
		}
	};

	const testClientLogging = () => {
		setOutput("Testing client-side logging…\n\n");
		clientLogger.debug("Debug message from client", { timestamp: Date.now() });
		clientLogger.info("Info message from client", { user: "demo-user" });
		clientLogger.warn("Warning message from client", { issue: "low memory" });
		clientLogger.error("Error message from client", {
			error: "Network timeout",
		});
		const scopedLogger = clientLogger.child({ component: "LoginForm" });
		scopedLogger.info("User login attempt", { email: "user@example.com" });
		setOutput(
			(prev) =>
				`${prev}✅ Logs sent to browser DevTools Console — check the Console tab!`,
		);
	};

	const TESTS = [
		{
			label: "⚡ Performance",
			desc: "Pino-based — 5-10x faster than Winston, async non-blocking",
			fn: testPerformance,
			name: "Performance Test",
			gradient: "linear-gradient(135deg,#0e7490,#06b6d4)",
		},
		{
			label: "📊 Log Levels",
			desc: "debug → info → warn → error → fatal with configurable minimum",
			fn: testLogLevels,
			name: "Log Levels",
			gradient: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
		},
		{
			label: "🏗️ Structured",
			desc: "Add typed contextual fields to every log message",
			fn: testStructuredLogging,
			name: "Structured Logging",
			gradient: "linear-gradient(135deg,#4c1d95,#8b5cf6)",
		},
		{
			label: "👶 Child Loggers",
			desc: "Scoped loggers that inherit parent context automatically",
			fn: testChildLoggers,
			name: "Child Loggers",
			gradient: "linear-gradient(135deg,#064e3b,#10b981)",
		},
		{
			label: "🔒 Auto Redaction",
			desc: "Wildcard redaction of passwords, tokens, card numbers",
			fn: testRedaction,
			name: "Redaction Test",
			gradient: "linear-gradient(135deg,#7f1d1d,#ef4444)",
		},
		{
			label: "❌ Error Logging",
			desc: "Auto error serialisation with stack traces and context",
			fn: testErrorLogging,
			name: "Error Logging",
			gradient: "linear-gradient(135deg,#78350f,#f59e0b)",
		},
		{
			label: "🌐 Client Logging",
			desc: "Same API client-side — check your DevTools Console",
			fn: null,
			name: "Client Logging",
			gradient: "linear-gradient(135deg,#1e1b4b,#6366f1)",
		},
		{
			label: "⚡ Async Logging",
			desc: "Non-blocking high-throughput logging for heavy workloads",
			fn: testAsyncLogging,
			name: "Async Logging",
			gradient: "linear-gradient(135deg,#831843,#ec4899)",
		},
		{
			label: "🔗 Request Context",
			desc: "runWithContext, bindRequestContext, setContextValue — async context propagation",
			fn: testRequestContext,
			name: "Request Context",
			gradient: "linear-gradient(135deg,#0c4a6e,#0ea5e9)",
		},
	] as const;

	return (
		<>
			<style>{`
        html, body { background: #0f172a !important; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

			<div
				style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}
			>
				<div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
					{/* Hero */}
					<div
						style={{
							background: "linear-gradient(135deg,#0a2540,#1e293b,#0f172a)",
							borderRadius: "24px",
							padding: "3rem",
							marginBottom: "1.5rem",
							border: "1px solid rgba(16,185,129,0.2)",
							position: "relative",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								background:
									"radial-gradient(ellipse at 80% 50%,rgba(16,185,129,0.1) 0%,transparent 60%)",
								pointerEvents: "none",
							}}
						/>
						<div
							style={{
								display: "flex",
								alignItems: "flex-start",
								justifyContent: "space-between",
								flexWrap: "wrap",
								gap: "1.5rem",
								position: "relative",
							}}
						>
							<div>
								<div
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "0.5rem",
										background: "rgba(16,185,129,0.12)",
										border: "1px solid rgba(16,185,129,0.3)",
										padding: "0.3rem 0.8rem",
										borderRadius: "2rem",
										marginBottom: "1rem",
									}}
								>
									<code
										style={{
											color: "#34d399",
											fontSize: "0.75rem",
											fontWeight: 700,
										}}
									>
										@yedoma-labs/suruk-logger
									</code>
									<span
										style={{
											background: "#10b981",
											color: "white",
											padding: "0.1rem 0.45rem",
											borderRadius: "4px",
											fontSize: "0.65rem",
											fontWeight: 800,
										}}
									>
										v{LOGGER_VERSION}
									</span>
								</div>
								<h1
									style={{
										fontSize: "clamp(1.75rem,4vw,3rem)",
										fontWeight: 900,
										margin: "0 0 0.5rem",
										background:
											"linear-gradient(135deg,#e2e8f0,#34d399,#06b6d4)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text",
										lineHeight: 1.05,
									}}
								>
									suruk-logger
								</h1>
								<p
									style={{
										color: "#94a3b8",
										fontSize: "1rem",
										margin: "0 0 1.5rem",
										maxWidth: 480,
									}}
								>
									Winston-compatible Pino wrapper. 5–10× faster, automatic
									redaction, structured JSON, child loggers.
								</p>
								<div
									style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}
								>
									{[
										"5-10× Faster",
										"Winston API",
										"Auto Redaction",
										"Child Loggers",
										"JSON Structured",
										"TypeScript",
									].map((t) => (
										<span
											key={t}
											style={{
												padding: "0.3rem 0.7rem",
												background: "rgba(16,185,129,0.1)",
												border: "1px solid rgba(16,185,129,0.25)",
												borderRadius: "6px",
												color: "#34d399",
												fontSize: "0.72rem",
												fontWeight: 700,
											}}
										>
											{t}
										</span>
									))}
								</div>
							</div>
							<div
								style={{
									fontSize: "5rem",
									lineHeight: 1,
									animation: "float 4s ease-in-out infinite",
									flexShrink: 0,
								}}
							>
								📝
							</div>
						</div>
					</div>

					<div
						style={{
							marginBottom: "1.5rem",
							display: "flex",
							alignItems: "center",
							gap: "1rem",
							flexWrap: "wrap",
						}}
					>
						<Link
							href="/"
							style={{
								color: "#10b981",
								textDecoration: "none",
								fontSize: "0.85rem",
							}}
						>
							← All Demos
						</Link>
						<span style={{ color: "#1e293b" }}>·</span>
						<a
							href="https://www.npmjs.com/package/@yedoma-labs/suruk-logger"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: "#34d399",
								textDecoration: "none",
								fontSize: "0.85rem",
							}}
						>
							npm ↗
						</a>
						<span style={{ color: "#1e293b" }}>·</span>
						<a
							href="https://github.com/yedoma-labs/suruk-logger"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: "#64748b",
								textDecoration: "none",
								fontSize: "0.85rem",
							}}
						>
							GitHub ↗
						</a>
					</div>

					{/* Test Grid */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
							gap: "1rem",
							marginBottom: "1.5rem",
						}}
					>
						{TESTS.map(({ label, desc, fn, name, gradient }) => {
							const isActive = activeTest === name;
							return (
								<div
									key={name}
									style={{
										background: "#1e293b",
										borderRadius: "14px",
										padding: "1.5rem",
										border: `1px solid ${isActive ? "#10b981" : "#334155"}`,
										boxShadow: isActive
											? "0 0 20px rgba(16,185,129,0.2)"
											: "none",
										transition: "all 0.2s",
									}}
								>
									<h3
										style={{
											color: "#e2e8f0",
											marginBottom: "0.5rem",
											fontSize: "1rem",
											fontWeight: 700,
										}}
									>
										{label}
									</h3>
									<p
										style={{
											color: "#64748b",
											fontSize: "0.78rem",
											marginBottom: "1rem",
											lineHeight: 1.5,
										}}
									>
										{desc}
									</p>
									<button
										type="button"
										onClick={() =>
											fn ? runTest(fn, name) : testClientLogging()
										}
										disabled={loading}
										style={{
											background: isActive ? "#10b981" : gradient,
											color: "white",
											border: "none",
											borderRadius: "8px",
											padding: "0.55rem 1.1rem",
											fontSize: "0.8rem",
											fontWeight: 700,
											cursor: loading ? "not-allowed" : "pointer",
											opacity: loading && !isActive ? 0.5 : 1,
											width: "100%",
										}}
									>
										{isActive ? (
											<span>
												<span
													style={{
														animation: "blink 1s infinite",
														display: "inline-block",
													}}
												>
													●
												</span>
												{" Running…"}
											</span>
										) : (
											`Run ${name}`
										)}
									</button>
								</div>
							);
						})}
					</div>

					{/* Terminal Output */}
					{output && (
						<div style={{ marginBottom: "1.5rem" }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.75rem",
									marginBottom: "0.5rem",
								}}
							>
								<h2
									style={{
										color: "#e2e8f0",
										fontSize: "1rem",
										fontWeight: 700,
										margin: 0,
									}}
								>
									Terminal Output
								</h2>
								<button
									type="button"
									onClick={() => setOutput("")}
									style={{
										padding: "0.2rem 0.6rem",
										background: "#1e293b",
										border: "1px solid #334155",
										borderRadius: "4px",
										color: "#64748b",
										fontSize: "0.7rem",
										cursor: "pointer",
									}}
								>
									Clear
								</button>
							</div>
							<div
								style={{
									background: "#020817",
									border: "1px solid #1e293b",
									borderRadius: "12px",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
										padding: "0.6rem 1rem",
										background: "#0a0f1e",
										borderBottom: "1px solid #1e293b",
									}}
								>
									{["#ef4444", "#f59e0b", "#10b981"].map((c) => (
										<div
											key={c}
											style={{
												width: 10,
												height: 10,
												borderRadius: "50%",
												background: c,
											}}
										/>
									))}
									<span
										style={{
											color: "#334155",
											fontSize: "0.7rem",
											fontFamily: "monospace",
											marginLeft: "0.5rem",
										}}
									>
										suruk-logger output
									</span>
								</div>
								<pre
									style={{
										color: "#a1e3cb",
										fontFamily:
											"'Fira Code','Cascadia Code','Consolas',monospace",
										fontSize: "0.78rem",
										padding: "1.25rem",
										margin: 0,
										whiteSpace: "pre-wrap",
										overflowX: "auto",
										maxHeight: 450,
										overflow: "auto",
										lineHeight: 1.7,
									}}
								>
									{output}
								</pre>
							</div>
							<p
								style={{
									color: "#334155",
									fontSize: "0.72rem",
									marginTop: "0.5rem",
								}}
							>
								💡 Server logs also appear in your terminal where the dev server
								is running.
							</p>
						</div>
					)}

					{/* Code Examples */}
					<div
						style={{
							background: "#1e293b",
							borderRadius: "16px",
							padding: "2rem",
							marginBottom: "1.5rem",
							border: "1px solid #334155",
						}}
					>
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "0.6rem",
								background: "linear-gradient(135deg,#064e3b,#10b981)",
								padding: "0.4rem 1.1rem",
								borderRadius: "2rem",
								marginBottom: "1.75rem",
							}}
						>
							<span style={{ fontSize: "1.1rem" }}>📖</span>
							<h2
								style={{
									color: "white",
									fontSize: "1.1rem",
									fontWeight: 800,
									margin: 0,
								}}
							>
								Code Examples
							</h2>
						</div>

						{[
							{
								title: "Basic Usage",
								code: `import { createLogger } from '@yedoma-labs/suruk-logger'

const logger = createLogger({
  name: 'my-app',
  level: 'info',
  pretty: true,
  redact: ['password', 'cardNumber'],
})

logger.info('User logged in', { userId: '123', email: 'user@example.com' })

// Error logging (two ways)
logger.error(dbError, 'Database connection failed') // Error first
logger.error('Database error', { error: dbError })  // Or as a field`,
							},
							{
								title: "Child Loggers",
								code: `const logger = createLogger({ name: 'app' })
const authLogger = logger.child({ module: 'auth' })
const dbLogger   = logger.child({ module: 'database' })

// All authLogger logs include { module: 'auth' }
authLogger.info('Login attempt', { email: 'user@example.com' })

// All dbLogger logs include { module: 'database' }
dbLogger.error('Query failed', { query: 'SELECT * FROM users' })`,
							},
							{
								title: "Automatic Redaction",
								code: `const logger = createLogger({
  name: 'app',
  redact: [
    'password',      // top-level
    '*.password',    // any nested object
    '*.cardNumber',  // nested card numbers
    'token',
    '*.cvv',
  ],
})

logger.info('Payment', {
  cardNumber: '4111111111111111', // → [Redacted]
  cvv:        '123',             // → [Redacted]
  amount:     100.00,            // shown normally
})`,
							},
							{
								title: "Environment-based Config",
								code: `const logger = createLogger({
  name:   'app',
  level:  process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  pretty: process.env.NODE_ENV !== 'production', // JSON in prod
  redact: ['password', 'token', 'apiKey'],
})`,
							},
						].map(({ title, code }) => (
							<div key={title} style={{ marginBottom: "1.5rem" }}>
								<h3
									style={{
										color: "#94a3b8",
										fontSize: "0.8rem",
										fontWeight: 700,
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										marginBottom: "0.75rem",
									}}
								>
									{title}
								</h3>
								<pre
									style={{
										background: "#020817",
										color: "#e2e8f0",
										padding: "1.25rem",
										borderRadius: "10px",
										fontSize: "0.775rem",
										overflowX: "auto",
										fontFamily:
											"'Fira Code','Cascadia Code','Consolas',monospace",
										lineHeight: 1.7,
										border: "1px solid #1e293b",
										margin: 0,
									}}
								>
									<code>{code}</code>
								</pre>
							</div>
						))}
					</div>

					{/* Why section */}
					<div
						style={{
							background: "#1e293b",
							borderRadius: "16px",
							padding: "2rem",
							marginBottom: "1.5rem",
							border: "1px solid #334155",
						}}
					>
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "0.6rem",
								background: "linear-gradient(135deg,#064e3b,#10b981)",
								padding: "0.4rem 1.1rem",
								borderRadius: "2rem",
								marginBottom: "1.75rem",
							}}
						>
							<span style={{ fontSize: "1.1rem" }}>✨</span>
							<h2
								style={{
									color: "white",
									fontSize: "1.1rem",
									fontWeight: 800,
									margin: 0,
								}}
							>
								Why suruk-logger?
							</h2>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
								gap: "1rem",
							}}
						>
							{[
								{
									icon: "⚡",
									title: "Performance",
									desc: "5-10× faster than Winston thanks to Pino's architecture",
									color: "#f59e0b",
								},
								{
									icon: "🔒",
									title: "Security",
									desc: "Automatic redaction of sensitive fields out of the box",
									color: "#ef4444",
								},
								{
									icon: "🎯",
									title: "Type Safety",
									desc: "Full TypeScript support with type inference on every field",
									color: "#a78bfa",
								},
								{
									icon: "🏗️",
									title: "Structured",
									desc: "JSON output ready for Datadog, Elastic, Loki, CloudWatch",
									color: "#06b6d4",
								},
								{
									icon: "🎨",
									title: "Developer UX",
									desc: "Pretty printing in dev, minified JSON in production",
									color: "#ec4899",
								},
								{
									icon: "📦",
									title: "Winston Compatible",
									desc: "Easy migration from Winston with the exact same API",
									color: "#10b981",
								},
							].map(({ icon, title, desc, color }) => (
								<div
									key={title}
									style={{
										background: "#0a0f1e",
										borderRadius: "10px",
										padding: "1rem",
										border: "1px solid #1e293b",
									}}
								>
									<div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
										{icon}
									</div>
									<h4
										style={{
											color,
											fontSize: "0.85rem",
											fontWeight: 700,
											marginBottom: "0.3rem",
										}}
									>
										{title}
									</h4>
									<p
										style={{
											color: "#475569",
											fontSize: "0.75rem",
											lineHeight: 1.5,
											margin: 0,
										}}
									>
										{desc}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div
						style={{
							textAlign: "center",
							padding: "2rem 1rem",
							borderTop: "1px solid #1e293b",
							color: "#334155",
						}}
					>
						<p style={{ marginBottom: "0.5rem" }}>
							<span
								style={{
									background: "linear-gradient(135deg,#34d399,#06b6d4)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
									fontWeight: 800,
									fontSize: "1rem",
								}}
							>
								@yedoma-labs/suruk-logger
							</span>
							<span style={{ color: "#1e293b", margin: "0 0.75rem" }}>·</span>
							<span style={{ color: "#475569", fontSize: "0.82rem" }}>
								Winston-compatible Pino wrapper · 5-10× faster · Auto redaction
							</span>
						</p>
						<p style={{ fontSize: "0.8rem" }}>
							<Link
								href="/"
								style={{ color: "#10b981", textDecoration: "none" }}
							>
								← Yedoma Labs Demo Hub
							</Link>
							<span style={{ color: "#1e293b", margin: "0 0.75rem" }}>·</span>
							<a
								href="https://www.npmjs.com/package/@yedoma-labs/suruk-logger"
								target="_blank"
								rel="noopener noreferrer"
								style={{ color: "#10b981", textDecoration: "none" }}
							>
								npm ↗
							</a>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
