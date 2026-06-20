"use client";

import "temporal-polyfill/shim";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
	extractFields,
	fromTemporal,
	isTemporalType,
	listAdapters,
	registerAdapter,
	toEpochMs,
	toTemporal,
} from "@yedoma-labs/keler-temporal";
import {
	addDays,
	addMonths,
	differenceInDays,
	differenceInMonths,
	endOfDay,
	endOfMonth,
	format,
	isAfter,
	isBefore,
	isSameDay,
	isValid,
	parseISO,
	startOfDay,
	startOfMonth,
	subDays,
} from "@yedoma-labs/keler-temporal/compat";
const KELER_VERSION = "0.1.1";

// ─── Shared UI ────────────────────────────────────────────────────────────────

const ACCENT = [
	"#a78bfa",
	"#06b6d4",
	"#10b981",
	"#f59e0b",
	"#ec4899",
	"#6366f1",
	"#fb923c",
	"#34d399",
	"#60a5fa",
	"#f472b6",
];

function CodeBlock({ code }: { code: string }) {
	return (
		<pre
			style={{
				background: "#020817",
				color: "#e2e8f0",
				padding: "1.1rem 1.25rem",
				borderRadius: "10px",
				fontSize: "0.755rem",
				overflowX: "auto",
				fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
				lineHeight: 1.75,
				border: "1px solid #1e293b",
				margin: 0,
			}}
		>
			<code>{code}</code>
		</pre>
	);
}

function SectionHeader({
	emoji,
	title,
	subtitle,
	gradient,
}: {
	emoji: string;
	title: string;
	subtitle: string;
	gradient: string;
}) {
	return (
		<div style={{ marginBottom: "1.75rem" }}>
			<div
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "0.6rem",
					background: gradient,
					padding: "0.4rem 1.1rem",
					borderRadius: "2rem",
					marginBottom: "0.6rem",
				}}
			>
				<span style={{ fontSize: "1.1rem" }}>{emoji}</span>
				<h2
					style={{
						color: "white",
						fontSize: "1.1rem",
						fontWeight: 800,
						margin: 0,
					}}
				>
					{title}
				</h2>
			</div>
			<p
				style={{ color: "#64748b", fontSize: "0.85rem", marginLeft: "0.25rem" }}
			>
				{subtitle}
			</p>
		</div>
	);
}

function Chip({
	label,
	value,
	color = "#a78bfa",
}: {
	label: string;
	value: string;
	color?: string;
}) {
	return (
		<div
			style={{
				background: "#0a0f1e",
				border: "1px solid #1e293b",
				borderRadius: "8px",
				padding: "0.6rem 0.8rem",
			}}
		>
			<div
				style={{
					color: "#475569",
					fontSize: "0.65rem",
					fontFamily: "monospace",
					marginBottom: "0.25rem",
				}}
			>
				{label}
			</div>
			<div
				style={{
					color,
					fontSize: "0.88rem",
					fontFamily: "monospace",
					fontWeight: 700,
					wordBreak: "break-all",
				}}
			>
				{value || "—"}
			</div>
		</div>
	);
}

function Row({
	expr,
	result,
	color = "#a78bfa",
	idx = 0,
}: {
	expr: string;
	result: string;
	color?: string;
	idx?: number;
}) {
	const c = color === "auto" ? ACCENT[idx % ACCENT.length] : color;
	return (
		<div
			style={{
				background: "#0a0f1e",
				borderLeft: `3px solid ${c}`,
				borderRadius: "0 8px 8px 0",
				padding: "0.6rem 0.9rem",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				gap: "1rem",
			}}
		>
			<code
				style={{
					color: "#64748b",
					fontSize: "0.68rem",
					fontFamily: "monospace",
					flexShrink: 0,
					maxWidth: "55%",
					wordBreak: "break-all",
				}}
			>
				{expr}
			</code>
			<span
				style={{
					color: c,
					fontSize: "0.8rem",
					fontFamily: "monospace",
					fontWeight: 700,
					textAlign: "right",
				}}
			>
				{result}
			</span>
		</div>
	);
}

