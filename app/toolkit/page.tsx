import { createHmac } from "node:crypto";
import { PaginationError, paginate } from "@yedoma-labs/ilyn-pages";
import { createKeyedQueue } from "@yedoma-labs/kelyk-queue";
import { checkFlagHygiene, defineFlags } from "@yedoma-labs/kulyn-flags";
import { createSafeFetch, SafeFetchError } from "@yedoma-labs/tanur-ssrf";
import { createShutdown } from "@yedoma-labs/tiduu-shutdown";
import {
	verifyWebhook,
	WebhookSignatureError,
} from "@yedoma-labs/tuyar-webhook";
import {
	createIdempotency,
	createMemoryStore,
} from "@yedoma-labs/yaarys-idempotency";
import { fromError } from "@yedoma-labs/ysuly-problem";
import { inspectUpload } from "@yedoma-labs/ysyk-upload-guard";
import {
	importRows,
	int,
	string,
	toErrorReportCsv,
} from "@yedoma-labs/ysyr-import";
import { createWebhookSender } from "@yedoma-labs/yuryk-outbox";
import Link from "next/link";
import pkg from "../../package.json";

export const dynamic = "force-dynamic";

const deps = pkg.dependencies as Record<string, string>;
const v = (name: string) => deps[`@yedoma-labs/${name}`] ?? "?";

const json = (x: unknown) => JSON.stringify(x);
const errInfo = (e: unknown) =>
	e instanceof Error
		? `${(e as { code?: string }).code ?? e.name}: ${e.message}`
		: String(e);

type Lib = {
	name: string;
	color: string;
	problem: string;
	snippet: string;
	run: () => Promise<string[]>;
};

