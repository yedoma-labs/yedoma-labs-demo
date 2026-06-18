"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConfigChanges, startWatching, stopWatching } from "./actions";

type ConfigChange = {
	type: "added" | "changed" | "removed";
	path: string;
	timestamp: string;
	before?: any;
	after?: any;
};

const changeColor: Record<string, string> = {
	added: "#10b981",
	changed: "#f59e0b",
	removed: "#ef4444",
};
const changeBg: Record<string, string> = {
	added: "rgba(16,185,129,0.08)",
	changed: "rgba(245,158,11,0.08)",
	removed: "rgba(239,68,68,0.08)",
};

export default function HotReloadPage() {
	const [isWatching, setIsWatching] = useState(false);
	const [changes, setChanges] = useState<ConfigChange[]>([]);
	const [currentConfig, setCurrentConfig] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	const handleStartWatching = async () => {
		setLoading(true);
		try {
			const result = await startWatching();
			setIsWatching(true);
			setCurrentConfig(result.config);
			const interval = setInterval(async () => {
				const updates = await getConfigChanges();
				if (updates.changes.length > 0) {
					setChanges((prev) => [...updates.changes, ...prev].slice(0, 10));
					setCurrentConfig(updates.currentConfig);
				}
			}, 2000);
			setIntervalId(interval);
		} catch (error) {
			console.error("Failed to start watching:", error);
		}
		setLoading(false);
	};

	const handleStopWatching = async () => {
		setLoading(true);
		try {
			await stopWatching();
			setIsWatching(false);
			if (intervalId) {
				clearInterval(intervalId);
				setIntervalId(null);
			}
		} catch (error) {
			console.error("Failed to stop watching:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [intervalId]);

	return (
		<main
			style={{
				maxWidth: "1000px",
				margin: "0 auto",
				padding: "2rem",
				minHeight: "100vh",
			}}
		>
			<style>{`
        html, body { background: #0f172a !important; }
        h1, h2, h3 { color: #f1f5f9; }
        p, li { color: #94a3b8; }
        code { color: #a78bfa; background: rgba(167,139,250,0.1); padding: 0.1rem 0.4rem; border-radius: 4px; font-family: monospace; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

			<Link
				href="/config"
				style={{
					color: "#06b6d4",
					textDecoration: "none",
					fontSize: "0.875rem",
					display: "inline-flex",
					alignItems: "center",
					gap: "0.25rem",
					marginBottom: "2rem",
				}}
			>
				← Back to Config
			</Link>

			{/* Hero */}
			<div
				style={{
					background: "linear-gradient(135deg, #001a1a, #002d2d, #001a2d)",
					borderRadius: "24px",
					padding: "2.5rem",
					marginBottom: "2.5rem",
					border: "1px solid rgba(6,182,212,0.25)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						position: "absolute",
						top: "-60px",
						right: "-40px",
						width: "220px",
						height: "220px",
						background:
							"radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
						borderRadius: "50%",
						pointerEvents: "none",
					}}
				/>
				<div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔥</div>
				<h1
					style={{
						fontSize: "2.25rem",
						fontWeight: 800,
						color: "#f1f5f9",
						marginBottom: "0.5rem",
					}}
				>
					Hot Reload Demo
				</h1>
				<p
					style={{
						color: "#94a3b8",
						fontSize: "1rem",
						maxWidth: "560px",
						margin: 0,
					}}
				>
					turar-config v0.2.0 watches config files for changes and reloads
					automatically — no app restart required.
				</p>
			</div>

			{/* What is hot reload */}
			<section
				style={{
					marginBottom: "2.5rem",
					background: "rgba(30,41,59,0.5)",
					borderRadius: "16px",
					padding: "1.75rem",
					border: "1px solid #1e293b",
				}}
			>
				<h2 style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
					What is Hot Reload?
				</h2>
				<p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
					Watch config files for changes and automatically reload without
					restarting your application. Perfect for:
				</p>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
						gap: "0.75rem",
						marginBottom: "1.25rem",
					}}
				>
					{[
						{
							icon: "🚩",
							text: "Updating feature flags in real-time",
							color: "#06b6d4",
						},
						{
							icon: "🔌",
							text: "Adjusting connection pool sizes without downtime",
							color: "#34d399",
						},
						{
							icon: "⏱️",
							text: "Changing timeouts and retry logic on the fly",
							color: "#f59e0b",
						},
						{
							icon: "🧪",
							text: "Testing different configs during development",
							color: "#a78bfa",
						},
					].map(({ icon, text, color }) => (
						<div
							key={text}
							style={{
								background: "rgba(15,23,42,0.6)",
								borderRadius: "10px",
								padding: "0.9rem",
								border: `1px solid ${color}20`,
								display: "flex",
								gap: "0.6rem",
								alignItems: "flex-start",
							}}
						>
							<span style={{ flexShrink: 0 }}>{icon}</span>
							<span
								style={{
									color: "#94a3b8",
									fontSize: "0.85rem",
									lineHeight: 1.4,
								}}
							>
								{text}
							</span>
						</div>
					))}
				</div>
				<div
					style={{
						background: "rgba(245,158,11,0.08)",
						borderRadius: "10px",
						padding: "1rem",
						border: "1px solid rgba(245,158,11,0.2)",
						fontSize: "0.875rem",
						color: "#94a3b8",
					}}
				>
					<strong style={{ color: "#f59e0b" }}>⚠️ Demo Only:</strong> Uses
					simplified state for education. Production apps should use
					Redis/database for state and Server-Sent Events for real-time updates.
					Not suitable for serverless.
				</div>
			</section>

			{/* Controls */}
			<section
				style={{
					marginBottom: "2.5rem",
					background: "rgba(30,41,59,0.5)",
					borderRadius: "16px",
					padding: "1.75rem",
					border: "1px solid #1e293b",
				}}
			>
				<h2 style={{ color: "#f1f5f9", marginBottom: "1.25rem" }}>Controls</h2>
				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
						marginBottom: "1.25rem",
						flexWrap: "wrap",
					}}
				>
					<button
						onClick={handleStartWatching}
						disabled={isWatching || loading}
						style={{
							padding: "0.75rem 1.5rem",
							fontSize: "0.95rem",
							fontWeight: 600,
							background: isWatching
								? "rgba(30,41,59,0.5)"
								: "linear-gradient(135deg, #10b981, #059669)",
							color: isWatching ? "#64748b" : "white",
							border: isWatching ? "1px solid #334155" : "none",
							borderRadius: "10px",
							cursor: isWatching || loading ? "not-allowed" : "pointer",
							opacity: isWatching ? 0.6 : 1,
							transition: "all 0.2s",
						}}
					>
						{loading && !isWatching
							? "⏳ Starting..."
							: isWatching
								? "✅ Watching..."
								: "▶ Start Watching"}
					</button>

					<button
						onClick={handleStopWatching}
						disabled={!isWatching || loading}
						style={{
							padding: "0.75rem 1.5rem",
							fontSize: "0.95rem",
							fontWeight: 600,
							background: !isWatching
								? "rgba(30,41,59,0.5)"
								: "linear-gradient(135deg, #ef4444, #dc2626)",
							color: !isWatching ? "#64748b" : "white",
							border: !isWatching ? "1px solid #334155" : "none",
							borderRadius: "10px",
							cursor: !isWatching || loading ? "not-allowed" : "pointer",
							opacity: !isWatching ? 0.6 : 1,
							transition: "all 0.2s",
						}}
					>
						{loading && isWatching ? "⏳ Stopping..." : "■ Stop Watching"}
					</button>

					{isWatching && (
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "0.5rem",
								color: "#10b981",
								fontWeight: 600,
								fontSize: "0.9rem",
							}}
						>
							<span
								style={{
									display: "inline-block",
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									background: "#10b981",
									animation: "pulse 2s infinite",
								}}
							/>
							Active
						</div>
					)}
				</div>

				{isWatching && (
					<div
						style={{
							background: "rgba(6,182,212,0.08)",
							borderRadius: "10px",
							padding: "1rem",
							border: "1px solid rgba(6,182,212,0.2)",
							fontSize: "0.875rem",
							color: "#94a3b8",
						}}
					>
						<strong style={{ color: "#06b6d4" }}>Try it:</strong> Edit any
						config file and watch changes appear below:
						<div
							style={{
								display: "flex",
								gap: "0.75rem",
								marginTop: "0.6rem",
								flexWrap: "wrap",
							}}
						>
							{[
								"config/development.json",
								"config/default.yaml",
								"config/default.toml",
							].map((f) => (
								<code key={f} style={{ fontSize: "0.8rem" }}>
									{f}
								</code>
							))}
						</div>
					</div>
				)}
			</section>

			{/* Current config */}
			{currentConfig && (
				<section
					style={{
						marginBottom: "2.5rem",
						background: "rgba(30,41,59,0.5)",
						borderRadius: "16px",
						padding: "1.75rem",
						border: "1px solid #1e293b",
					}}
				>
					<h2 style={{ color: "#f1f5f9", marginBottom: "1rem" }}>
						Current Configuration
					</h2>
					<pre
						style={{
							background: "#020817",
							color: "#e2e8f0",
							padding: "1.25rem",
							borderRadius: "10px",
							fontSize: "0.8rem",
							overflowX: "auto",
							fontFamily: "'Fira Code','Consolas',monospace",
							lineHeight: 1.7,
							border: "1px solid #1e293b",
							margin: 0,
						}}
					>
						{JSON.stringify(currentConfig, null, 2)}
					</pre>
				</section>
			)}

			{/* Changes feed */}
			{changes.length > 0 && (
				<section style={{ marginBottom: "2.5rem" }}>
					<h2 style={{ color: "#f1f5f9", marginBottom: "0.5rem" }}>
						Recent Changes
					</h2>
					<p
						style={{
							color: "#64748b",
							fontSize: "0.875rem",
							marginBottom: "1.25rem",
						}}
					>
						Last {changes.length} changes detected
					</p>
					<div style={{ display: "grid", gap: "0.75rem" }}>
						{changes.map((change, idx) => (
							<div
								key={`${change.timestamp}-${idx}`}
								style={{
									background: changeBg[change.type] ?? "rgba(30,41,59,0.5)",
									border: `1px solid ${changeColor[change.type] ?? "#1e293b"}40`,
									borderLeft: `4px solid ${changeColor[change.type] ?? "#6366f1"}`,
									borderRadius: "10px",
									padding: "1rem",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "0.5rem",
									}}
								>
									<span
										style={{
											fontWeight: 700,
											color: changeColor[change.type],
											textTransform: "uppercase",
											fontSize: "0.75rem",
											letterSpacing: "0.06em",
										}}
									>
										{change.type}
									</span>
									<span
										style={{
											fontSize: "0.78rem",
											color: "#64748b",
											fontFamily: "monospace",
										}}
									>
										{new Date(change.timestamp).toLocaleTimeString()}
									</span>
								</div>
								<div
									style={{
										fontSize: "0.875rem",
										marginBottom:
											change.before !== undefined || change.after !== undefined
												? "0.5rem"
												: 0,
									}}
								>
									<span style={{ color: "#64748b" }}>Path: </span>
									<code style={{ color: "#e2e8f0" }}>{change.path}</code>
								</div>
								{change.before !== undefined && (
									<div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
										<span style={{ color: "#64748b" }}>Before: </span>
										<code style={{ color: "#ef4444" }}>
											{JSON.stringify(change.before)}
										</code>
									</div>
								)}
								{change.after !== undefined && (
									<div style={{ fontSize: "0.8rem" }}>
										<span style={{ color: "#64748b" }}>After: </span>
										<code style={{ color: "#10b981" }}>
											{JSON.stringify(change.after)}
										</code>
									</div>
								)}
							</div>
						))}
					</div>
				</section>
			)}

			{/* Code example */}
			<section
				style={{
					marginBottom: "2rem",
					background: "rgba(30,41,59,0.5)",
					borderRadius: "16px",
					padding: "1.75rem",
					border: "1px solid #1e293b",
				}}
			>
				<h2 style={{ color: "#f1f5f9", marginBottom: "1rem" }}>Code Example</h2>
				<pre
					style={{
						background: "#020817",
						color: "#e2e8f0",
						padding: "1.5rem",
						borderRadius: "12px",
						fontSize: "0.78rem",
						overflowX: "auto",
						fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
						lineHeight: 1.8,
						border: "1px solid #1e293b",
						margin: 0,
					}}
				>{`import { watchConfig } from '@yedoma-labs/turar-config'
import { eg } from '@yedoma-labs/bylyt-env-guard'

// Start watching config files
const handle = await watchConfig({
  schema: {
    features_enableAnalytics: eg.boolean().default(false),
    api_timeout: eg.number().default(30000),
  },
  configDir: './config',
  onChange: (newConfig, change, oldConfig) => {
    console.log(\`Config changed: \${change.type} \${change.path}\`)

    // Update your app with new config
    if (newConfig.api_timeout !== oldConfig.api_timeout) {
      httpClient.setTimeout(newConfig.api_timeout)
    }
  },
  debounce: 500, // Wait 500ms after last change
})

// Get current config anytime
const config = handle.getConfig()

// Stop watching when done
await handle.stop()`}</pre>
			</section>
		</main>
	);
}