// ─── Converters Demo ──────────────────────────────────────────────────────────

function ConvertersDemo() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	const legacyDate = new Date("2024-07-04T09:30:00-04:00");
	const epochMs = 1_700_000_000_000;
	const zdt = toTemporal(legacyDate, "America/New_York");
	const zdtFromMs = toTemporal(epochMs, "Asia/Tokyo");
	const instant = Temporal.Instant.fromEpochMilliseconds(epochMs);
	const zdtFromInstant = toTemporal(instant, "Europe/London");
	const plainDate = Temporal.PlainDate.from("2025-12-25");
	const plainTime = Temporal.PlainTime.from("14:30:00");
	const backToDate = fromTemporal(zdt);
	const epochFromZdt = toEpochMs(zdt);

	const rows = [
		{
			expr: "toTemporal(new Date('2024-07-04T09:30:00-04:00'), 'America/New_York')",
			result: zdt.toString().replace("T", " ").substring(0, 25),
			color: "#a78bfa",
		},
		{
			expr: "toTemporal(1_700_000_000_000, 'Asia/Tokyo')",
			result: zdtFromMs.toString().replace("T", " ").substring(0, 25),
			color: "#06b6d4",
		},
		{
			expr: "toTemporal(Temporal.Instant.from(...), 'Europe/London')",
			result: zdtFromInstant.toString().replace("T", " ").substring(0, 25),
			color: "#10b981",
		},
		{
			expr: "toTemporal(Temporal.PlainDate.from('2025-12-25'))  // pass-through",
			result: plainDate.toString(),
			color: "#f59e0b",
		},
		{
			expr: "toTemporal(Temporal.PlainTime.from('14:30:00'))  // pass-through",
			result: plainTime.toString(),
			color: "#ec4899",
		},
		{
			expr: "fromTemporal(zdt)  // ZonedDateTime → Date",
			result: backToDate.toISOString(),
			color: "#fb923c",
		},
		{
			expr: "fromTemporal(instant)  // Instant → Date",
			result: fromTemporal(instant).toISOString(),
			color: "#34d399",
		},
		{
			expr: "toEpochMs(zdt)",
			result: String(epochFromZdt),
			color: "#60a5fa",
		},
		{
			expr: "toEpochMs(new Date('2024-01-01'))",
			result: String(toEpochMs(new Date("2024-01-01"))),
			color: "#f472b6",
		},
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
			{rows.map(({ expr, result, color }) => (
				<Row key={expr} expr={expr} result={result} color={color} />
			))}
		</div>
	);
}

// ─── Type Guard & extractFields ───────────────────────────────────────────────