const LIBS: Lib[] = [
	{
		name: "tuyar-webhook",
		color: "#f59e0b",
		problem:
			"Webhook-Signaturen werden gegen den rohen Body geprüft, nicht gegen geparstes JSON.",
		snippet: `verifyWebhook({
  scheme: "standard-webhooks",
  body, headers, secret: "whsec_..."
});`,
		run: async () => {
			const keyBytes = Buffer.from("demo-secret-key-32-bytes-long!!!");
			const secret = `whsec_${keyBytes.toString("base64")}`;
			const id = "msg_demo_1";
			const ts = 1_700_000_000;
			const body = '{"event":"invoice.paid","amount":4200}';
			const sig = createHmac("sha256", keyBytes)
				.update(`${id}.${ts}.${body}`)
				.digest("base64");
			const headers = {
				"webhook-id": id,
				"webhook-timestamp": String(ts),
				"webhook-signature": `v1,${sig}`,
			};
			const now = () => ts * 1000;
			const ok = verifyWebhook({
				scheme: "standard-webhooks",
				body,
				headers,
				secret,
				now,
			});
			const lines = [`gültig: ok=${ok.ok}, timestamp=${ok.timestamp}`];
			try {
				verifyWebhook({
					scheme: "standard-webhooks",
					body: body.replace("4200", "9999"),
					headers,
					secret,
					now,
				});
				lines.push("manipuliert: UNERWARTET akzeptiert");
			} catch (e) {
				if (!(e instanceof WebhookSignatureError)) throw e;
				lines.push(`manipulierter Body: abgelehnt mit ${e.code}`);
			}
			return lines;
		},
	},
	{
		name: "ysyk-upload-guard",
		color: "#ef4444",
		problem:
			"Uploads werden anhand der Magic Bytes geprüft, nicht anhand von Dateiname oder MIME des Clients.",
		snippet: `inspectUpload({
  data, declaredName, declaredMimeType,
  allow: ["image/png"]
});`,
		run: async () => {
			const png = new Uint8Array([
				0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d,
			]);
			const a = inspectUpload({
				data: png,
				declaredName: "../../etc/foto.exe",
				declaredMimeType: "application/pdf",
				allow: ["image/png"],
			});
			const html = new TextEncoder().encode(
				"<html><script>alert(1)</script></html>",
			);
			const b = inspectUpload({
				data: html,
				declaredName: "avatar.png",
				declaredMimeType: "image/png",
				allow: ["image/png"],
			});
			return [
				`PNG-Bytes, Name "../../etc/foto.exe", MIME pdf: ${json(a)}`,
				`HTML als avatar.png getarnt: ${json(b)}`,
			];
		},
	},
	{
		name: "yaarys-idempotency",
		color: "#10b981",
		problem:
			"Wiederholte Requests mit gleichem Key führen die Aktion nicht doppelt aus.",
		snippet: `const idem = createIdempotency({ store: createMemoryStore() });
await idem.execute({ key, fingerprint, handler });`,
		run: async () => {
			const idem = createIdempotency({
				store: createMemoryStore({ now: () => 0 }),
				now: () => 0,
			});
			let calls = 0;
			const handler = async () => {
				calls++;
				return { status: 201, body: '{"charged":true}' };
			};
			const r1 = await idem.execute({
				key: "order-123",
				fingerprint: "fp-A",
				handler,
			});
			const r2 = await idem.execute({
				key: "order-123",
				fingerprint: "fp-A",
				handler,
			});
			const lines = [
				`1. Aufruf: ${r1.status}`,
				`2. Aufruf: ${r2.status} (Handler-Aufrufe gesamt: ${calls})`,
			];
			try {
				await idem.execute({ key: "order-123", fingerprint: "fp-B", handler });
			} catch (e) {
				lines.push(`anderer Fingerprint: ${errInfo(e)}`);
			}
			return lines;
		},
	},
	{
		name: "kulyn-flags",
		color: "#8b5cf6",
		problem:
			"Feature-Flags brauchen Owner und Ablaufdatum, damit sie nicht ewig im Code bleiben.",
		snippet: `const flags = defineFlags([...]);
checkFlagHygiene({ flags, now });`,
		run: async () => {
			const flags = defineFlags([
				{
					key: "checkout.new-ui",
					owner: "team-pay",
					kind: "release",
					createdAt: "2026-01-01",
					expiresAt: "2026-03-01",
				},
				{
					key: "search.boost",
					owner: "team-search",
					kind: "experiment",
					createdAt: "2026-09-20",
					expiresAt: "2026-10-15",
				},
			]);
			const findings = checkFlagHygiene({
				flags,
				now: new Date("2026-10-01T00:00:00Z"),
			});
			return [
				`${flags.length} Flags registriert, now = 2026-10-01`,
				...findings.map((f) => `${f.code} ${f.key}: ${f.message}`),
			];
		},
	},
	{
		name: "tiduu-shutdown",
		color: "#06b6d4",
		problem:
			"Geordnetes Herunterfahren: Ressourcen werden in umgekehrter Reihenfolge geschlossen.",
		snippet: `const sd = createShutdown({ exit });
sd.register("db", closeDb);
await sd.run("demo");`,
		run: async () => {
			const exits: number[] = [];
			const sd = createShutdown({
				exit: (c) => void exits.push(c),
				log: () => {},
			});
			sd.register("http-server", () => {});
			sd.register("queue", async () => {});
			sd.register("database", () => {});
			const report = await sd.run("demo");
			return [
				`Reihenfolge (LIFO): ${report.steps.map((s) => `${s.name}:${s.status}`).join(" -> ")}`,
				`forced=${report.forced}, exit-Aufrufe (injiziert): ${json(exits)}`,
			];
		},
	},
	{
		name: "tanur-ssrf",
		color: "#f43f5e",
		problem:
			"Server-seitige Requests dürfen nicht auf interne oder private Adressen zeigen.",
		snippet: `const safeFetch = createSafeFetch({ resolver });
await safeFetch("https://example.com/hook");`,
		run: async () => {
			const safeFetch = createSafeFetch({
				resolver: async () => [{ address: "10.0.0.5", family: 4 }],
			});
			try {
				await safeFetch("https://example.com/hook");
				return ["UNERWARTET: Request erlaubt"];
			} catch (e) {
				if (!(e instanceof SafeFetchError)) throw e;
				return [`Resolver liefert 10.0.0.5 -> ${e.code}`, e.message];
			}
		},
	},
	{
		name: "ysyr-import",
		color: "#eab308",
		problem:
			"CSV-Import mit Teilerfolg: gute Zeilen werden übernommen, kaputte sauber berichtet.",
		snippet: `importRows({ text, columns: {
  name: string({ required: true }),
  age: int({ required: true })
}});`,
		run: async () => {
			const text = "name,age\nAda,36\nBob,abc\nCleo,29\n";
			const res = importRows({
				text,
				columns: {
					name: string({ required: true }),
					age: int({ required: true }),
				},
			});
			return [
				`Summary: ${json(res.summary)}`,
				`Akzeptiert: ${json(res.accepted)}`,
				`Fehlerbericht (CSV):\n${toErrorReportCsv(res.rejected).trim()}`,
			];
		},
	},
	{
		name: "yuryk-outbox",
		color: "#3b82f6",
		problem:
			"Webhook-Retries behalten dieselbe webhook-id, damit Empfänger deduplizieren können.",
		snippet: `createWebhookSender({ secret, fetch, sleep, random })
  .send(url, { type, data });`,
		run: async () => {
			const seen: string[] = [];
			let n = 0;
			const fakeFetch = (async (_u: unknown, init?: RequestInit) => {
				const h = new Headers(init?.headers);
				seen.push(h.get("webhook-id") ?? "?");
				return new Response(null, { status: ++n === 1 ? 503 : 200 });
			}) as typeof fetch;
			const sender = createWebhookSender({
				secret: `whsec_${Buffer.from("outbox-demo-secret-key").toString("base64")}`,
				fetch: fakeFetch,
				sleep: async () => {},
				random: () => 0.5,
				now: () => 1_700_000_000_000,
			});
			const r = await sender.send("https://hooks.example.com/in", {
				id: "evt_demo_1",
				type: "order.created",
				data: { id: 1 },
			});
			return [
				`Ergebnis: ${json(r)}`,
				`webhook-id je Versuch: ${seen.join(" | ")}`,
				`identisch: ${seen.length > 1 && seen.every((s) => s === seen[0])}`,
			];
		},
	},
	{
		name: "kelyk-queue",
		color: "#14b8a6",
		problem:
			"Aufgaben pro Schlüssel laufen strikt nacheinander, verschiedene Schlüssel parallel.",
		snippet: `const q = createKeyedQueue();
q.run("user-1", async () => {...});`,
		run: async () => {
			const q = createKeyedQueue();
			const log: string[] = [];
			const task = (k: string, i: number, ms: number) =>
				q.run(k, async () => {
					log.push(`${k}:${i}:start`);
					await new Promise((r) => setTimeout(r, ms));
					log.push(`${k}:${i}:end`);
				});
			await Promise.all([
				task("A", 1, 15),
				task("A", 2, 1),
				task("A", 3, 1),
				task("B", 1, 5),
				task("B", 2, 1),
			]);
			const per = (k: string) =>
				log
					.filter((l) => l.startsWith(`${k}:`))
					.map((l) => l.slice(2))
					.join(" ");
			return [`Schlüssel A: ${per("A")}`, `Schlüssel B: ${per("B")}`];
		},
	},
	{
		name: "ysuly-problem",
		color: "#ec4899",
		problem:
			"Fehler werden zu RFC-9457-Problem-Details, ohne interne Messages preiszugeben.",
		snippet: `const p = fromError(err);
// -> { title, status } ohne message`,
		run: async () => {
			const err = new Error(
				"DB connect failed: postgres://admin:SuperSecret123@10.0.0.9/db",
			);
			const p = fromError(err);
			const text = json(p);
			return [
				text,
				`enthält "SuperSecret123": ${text.includes("SuperSecret123")}`,
			];
		},
	},
	{
		name: "ilyn-pages",
		color: "#a3e635",
		problem: "Cursor-Paginierung mit Schutz gegen Endlosschleifen.",
		snippet: `for await (const item of paginate({ fetchPage })) {...}`,
		run: async () => {
			const pages = [
				{ items: [1, 2], nextCursor: "c1" },
				{ items: [3, 4], nextCursor: "c2" },
				{ items: [5], nextCursor: null },
			];
			const got: number[] = [];
			const cursors: (string | undefined)[] = [];
			for await (const item of paginate<number>({
				fetchPage: async (cursor) => {
					cursors.push(cursor);
					return pages[cursors.length - 1];
				},
			})) {
				got.push(item);
			}
			const lines = [`3 Seiten -> Items ${json(got)}`];
			try {
				for await (const _ of paginate<number>({
					fetchPage: async () => ({ items: [0], nextCursor: "same" }),
				})) {
					// consume
				}
			} catch (e) {
				if (!(e instanceof PaginationError)) throw e;
				lines.push(`Cursor-Schleife: ${e.code} auf Seite ${e.page}`);
			}
			return lines;
		},
	},
];

