import Link from 'next/link'
import CyberBg from './components/CyberBg'
import MatrixNeo from './components/MatrixNeo'

// ─── Pinned package versions (from lockfile) ──────────────────────────────────
const PKG = {
  'sir-forms':          '0.2.0',
  'ichchi-state':       '0.1.0',
  'turar-config':       '0.3.0',
  'bylyt-env-guard':    '0.3.5',
  'suruk-logger':       '0.2.0',
  'suruy-form-actions': '0.1.0',
  'tuuru-chrono-tz':    '0.1.0',
} as const

const npm = (pkg: string) => `https://www.npmjs.com/package/@yedoma-labs/${pkg}`
const gh  = (pkg: string) => `https://github.com/yedoma-labs/${pkg}`

const DEMOS = [
  {
    href: '/sir-forms',
    icon: '⚡',
    title: 'sir-forms',
    tag: `v${PKG['sir-forms']}`,
    desc: 'Type-safe React forms — FormProvider, field hooks, server actions, React 19 compatible',
    gradient: 'linear-gradient(135deg, #0d0221, #1e0a3c, #0d1b4b)',
    accent: '#8b5cf6',
    border: 'rgba(139,92,246,0.3)',
    btnGrad: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    pkg: 'sir-forms',
  },
  {
    href: '/features',
    icon: '🚀',
    title: 'ichchi-state',
    tag: `v${PKG['ichchi-state']}`,
    desc: 'Computed values, time-travel debugging, optimistic updates, cross-tab sync',
    gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    accent: '#a78bfa',
    border: 'rgba(167,139,250,0.3)',
    btnGrad: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    pkg: 'ichchi-state',
  },
  {
    href: '/config',
    icon: '⚙️',
    title: 'turar-config',
    tag: `v${PKG['turar-config']}`,
    desc: 'Hot reload, YAML/TOML support, type-safe env validation with bylyt-env-guard',
    gradient: 'linear-gradient(135deg, #001a2d, #002040, #001a1a)',
    accent: '#06b6d4',
    border: 'rgba(6,182,212,0.3)',
    btnGrad: 'linear-gradient(135deg, #0284c7, #06b6d4)',
    pkg: 'turar-config',
  },
  {
    href: '/suruy',
    icon: '✍️',
    title: 'suruy-form-actions',
    tag: `v${PKG['suruy-form-actions']}`,
    desc: 'Server Actions with progressive enhancement — file uploads, Zod, zero-dep validator, ~3KB',
    gradient: 'linear-gradient(135deg, #1a0a00, #2d1400, #1a0a1a)',
    accent: '#fb923c',
    border: 'rgba(249,115,22,0.3)',
    btnGrad: 'linear-gradient(135deg, #f97316, #ef4444)',
    pkg: 'suruy-form-actions',
  },
  {
    href: '/comparison',
    icon: '⚖️',
    title: 'Library Comparison',
    tag: 'sir-forms vs suruy',
    desc: 'Feature comparison table and side-by-side code examples for both form libraries',
    gradient: 'linear-gradient(135deg, #1a0030, #2d0050, #1a1a00)',
    accent: '#e879f9',
    border: 'rgba(232,121,249,0.3)',
    btnGrad: 'linear-gradient(135deg, #a855f7, #ec4899)',
    pkg: null,
  },
  {
    href: '/hybrid',
    icon: '🔄',
    title: 'Hybrid Forms',
    tag: 'Best of both',
    desc: 'Combine suruy-form-actions server validation with sir-forms client state management',
    gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #1a0a1a)',
    accent: '#f5576c',
    border: 'rgba(245,87,108,0.3)',
    btnGrad: 'linear-gradient(135deg, #667eea, #f5576c)',
    pkg: null,
  },
  {
    href: '/logging',
    icon: '📝',
    title: 'suruk-logger',
    tag: `v${PKG['suruk-logger']}`,
    desc: 'Structured logging with Pino — 5-10× faster than Winston, child loggers, redaction',
    gradient: 'linear-gradient(135deg, #001a00, #002d00, #001a10)',
    accent: '#10b981',
    border: 'rgba(16,185,129,0.3)',
    btnGrad: 'linear-gradient(135deg, #059669, #10b981)',
    pkg: 'suruk-logger',
  },
  {
    href: '/chrono-tz',
    icon: '⏰',
    title: 'tuuru-chrono-tz',
    tag: `v${PKG['tuuru-chrono-tz']}`,
    desc: 'TypeScript-first date/time — 568 IANA zones, 34 locales, immutable API, zero deps, <20KB',
    gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    accent: '#6366f1',
    border: 'rgba(99,102,241,0.3)',
    btnGrad: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    pkg: 'tuuru-chrono-tz',
  },
]