function TypeGuardDemo() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	const zdt = Temporal.Now.zonedDateTimeISO("America/Chicago");
	const plain = Temporal.PlainDate.from("2025-06-15");
	const instant = Temporal.Now.instant();
	const legacyDate = new Date();
	const fields = extractFields(zdt);

	const guardRows = [
		{
			expr: "isTemporalType(Temporal.Now.zonedDateTimeISO())",
			result: String(isTemporalType(zdt)),
			color: "#10b981",
		},
		{
			expr: "isTemporalType(Temporal.PlainDate.from('2025-06-15'))",
			result: String(isTemporalType(plain)),
			color: "#10b981",
		},
		{
			expr: "isTemporalType(Temporal.Now.instant())",
			result: String(isTemporalType(instant)),
			color: "#10b981",
		},
		{
			expr: "isTemporalType(new Date())",
			result: String(isTemporalType(legacyDate)),
			color: "#ef4444",
		},
		{
			expr: "isTemporalType(42)",
			result: String(isTemporalType(42)),
			color: "#ef4444",
		},
		{
			expr: 'isTemporalType("2025-01-01")',
			result: String(isTemporalType("2025-01-01")),
			color: "#ef4444",
		},
	];

	const fieldRows = [
		{ l: "year", v: String(fields.year), c: "#a78bfa" },
		{ l: "month", v: String(fields.month), c: "#06b6d4" },
		{ l: "day", v: String(fields.day), c: "#10b981" },
		{ l: "hour", v: String(fields.hour), c: "#f59e0b" },
		{ l: "minute", v: String(fields.minute), c: "#ec4899" },
		{ l: "second", v: String(fields.second), c: "#fb923c" },
		{ l: "millisecond", v: String(fields.millisecond), c: "#34d399" },
		{ l: "dayOfWeek (1=Mon)", v: String(fields.dayOfWeek), c: "#60a5fa" },
		{ l: "timezone", v: fields.timezone ?? "—", c: "#f472b6" },
	];

	return (
		<div
			style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
		>
			<div>
				<h3
					style={{
						color: "#a78bfa",
						marginBottom: "0.75rem",
						fontSize: "0.95rem",
						fontWeight: 700,
					}}
				>
					isTemporalType()
				</h3>
				<div
					style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
				>
					{guardRows.map(({ expr, result, color }) => (
						<Row key={expr} expr={expr} result={result} color={color} />
					))}
				</div>
			</div>
			<div>
				<h3
					style={{
						color: "#06b6d4",
						marginBottom: "0.75rem",
						fontSize: "0.95rem",
						fontWeight: 700,
					}}
				>
					extractFields(zonedDateTime)
				</h3>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "0.5rem",
					}}
				>
					{fieldRows.map(({ l, v, c }) => (
						<Chip key={l} label={l} value={v} color={c} />
					))}
				</div>
				<p
					style={{
						color: "#334155",
						fontSize: "0.7rem",
						marginTop: "0.75rem",
					}}
				>
					extractFields works on Date, number, ZonedDateTime, PlainDate,
					PlainDateTime, Instant, and registered adapters.
				</p>
			</div>
		</div>
	);
}

// ─── Compat Layer ─────────────────────────────────────────────────────────────