async function safely(fn: () => Promise<string[]>) {
	try {
		return { lines: await fn(), error: undefined };
	} catch (e) {
		return { lines: [] as string[], error: errInfo(e) };
	}
}

const mono = "'Fira Code','Cascadia Code','Consolas',monospace";

export default async function ToolkitPage() {
	const results = await Promise.all(LIBS.map((l) => safely(l.run)));
	return (
		<main
			style={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #020817, #0f172a)",
				color: "#e2e8f0",
				fontFamily: mono,
				padding: "2rem 1rem",
			}}
		>
			<div style={{ maxWidth: 1200, margin: "0 auto" }}>
				<Link
					href="/"
					style={{
						color: "#64748b",
						fontSize: "0.85rem",
						textDecoration: "none",
					}}
				>
					← Zurück
				</Link>
				<h1
					style={{
						color: "white",
						fontSize: "1.8rem",
						fontWeight: 800,
						margin: "1rem 0 0.5rem",
					}}
				>
					Toolkit
				</h1>
				<p
					style={{
						color: "#64748b",
						fontSize: "0.85rem",
						marginBottom: "2rem",
					}}
				>
					Elf @yedoma-labs-Pakete. Alle Ergebnisse werden beim Rendern
					serverseitig mit der echten Bibliothek berechnet (deterministisch,
					ohne Netzwerk).
				</p>
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
						gap: "1.25rem",
					}}
				>
					{LIBS.map((lib, i) => {
						const r = results[i];
						return (
							<section
								key={lib.name}
								style={{
									background: "#0b1220",
									border: `1px solid ${lib.color}55`,
									borderRadius: 12,
									padding: "1.25rem",
									minWidth: 0,
								}}
							>
								<div
									style={{
										display: "flex",
										flexWrap: "wrap",
										gap: "0.5rem",
										alignItems: "baseline",
									}}
								>
									<h2
										style={{
											color: lib.color,
											fontSize: "1.05rem",
											fontWeight: 800,
											margin: 0,
										}}
									>
										{lib.name}
									</h2>
									<span style={{ color: "#64748b", fontSize: "0.75rem" }}>
										v{v(lib.name)}
									</span>
								</div>
								<p
									style={{
										color: "#94a3b8",
										fontSize: "0.8rem",
										lineHeight: 1.6,
									}}
								>
									{lib.problem}
								</p>
								<pre
									style={{
										background: "#020817",
										border: "1px solid #1e293b",
										borderRadius: 8,
										padding: "0.75rem",
										fontSize: "0.72rem",
										overflowX: "auto",
										margin: "0 0 0.75rem",
									}}
								>
									{lib.snippet}
								</pre>
								<div
									style={{
										color: lib.color,
										fontSize: "0.7rem",
										marginBottom: "0.35rem",
									}}
								>
									LIVE-ERGEBNIS
								</div>
								<pre
									style={{
										background: "#020817",
										border: `1px solid ${r.error ? "#ef4444" : "#1e293b"}`,
										borderRadius: 8,
										padding: "0.75rem",
										fontSize: "0.72rem",
										margin: 0,
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
										color: r.error ? "#fca5a5" : "#e2e8f0",
									}}
								>
									{r.error ? `Fehler: ${r.error}` : r.lines.join("\n")}
								</pre>
							</section>
						);
					})}
				</div>
			</div>
		</main>
	);
}