const LIBRARIES = [
  { name: 'sir-forms',          version: PKG['sir-forms'],          desc: 'Type-safe server actions (React 19 compatible)',              color: '#8b5cf6' },
  { name: 'suruy-form-actions', version: PKG['suruy-form-actions'], desc: 'Progressive enhancement forms (~3KB, zero-dep validator)',    color: '#fb923c' },
  { name: 'ichchi-state',       version: PKG['ichchi-state'],       desc: 'Atomic state management with persistence & cross-tab sync',  color: '#a78bfa' },
  { name: 'bylyt-env-guard',    version: PKG['bylyt-env-guard'],    desc: 'Environment variable validation with type safety',            color: '#06b6d4' },
  { name: 'suruk-logger',       version: PKG['suruk-logger'],       desc: 'Winston-compatible Pino wrapper (5-10× faster)',             color: '#10b981' },
  { name: 'turar-config',       version: PKG['turar-config'],       desc: 'Hot-reload config — YAML, TOML, JSON, Vault integration',   color: '#38bdf8' },
  { name: 'tuuru-chrono-tz',    version: PKG['tuuru-chrono-tz'],    desc: 'TypeScript-first date/time — 568 IANA zones, 34 locales',   color: '#6366f1' },
]

// Sakha/Yakut etymology for each library name
const LEXICON = [
  {
    name: 'sir',        lib: 'sir-forms',          sakha: 'сир',   meaning: 'earth · land · ground',
    lore: 'The earth beneath every form. Grounds your data in solid terrain.',
    color: '#8b5cf6',
  },
  {
    name: 'ichchi',     lib: 'ichchi-state',        sakha: 'ичи',   meaning: 'spirit · guardian · keeper',
    lore: 'In Sakha animism, every object has its ichchi — its inner spirit. Your state store has one too.',
    color: '#a78bfa',
  },
  {
    name: 'turar',      lib: 'turar-config',        sakha: 'тура',  meaning: 'to stand · to hold firm',
    lore: 'Configuration that stands tall through every environment, runtime, and restart.',
    color: '#06b6d4',
  },
  {
    name: 'bylyt',      lib: 'bylyt-env-guard',     sakha: 'былыт', meaning: 'cloud · mist · fog',
    lore: 'Environment variables drift above your application like clouds above the taiga.',
    color: '#38bdf8',
  },
  {
    name: 'suruk',      lib: 'suruk-logger',        sakha: 'сурук', meaning: 'letter · writing · inscription',
    lore: 'Every log entry is a letter inscribed in the permanent record.',
    color: '#10b981',
  },
  {
    name: 'suruy',      lib: 'suruy-form-actions',  sakha: 'суруй', meaning: 'to write · to inscribe',
    lore: 'The act of writing — Server Actions that inscribe intent to the server.',
    color: '#fb923c',
  },
  {
    name: 'tuuru',      lib: 'tuuru-chrono-tz',     sakha: 'туур',  meaning: 'pole · pillar · sacred post',
    lore: 'The Sakha serge — a ritual tethering post. Time anchored to a pillar you can trust.',
    color: '#6366f1',
  },
]