function CompatDemo() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	const ref = new Date("2025-06-15T14:30:00Z");
	const zdt = toTemporal(ref, "America/New_York");
	const plain = Temporal.PlainDate.from("2025-06-15");
	const past = new Date("2025-01-01T00:00:00Z");
	const future = new Date("2025-12-31T23:59:59Z");

	const rows = [
		// format
		{
			expr: "format(new Date('2025-06-15T14:30Z'), 'yyyy-MM-dd')",
			result: format(ref, "yyyy-MM-dd"),
			color: "#a78bfa",
		},
		{
			expr: "format(new Date(), 'EEEE, MMMM d yyyy')",
			result: format(new Date(), "EEEE, MMMM d yyyy"),
			color: "#a78bfa",
		},
		{
			expr: "format(zdt, 'HH:mm:ss')",
			result: format(zdt, "HH:mm:ss"),
			color: "#a78bfa",
		},
		// addDays / addMonths
		{
			expr: "addDays(plain, 10).toString()",
			result: addDays(plain, 10).toString(),
			color: "#06b6d4",
		},
		{
			expr: "addMonths(zdt, 3).toPlainDate().toString()",
			result: (addMonths(zdt, 3) as Temporal.ZonedDateTime)
				.toPlainDate()
				.toString(),
			color: "#06b6d4",
		},
		{
			expr: "subDays(plain, 7).toString()",
			result: subDays(plain, 7).toString(),
			color: "#10b981",
		},
		// comparisons
		{
			expr: "isBefore(past, future)",
			result: String(isBefore(past, future)),
			color: "#10b981",
		},
		{
			expr: "isAfter(future, past)",
			result: String(isAfter(future, past)),
			color: "#10b981",
		},
		{
			expr: "isSameDay(ref, new Date('2025-06-15T23:59Z'))",
			result: String(isSameDay(ref, new Date("2025-06-15T23:59Z"))),
			color: "#f59e0b",
		},
		// boundaries
		{
			expr: "startOfDay(zdt).toString().slice(0,19)",
			result: startOfDay(zdt).toString().slice(0, 19),
			color: "#ec4899",
		},
		{
			expr: "endOfDay(zdt).toString().slice(0,19)",
			result: endOfDay(zdt).toString().slice(0, 19),
			color: "#ec4899",
		},
		{
			expr: "startOfMonth(plain).toString()",
			result: startOfMonth(plain).toString(),
			color: "#fb923c",
		},
		{
			expr: "endOfMonth(plain).toString()",
			result: endOfMonth(plain).toString(),
			color: "#fb923c",
		},
		// parseISO
		{
			expr: "parseISO('2025-06-15').toString()",
			result: parseISO("2025-06-15").toString(),
			color: "#34d399",
		},
		{
			expr: "parseISO('2025-06-15T14:30').toString()",
			result: parseISO("2025-06-15T14:30").toString(),
			color: "#34d399",
		},
		// isValid
		{
			expr: "isValid(new Date('2025-01-01'))",
			result: String(isValid(new Date("2025-01-01"))),
			color: "#60a5fa",
		},
		{
			expr: "isValid(new Date('not-a-date'))",
			result: String(isValid(new Date("not-a-date"))),
			color: "#ef4444",
		},
		{
			expr: "isValid(Temporal.PlainDate.from('2025-06-15'))",
			result: String(isValid(Temporal.PlainDate.from("2025-06-15"))),
			color: "#60a5fa",
		},
		// differences
		{
			expr: "differenceInDays(past, future)",
			result: String(differenceInDays(past, future)),
			color: "#f472b6",
		},
		{
			expr: "differenceInMonths(past, future)",
			result: String(differenceInMonths(past, future)),
			color: "#f472b6",
		},
	];

	return (
		<div>
			<CodeBlock
				code={`import {
  format, addDays, addMonths, subDays,
  isAfter, isBefore, isSameDay,
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  parseISO, isValid, differenceInDays, differenceInMonths
} from '@yedoma-labs/keler-temporal/compat';

// All functions accept Date, number, or Temporal types
format(new Date(), 'yyyy-MM-dd')       // "2025-06-15"
format(Temporal.PlainDate.from(...), 'MMMM d') // "June 15"
addDays(Temporal.PlainDate.from('2025-06-15'), 10)  // → PlainDate
addMonths(Temporal.ZonedDateTime.from(...), 3)       // → ZonedDateTime`}
			/>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "0.4rem",
					marginTop: "1.25rem",
				}}
			>
				{rows.map(({ expr, result, color }) => (
					<Row key={expr} expr={expr} result={result} color={color} />
				))}
			</div>
		</div>
	);
}

// ─── Adapter Registry ─────────────────────────────────────────────────────────

interface MyDate {
	__myDate: true;
	timestamp: number;
	zone: string;
}

function AdapterRegistryDemo() {
	const [registered, setRegistered] = useState<string[]>([]);
	const [customResult, setCustomResult] = useState<string>("");
	const [customMs, setCustomMs] = useState<string>("");

	useEffect(() => {
		registerAdapter({
			name: "MyDate",
			detect: (v: unknown): v is MyDate =>
				typeof v === "object" && v !== null && "__myDate" in v,
			toEpochMs: (v: MyDate) => v.timestamp,
			getTimezone: (v: MyDate) => v.zone,
		});

		setRegistered(listAdapters() as string[]);

		const myDate: MyDate = {
			__myDate: true,
			timestamp: 1_717_200_000_000,
			zone: "Europe/Berlin",
		};

		const zdt = toTemporal(myDate, "Europe/Berlin") as Temporal.ZonedDateTime;
		setCustomResult(zdt.toPlainDate().toString());
		setCustomMs(String(toEpochMs(myDate)));
	}, []);

	return (
		<div>
			<CodeBlock
				code={`import { registerAdapter, listAdapters, toTemporal } from '@yedoma-labs/keler-temporal';

// Register your custom date type
registerAdapter({
  name: 'MyDate',
  detect: (v) => typeof v === 'object' && v !== null && '__myDate' in v,
  toEpochMs: (v) => v.timestamp,
  getTimezone: (v) => v.zone,          // optional — avoids timezone param
});

// Now toTemporal, toEpochMs, extractFields all understand MyDate
const zdt = toTemporal(myDate);       // uses timezone from adapter
const ms  = toEpochMs(myDate);        // 1717200000000
listAdapters();                        // ['MyDate']`}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
					gap: "0.75rem",
					marginTop: "1.25rem",
				}}
			>
				<Chip
					label="listAdapters()"
					value={registered.length ? registered.join(", ") : "[]"}
					color="#a78bfa"
				/>
				<Chip
					label="toTemporal(myDate).toPlainDate()"
					value={customResult || "—"}
					color="#06b6d4"
				/>
				<Chip
					label="toEpochMs(myDate)"
					value={customMs || "—"}
					color="#10b981"
				/>
				<Chip
					label="isTemporalType(myDate)"
					value="false — adapters aren't Temporal"
					color="#f59e0b"
				/>
			</div>

			<div
				style={{
					marginTop: "1.25rem",
					padding: "1rem 1.25rem",
					background: "rgba(99,102,241,0.06)",
					borderRadius: "10px",
					border: "1px solid rgba(99,102,241,0.2)",
				}}
			>
				<p
					style={{
						color: "#64748b",
						fontSize: "0.82rem",
						lineHeight: 1.65,
						margin: 0,
					}}
				>
					Built-in adapters for{" "}
					<code style={{ color: "#a78bfa" }}>moment.js</code>,{" "}
					<code style={{ color: "#06b6d4" }}>Luxon</code>, and{" "}
					<code style={{ color: "#10b981" }}>Day.js</code> are available as
					separate entry points:{" "}
					<code style={{ color: "#e2e8f0", fontSize: "0.75rem" }}>
						@yedoma-labs/keler-temporal/adapters/moment
					</code>
				</p>
			</div>
		</div>
	);
}

// ─── Migration Warnings ───────────────────────────────────────────────────────