export default function Home() {
  return (
    <>
      <CyberBg />
      <MatrixNeo />

      <style>{`
        html, body { background: #0f172a !important; }
        * { box-sizing: border-box; }
        a { text-decoration: none; }

        @keyframes aurora-sweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glitch {
          0%,86%,100% { clip-path: none; transform: none; text-shadow: none; }
          87% {
            clip-path: polygon(0 35%,100% 35%,100% 55%,0 55%);
            transform: translate(-5px, 0) skewX(-2deg);
            text-shadow: 4px 0 #06b6d4, -4px 0 #a78bfa;
          }
          89% {
            clip-path: polygon(0 10%,100% 10%,100% 25%,0 25%);
            transform: translate(4px, 0) skewX(1deg);
            text-shadow: -3px 0 #ef4444;
          }
          91% { clip-path: none; transform: none; text-shadow: none; }
          93% {
            clip-path: polygon(0 70%,100% 70%,100% 90%,0 90%);
            transform: translate(-2px, 1px);
            text-shadow: 2px 0 #34d399;
          }
          95% { clip-path: none; transform: none; text-shadow: none; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-neon {
          0%,100% { box-shadow: 0 0 8px rgba(99,102,241,0.3), 0 0 24px rgba(99,102,241,0.1); }
          50%      { box-shadow: 0 0 16px rgba(99,102,241,0.6), 0 0 48px rgba(99,102,241,0.2); }
        }
        @keyframes float-slow {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes data-scroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes border-flow {
          0%,100% { border-color: rgba(99,102,241,0.25); }
          33%      { border-color: rgba(6,182,212,0.35); }
          66%      { border-color: rgba(167,139,250,0.3); }
        }
        @keyframes holo-shimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes blink-cursor {
          0%,100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        .demo-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .demo-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.15);
        }
        .lib-card {
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .lib-card:hover {
          transform: translateY(-2px);
        }
        .lexicon-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .lexicon-card:hover {
          transform: translateY(-3px) scale(1.015);
        }
        .btn-glow:hover {
          filter: brightness(1.15) saturate(1.2);
          box-shadow: 0 0 24px rgba(99,102,241,0.5) !important;
        }
        .ext-link {
          transition: color 0.15s, opacity 0.15s;
          opacity: 0.8;
        }
        .ext-link:hover { opacity: 1; }
      `}</style>

      {/* Scanline overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(transparent, rgba(99,102,241,0.12), transparent)',
        animation: 'scanline 8s linear infinite',
        pointerEvents: 'none', zIndex: 1,
      }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', minHeight: '100vh', position: 'relative', zIndex: 2 }}>

        {/* ── Hero ── */}
        <div style={{
          borderRadius: '28px', padding: '4rem 3rem 3.5rem', marginBottom: '3.5rem',
          border: '1px solid rgba(99,102,241,0.3)',
          background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #0c1a30 60%, #0f1629 100%)',
          backgroundSize: '200% 200%',
          animation: 'border-flow 6s ease infinite, pulse-neon 4s ease-in-out infinite',
          position: 'relative', overflow: 'hidden', textAlign: 'center',
        }}>
          {/* Aurora layers */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(45deg, transparent 20%, rgba(99,102,241,0.08) 40%, rgba(6,182,212,0.06) 60%, transparent 80%)',
            backgroundSize: '400% 400%',
            animation: 'aurora-sweep 12s ease infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, transparent 30%, rgba(167,139,250,0.05) 50%, rgba(16,185,129,0.04) 70%, transparent 90%)',
            backgroundSize: '300% 300%',
            animation: 'aurora-sweep 18s ease-in-out infinite reverse',
          }} />
          {/* Radial glows */}
          <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '15%', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', right: '-40px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Hex grid watermark */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.3v17.4L30 52 0 34.7V17.3z' fill='none' stroke='%236366f1' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }} />

          <div style={{ position: 'relative' }}>
            {/* System tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: '#818cf8',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1.5rem',
              fontFamily: 'monospace',
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', animation: 'blink-cursor 1.5s ease-in-out infinite' }} />
              SYS://YEDOMA-LABS — YAKUTIA NODE ONLINE
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, lineHeight: 1.05,
              margin: '0 0 0.5rem',
              background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 40%, #06b6d4 70%, #34d399 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'glitch 7s ease-in-out infinite',
            }}>
              TypeScript Stack Demo
            </h1>

            <p style={{
              color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace',
              letterSpacing: '0.1em', margin: '0 auto 1rem', opacity: 0.7,
            }}>
              {'// version matrix: 2026.build.Σ'}
            </p>

            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 2rem', lineHeight: 1.65 }}>
              Interactive playground for every{' '}
              <a href="https://github.com/yedoma-labs" target="_blank" rel="noopener noreferrer"
                style={{ color: '#a78bfa', fontWeight: 700 }}>@yedoma-labs</a>
              {' '}npm package — forms, state, config, logging, date/time, and more.
            </p>

            {/* Tech tags */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.75rem' }}>
              {['Next.js 16', 'React 19', 'TypeScript 6', 'Server Actions', 'pnpm 9.12'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '100px', padding: '0.3rem 0.85rem', fontSize: '0.78rem', color: '#94a3b8',
                  fontFamily: 'monospace',
                }}>{tag}</span>
              ))}
            </div>

            {/* GitHub + npm hub links */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://github.com/yedoma-labs" target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1.1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              <a href="https://www.npmjs.com/~yedoma-labs" target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1.1rem', borderRadius: '8px',
                background: 'rgba(203,56,51,0.12)', border: '1px solid rgba(203,56,51,0.3)',
                color: '#fca5a5', fontSize: '0.82rem', fontWeight: 600,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/></svg>
                npm org
              </a>
            </div>
          </div>
        </div>

        {/* ── Demo grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {DEMOS.map(({ href, icon, title, tag, desc, gradient, accent, border, btnGrad, pkg }) => (
            <div key={href} className="demo-card" style={{
              background: gradient, borderRadius: '20px', padding: '2rem',
              border: `1px solid ${border}`, display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
              {/* Hex grid micro pattern */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='26' viewBox='0 0 30 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0L30 8.65v8.7L15 26 0 17.35V8.65z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
              }} />
              <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem', animation: 'float-slow 5s ease-in-out infinite' }}>{icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.15rem', fontFamily: 'monospace' }}>{title}</h2>
                <span style={{ background: `${accent}20`, color: accent, fontSize: '0.63rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '100px', border: `1px solid ${accent}40`, fontFamily: 'monospace' }}>
                  {tag}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.875rem', lineHeight: 1.55, flex: 1, marginBottom: '1.25rem' }}>
                {desc}
              </p>
              {pkg && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <a href={npm(pkg)} target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                    fontSize: '0.7rem', color: accent, fontFamily: 'monospace', fontWeight: 700,
                    background: `${accent}12`, border: `1px solid ${accent}30`,
                    padding: '0.2rem 0.55rem', borderRadius: '5px',
                  }}>npm ↗</a>
                  <a href={gh(pkg)} target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                    fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700,
                    background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)',
                    padding: '0.2rem 0.55rem', borderRadius: '5px',
                  }}>GitHub ↗</a>
                </div>
              )}
              <Link href={href} className="btn-glow" style={{
                display: 'block', textAlign: 'center', padding: '0.65rem 1.5rem',
                background: btnGrad, color: 'white', fontWeight: 700,
                borderRadius: '10px', fontSize: '0.875rem',
                boxShadow: `0 4px 15px ${accent}30`,
              }}>
                View Demo →
              </Link>
            </div>
          ))}
        </div>

        {/* ── Yakutian Culture / Etymology ── */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            borderRadius: '24px', overflow: 'hidden',
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'linear-gradient(135deg, #0a0d1a 0%, #0f0c29 40%, #060f1e 100%)',
            position: 'relative',
          }}>
            {/* Aurora stripe */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #6366f1, #06b6d4, #34d399, #a78bfa, #6366f1)',
              backgroundSize: '200% 100%',
              animation: 'aurora-sweep 4s linear infinite',
            }} />

            <div style={{ padding: '3rem' }}>
              {/* Section badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1.5rem',
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#818cf8', fontFamily: 'monospace',
              }}>
                🗺️ ORIGINS — THE YAKUT LEXICON
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                {/* Left: Yedoma explanation */}
                <div>
                  <h2
                    data-neo-trigger="true"
                    title="Wake up..."
                    style={{
                      fontSize: '2rem', fontWeight: 900, margin: '0 0 0.15rem',
                      background: 'linear-gradient(135deg, #e2e8f0, #a78bfa)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', gap: '0.35rem',
                    }}
                  >
                    едо́ма
                    <span style={{
                      display: 'inline-block', width: '0.45em', height: '1.1em',
                      background: '#a78bfa', verticalAlign: 'text-bottom', borderRadius: '1px',
                      animation: 'blink-cursor 1s step-end infinite', opacity: 0.7,
                    }} />
                  </h2>
                  <p style={{ color: '#475569', fontSize: '0.62rem', fontFamily: 'monospace', margin: '0 0 0.75rem', letterSpacing: '0.08em', opacity: 0.6 }}>
                    click to wake up
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    YEDOMA /ˈjɛdəmə/ — Pleistocene permafrost deposits, NE Siberia
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 1rem' }}>
                    <strong style={{ color: '#e2e8f0' }}>Yedoma</strong> are ancient permafrost deposits found
                    beneath the soil of northeast Siberia — ice-rich terrain formed over{' '}
                    <strong style={{ color: '#a78bfa' }}>10,000 years ago</strong> during the
                    last ice age. Organic matter, seeds, even mammoths — frozen in time. Waiting.
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                    We name this project after yedoma because good software is like permafrost:
                    forged under pressure, preserved against entropy,{' '}
                    <em style={{ color: '#94a3b8' }}>enduring long after its origin is forgotten</em>.
                  </p>
                </div>

                {/* Right: Yakutia explanation */}
                <div>
                  <h2 style={{
                    fontSize: '2rem', fontWeight: 900, margin: '0 0 0.75rem',
                    background: 'linear-gradient(135deg, #e2e8f0, #06b6d4)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    Якутия
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    SAKHA REPUBLIC — largest federal subject of Russia (3.08M km²)
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 1rem' }}>
                    The <strong style={{ color: '#e2e8f0' }}>Sakha Republic</strong> spans the Russian Far East — a territory
                    larger than Argentina, home to the{' '}
                    <strong style={{ color: '#06b6d4' }}>Sakha (Yakut) people</strong>, their
                    shamanistic tradition, the world's coldest inhabited settlements, and skies lit
                    by the aurora borealis year-round.
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                    Every library in this stack is named after a word from the{' '}
                    <strong style={{ color: '#94a3b8' }}>Sakha language</strong> — the indigenous
                    tongue of Yakutia, spoken by ~500,000 people across the Siberian taiga.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                height: '1px', margin: '0 0 2rem',
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(6,182,212,0.25), transparent)',
              }} />

              {/* Lexicon grid */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#475569', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.25rem' }}>
                  ── Library names decoded from Sakha ──
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
                  {LEXICON.map(({ name, lib, sakha, meaning, lore, color }) => (
                    <div key={name} className="lexicon-card" style={{
                      background: `linear-gradient(135deg, rgba(15,23,42,0.9), ${color}08)`,
                      border: `1px solid ${color}28`,
                      borderRadius: '14px', padding: '1.1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ color, fontSize: '1.1rem', fontWeight: 900, fontFamily: 'monospace' }}>{name}</span>
                        <span style={{ color: '#334155', fontSize: '0.82rem', fontFamily: 'serif', fontStyle: 'italic' }}>{sakha}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace', marginBottom: '0.5rem', opacity: 0.85 }}>
                        {meaning}
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.55, marginBottom: '0.65rem' }}>
                        {lore}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <a href={npm(lib)} target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                          fontSize: '0.65rem', color, fontFamily: 'monospace', fontWeight: 700,
                          background: `${color}12`, border: `1px solid ${color}28`,
                          padding: '0.15rem 0.45rem', borderRadius: '4px',
                        }}>@yedoma-labs/{lib} ↗</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Animism note */}
              <div style={{
                marginTop: '1.75rem', padding: '1.1rem 1.4rem',
                background: 'rgba(167,139,250,0.06)', borderRadius: '10px',
                border: '1px solid rgba(167,139,250,0.15)',
                display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '0.1rem' }}>🌌</span>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>
                  In Sakha animism, every mountain, river, and tree has an{' '}
                  <strong style={{ color: '#a78bfa', fontFamily: 'monospace' }}>ichchi</strong> — an inner spirit or
                  guardian. The Sakha believe no object is inert. Every piece of software
                  has a spirit too: the state it guards, the data it shapes, the time it measures.
                  We build libraries that deserve their ichchi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Libraries footer ── */}
        <footer style={{ borderTop: '1px solid #1e293b', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.4rem' }}>📦 Libraries Used</h2>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <a href="https://github.com/yedoma-labs" target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.85rem', borderRadius: '7px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                yedoma-labs
              </a>
              <a href="https://www.npmjs.com/~yedoma-labs" target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.85rem', borderRadius: '7px',
                background: 'rgba(203,56,51,0.1)', border: '1px solid rgba(203,56,51,0.25)',
                color: '#fca5a5', fontSize: '0.78rem', fontWeight: 600,
              }}>npm ↗</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {LIBRARIES.map(({ name, version, desc, color }) => (
              <div key={name} className="lib-card" style={{
                background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '1rem',
                border: `1px solid ${color}20`, display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <div style={{ width: '3px', borderRadius: '2px', background: color, alignSelf: 'stretch', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.83rem', fontFamily: 'monospace' }}>@yedoma-labs/{name}</span>
                    <span style={{ color, fontSize: '0.66rem', fontWeight: 800, fontFamily: 'monospace', background: `${color}18`, padding: '0.1rem 0.4rem', borderRadius: '4px', border: `1px solid ${color}30` }}>v{version}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>{desc}</div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <a href={npm(name)} target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                      fontSize: '0.65rem', color, fontFamily: 'monospace',
                      background: `${color}10`, border: `1px solid ${color}25`,
                      padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: 700,
                    }}>npm ↗</a>
                    <a href={gh(name)} target="_blank" rel="noopener noreferrer" className="ext-link" style={{
                      fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace',
                      background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)',
                      padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: 700,
                    }}>src ↗</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(245,158,11,0.07)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(245,158,11,0.18)', fontSize: '0.875rem', color: '#94a3b8' }}>
            🔒 <strong style={{ color: '#f59e0b' }}>bylyt-env-guard</strong> — demo mode active. Form submissions log to the server console instead of real API calls.
          </div>
        </footer>
      </main>
    </>
  )
}