function MigrationWarningsDemo() {
	const [logs, setLogs] = useState<string[]>([]);

	const runDemo = () => {
		const captured: string[] = [];
		const orig = console.warn;
		console.warn = (...args: unknown[]) => captured.push(String(args[0]));

		try {
			// enableMigrationWarnings is prod-guarded — simulate here
			const ref = new Date("2025-06-15T10:00:00Z");
			format(ref, "yyyy-MM-dd");
			addDays(ref, 5);
			isBefore(ref, new Date());
		} finally {
			console.warn = orig;
		}

		if (captured.length === 0) {
			setLogs([
				"[keler] format() (date-fns) called with legacy Date. Hint: zdt.toLocaleString()",
				"[keler] addDays() (date-fns) called with legacy Date. Hint: date.add({ days: n })",
				"[keler] isBefore() (date-fns) called with legacy Date. Hint: Temporal.ZonedDateTime.compare(a, b) < 0",
			]);
		} else {
			setLogs(captured);
		}
	};

	return (
		<div>
			<CodeBlock
				code={`import { enableMigrationWarnings } from '@yedoma-labs/keler-temporal';

// Enable once at app startup (dev only — throws in production)
enableMigrationWarnings({ level: 'warn', stack: false });

// Now every compat function called with a legacy Date emits a warning:
// [keler] format() (date-fns) called with legacy Date. Hint: zdt.toLocaleString()
// [keler] addDays() (date-fns) called with legacy Date. Hint: date.add({ days: n })

// Silence specific functions during gradual migration
enableMigrationWarnings({ ignore: ['format', 'addDays'] });

// Escalate to errors to block CI merges
enableMigrationWarnings({ level: 'error' });`}
			/>

			<div style={{ marginTop: "1.25rem" }}>
				<button
					type="button"
					onClick={runDemo}
					style={{
						padding: "0.55rem 1.25rem",
						background: "linear-gradient(135deg, #a78bfa, #6366f1)",
						border: "none",
						borderRadius: "8px",
						color: "white",
						fontSize: "0.82rem",
						fontWeight: 700,
						cursor: "pointer",
						marginBottom: "0.75rem",
					}}
				>
					Simulate warnings
				</button>

				{logs.length > 0 && (
					<div
						style={{
							background: "#0a0f1e",
							border: "1px solid rgba(245,158,11,0.3)",
							borderRadius: "10px",
							padding: "1rem",
							display: "flex",
							flexDirection: "column",
							gap: "0.5rem",
						}}
					>
						{logs.map((log) => (
							<div
								key={log}
								style={{
									display: "flex",
									gap: "0.6rem",
									alignItems: "flex-start",
								}}
							>
								<span style={{ color: "#f59e0b", flexShrink: 0 }}>⚠</span>
								<code
									style={{
										color: "#fbbf24",
										fontSize: "0.75rem",
										fontFamily: "monospace",
										lineHeight: 1.55,
									}}
								>
									{log}
								</code>
							</div>
						))}
					</div>
				)}
			</div>

			<div
				style={{
					marginTop: "1.25rem",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
					gap: "0.75rem",
				}}
			>
				{[
					{
						label: "level: 'warn'",
						desc: "console.warn per call (default)",
						color: "#f59e0b",
					},
					{
						label: "level: 'error'",
						desc: "throws Error — blocks CI",
						color: "#ef4444",
					},
					{
						label: "level: 'silent'",
						desc: "tracks internally, no output",
						color: "#64748b",
					},
					{
						label: "ignore: ['fn']",
						desc: "suppress specific functions",
						color: "#06b6d4",
					},
					{
						label: "stack: true",
						desc: "appends call site to warning",
						color: "#a78bfa",
					},
					{
						label: "production guard",
						desc: "throws if called in prod",
						color: "#10b981",
					},
				].map(({ label, desc, color }) => (
					<div
						key={label}
						style={{
							background: "#0a0f1e",
							border: `1px solid ${color}25`,
							borderRadius: "8px",
							padding: "0.7rem 0.9rem",
						}}
					>
						<code
							style={{
								color,
								fontSize: "0.72rem",
								fontFamily: "monospace",
								fontWeight: 700,
								display: "block",
								marginBottom: "0.3rem",
							}}
						>
							{label}
						</code>
						<span style={{ color: "#475569", fontSize: "0.72rem" }}>{desc}</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Migration Journey ────────────────────────────────────────────────────────

function MigrationJourney() {
	const steps = [
		{
			phase: "1. Install",
			code: `pnpm add @yedoma-labs/keler-temporal temporal-polyfill
# If not on Chrome 144+ / Node 24+, install the polyfill
import 'temporal-polyfill/shim';`,
			color: "#a78bfa",
		},
		{
			phase: "2. Enable warnings",
			code: `// app/startup.ts (dev only)
import { enableMigrationWarnings } from '@yedoma-labs/keler-temporal';
if (process.env.NODE_ENV !== 'production') {
  enableMigrationWarnings({ level: 'warn' });
}`,
			color: "#06b6d4",
		},
		{
			phase: "3. Convert legacy dates",
			code: `import { toTemporal, fromTemporal } from '@yedoma-labs/keler-temporal';

// At the boundary — convert once
const zdt = toTemporal(legacyDate, 'America/New_York');
// … business logic uses Temporal natively …
const out = fromTemporal(zdt);  // back to Date for libraries that need it`,
			color: "#10b981",
		},
		{
			phase: "4. Replace compat calls",
			code: `// Before (compat layer)
import { addDays } from '@yedoma-labs/keler-temporal/compat';
addDays(date, 7);

// After (native Temporal)
zdt.add({ days: 7 });
// ↑ No import needed. Remove compat import when fully migrated.`,
			color: "#f59e0b",
		},
		{
			phase: "5. Register adapters",
			code: `// Integrate third-party date types without refactoring their callers
import { momentAdapter } from '@yedoma-labs/keler-temporal/adapters/moment';
import { registerAdapter, toTemporal } from '@yedoma-labs/keler-temporal';
registerAdapter(momentAdapter);

const zdt = toTemporal(momentInstance, 'UTC');  // just works`,
			color: "#ec4899",
		},
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
			{steps.map(({ phase, code, color }, i) => (
				<div
					key={phase}
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "flex-start",
					}}
				>
					<div
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							background: `${color}22`,
							border: `2px solid ${color}`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color,
							fontSize: "0.8rem",
							fontWeight: 900,
							flexShrink: 0,
							fontFamily: "monospace",
						}}
					>
						{i + 1}
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							style={{
								color,
								fontWeight: 700,
								fontSize: "0.85rem",
								fontFamily: "monospace",
								marginBottom: "0.5rem",
							}}
						>
							{phase}
						</div>
						<CodeBlock code={code} />
					</div>
				</div>
			))}
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
	{
		id: "converters",
		emoji: "🔄",
		title: "Core Converters",
		subtitle:
			"toTemporal / fromTemporal / toEpochMs — coerce any date value to/from native Temporal types",
		gradient: "linear-gradient(135deg, #4c1d95, #7c3aed)",
		component: ConvertersDemo,
	},
	{
		id: "type-guard",
		emoji: "🛡️",
		title: "Type Guard & Field Extraction",
		subtitle:
			"isTemporalType() narrows unknown values — extractFields() gives a flat DateTimeFields bag from any supported type",
		gradient: "linear-gradient(135deg, #0e7490, #0891b2)",
		component: TypeGuardDemo,
	},
	{
		id: "compat",
		emoji: "🔁",
		title: "Compat Layer",
		subtitle:
			"Drop-in replacements for date-fns functions — accept both Date and Temporal types",
		gradient: "linear-gradient(135deg, #064e3b, #059669)",
		component: CompatDemo,
	},
	{
		id: "adapters",
		emoji: "🔌",
		title: "Adapter Registry",
		subtitle:
			"Register custom adapters so toTemporal / toEpochMs understand any third-party date type",
		gradient: "linear-gradient(135deg, #78350f, #d97706)",
		component: AdapterRegistryDemo,
	},
	{
		id: "warnings",
		emoji: "⚠️",
		title: "Migration Warnings",
		subtitle:
			"Opt-in runtime warnings when legacy Date objects pass through compat functions — track and eliminate them over time",
		gradient: "linear-gradient(135deg, #881337, #be123c)",
		component: MigrationWarningsDemo,
	},
	{
		id: "journey",
		emoji: "🗺️",
		title: "Migration Journey",
		subtitle:
			"Step-by-step path from legacy date libraries to native Temporal — one file at a time",
		gradient: "linear-gradient(135deg, #1e3a5f, #2563eb)",
		component: MigrationJourney,
	},
];

export default function KelerTemporalPage() {
	return (
		<>
			<style>{`
        html, body { background: #0f172a !important; }
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        @keyframes pulse-neon {
          0%,100% { box-shadow: 0 0 8px rgba(167,139,250,0.3), 0 0 24px rgba(167,139,250,0.1); }
          50%      { box-shadow: 0 0 16px rgba(167,139,250,0.6), 0 0 48px rgba(167,139,250,0.2); }
        }
      `}</style>

			<main
				style={{
					maxWidth: "1040px",
					margin: "0 auto",
					padding: "3rem 2rem",
					minHeight: "100vh",
				}}
			>
				{/* ── Nav ── */}
				<Link
					href="/"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "0.4rem",
						color: "#64748b",
						fontSize: "0.82rem",
						fontFamily: "monospace",
						marginBottom: "2rem",
					}}
				>
					← back to demos
				</Link>

				{/* ── Hero ── */}
				<div
					style={{
						background:
							"linear-gradient(135deg, #0f0c29 0%, #1e1040 40%, #0c1830 100%)",
						borderRadius: "24px",
						padding: "3rem 2.5rem",
						marginBottom: "3rem",
						border: "1px solid rgba(167,139,250,0.25)",
						animation: "pulse-neon 4s ease-in-out infinite",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							position: "absolute",
							top: "-60px",
							right: "-40px",
							width: "280px",
							height: "280px",
							background:
								"radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
							borderRadius: "50%",
							pointerEvents: "none",
						}}
					/>

					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "0.5rem",
							background: "rgba(167,139,250,0.12)",
							border: "1px solid rgba(167,139,250,0.3)",
							borderRadius: "2rem",
							padding: "0.3rem 0.9rem",
							marginBottom: "1.25rem",
						}}
					>
						<span style={{ color: "#a78bfa", fontSize: "0.72rem", fontFamily: "monospace", fontWeight: 700 }}>
							@yedoma-labs/keler-temporal
						</span>
						<span
							style={{
								background: "rgba(167,139,250,0.2)",
								color: "#c4b5fd",
								fontSize: "0.65rem",
								fontFamily: "monospace",
								padding: "0.1rem 0.4rem",
								borderRadius: "3px",
								fontWeight: 800,
							}}
						>
							v{KELER_VERSION}
						</span>
					</div>

					<h1
						style={{
							fontSize: "2.5rem",
							fontWeight: 900,
							color: "white",
							margin: "0 0 0.5rem",
							letterSpacing: "-0.02em",
						}}
					>
						кэлэр
					</h1>
					<p
						style={{
							color: "#a78bfa",
							fontStyle: "italic",
							fontSize: "1rem",
							marginBottom: "1rem",
						}}
					>
						coming · future — Sakha/Yakut
					</p>
					<p
						style={{
							color: "#94a3b8",
							fontSize: "0.95rem",
							lineHeight: 1.7,
							maxWidth: "640px",
							marginBottom: "1.5rem",
						}}
					>
						Bridge library for gradual migration from legacy date libraries (date-fns,
						moment.js, Luxon, Day.js) to the TC39 Temporal API. Converters,
						drop-in compat functions, migration warnings, and a custom adapter
						system — so you can adopt Temporal one file at a time.
					</p>

					<div
						style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
					>
						{[
							"toTemporal / fromTemporal",
							"compat layer",
							"adapter registry",
							"migration warnings",
							"testing utilities",
							"TC39 Temporal",
						].map((tag) => (
							<span
								key={tag}
								style={{
									background: "rgba(167,139,250,0.1)",
									border: "1px solid rgba(167,139,250,0.2)",
									color: "#c4b5fd",
									padding: "0.2rem 0.65rem",
									borderRadius: "1rem",
									fontSize: "0.72rem",
									fontFamily: "monospace",
									fontWeight: 600,
								}}
							>
								{tag}
							</span>
						))}
					</div>
				</div>

				{/* ── Sections ── */}
				<div
					style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}
				>
					{SECTIONS.map(({ id, emoji, title, subtitle, gradient, component: Component }) => (
						<section
							key={id}
							style={{
								background: "rgba(15,23,42,0.6)",
								borderRadius: "20px",
								padding: "2rem",
								border: "1px solid #1e293b",
							}}
						>
							<SectionHeader
								emoji={emoji}
								title={title}
								subtitle={subtitle}
								gradient={gradient}
							/>
							<Component />
						</section>
					))}
				</div>

				{/* ── Footer ── */}
				<div
					style={{
						marginTop: "3rem",
						paddingTop: "2rem",
						borderTop: "1px solid #1e293b",
						display: "flex",
						gap: "0.75rem",
						flexWrap: "wrap",
					}}
				>
					{[
						{
							label: "npm",
							href: "https://www.npmjs.com/package/@yedoma-labs/keler-temporal",
							color: "#ef4444",
						},
						{
							label: "GitHub",
							href: "https://github.com/yedoma-labs/keler-temporal",
							color: "#a78bfa",
						},
						{
							label: "TC39 Temporal",
							href: "https://tc39.es/proposal-temporal/",
							color: "#06b6d4",
						},
					].map(({ label, href, color }) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								padding: "0.35rem 0.85rem",
								borderRadius: "7px",
								background: `${color}12`,
								border: `1px solid ${color}28`,
								color,
								fontSize: "0.78rem",
								fontFamily: "monospace",
								fontWeight: 700,
							}}
						>
							{label} ↗
						</a>
					))}
				</div>
			</main>
		</>
	);
}
