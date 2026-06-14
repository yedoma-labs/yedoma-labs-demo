'use client'

import { useState } from 'react'
import Link from 'next/link'
import { loadConfig, checkEnvHealth, generateSchemaDocs } from './actions'

type ConfigData = Awaited<ReturnType<typeof loadConfig>>
type EnvHealthData = Awaited<ReturnType<typeof checkEnvHealth>>
type SchemaDocs = Awaited<ReturnType<typeof generateSchemaDocs>>

function CodeBlock({ code }: { code: string; lang?: string }) {
  return (
    <pre style={{
      background:'#020817',color:'#e2e8f0',padding:'1.25rem',borderRadius:'10px',
      fontSize:'0.775rem',overflowX:'auto',fontFamily:"'Fira Code','Cascadia Code','Consolas',monospace",
      lineHeight:1.7,border:'1px solid #1e293b',margin:0,
    }}>
      <code>{code}</code>
    </pre>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:'#1e293b',borderRadius:'16px',padding:'2rem',border:'1px solid #334155',...style }}>
      {children}
    </div>
  )
}

function SectionHeader({ emoji, title, subtitle, gradient }: { emoji:string;title:string;subtitle:string;gradient:string }) {
  return (
    <div style={{ marginBottom:'1.75rem' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:gradient,padding:'0.4rem 1.1rem',borderRadius:'2rem',marginBottom:'0.6rem' }}>
        <span style={{ fontSize:'1.1rem' }}>{emoji}</span>
        <h2 style={{ color:'white',fontSize:'1.1rem',fontWeight:800,margin:0 }}>{title}</h2>
      </div>
      <p style={{ color:'#64748b',fontSize:'0.85rem',marginLeft:'0.25rem' }}>{subtitle}</p>
    </div>
  )
}

export default function ConfigPage() {
  const [configData, setConfigData] = useState<ConfigData | { error: string } | null>(null)
  const [envHealth, setEnvHealth] = useState<EnvHealthData | { error: string } | null>(null)
  const [schemaDocs, setSchemaDocs] = useState<SchemaDocs | { error: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [docsTab, setDocsTab] = useState<'markdown' | 'env'>('env')

  const handleLoadConfig = async () => {
    setLoading(true)
    try {
      setConfigData(await loadConfig())
    } catch (e) {
      setConfigData({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const handleCheckEnv = async () => {
    setLoading(true)
    try {
      setEnvHealth(await checkEnvHealth())
    } catch (e) {
      setEnvHealth({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const handleGenerateDocs = async () => {
    setLoading(true)
    try {
      setSchemaDocs(await generateSchemaDocs())
    } catch (e) {
      setSchemaDocs({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        html, body { background: #0f172a !important; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      <div style={{ background:'#0f172a',minHeight:'100vh',color:'#e2e8f0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'2rem' }}>

          {/* Hero */}
          <div style={{
            background:'linear-gradient(135deg,#0a1628,#003d6b,#0f172a)',
            borderRadius:'24px',padding:'3rem',marginBottom:'1.5rem',
            border:'1px solid rgba(59,130,246,0.25)',position:'relative',overflow:'hidden',
          }}>
            <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(ellipse at 75% 50%,rgba(59,130,246,0.12) 0%,transparent 60%)',pointerEvents:'none' }} />
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'1.5rem',position:'relative' }}>
              <div>
                <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',padding:'0.3rem 0.8rem',borderRadius:'2rem',marginBottom:'1rem' }}>
                  <code style={{ color:'#93c5fd',fontSize:'0.75rem',fontWeight:700 }}>@yedoma-labs/turar-config</code>
                  <span style={{ background:'#3b82f6',color:'white',padding:'0.1rem 0.45rem',borderRadius:'4px',fontSize:'0.65rem',fontWeight:800 }}>v0.2.0</span>
                  <code style={{ color:'#4ade80',fontSize:'0.75rem',fontWeight:700,marginLeft:'0.4rem' }}>+ bylyt-env-guard</code>
                </div>
                <h1 style={{ fontSize:'clamp(1.75rem,4vw,3rem)',fontWeight:900,margin:'0 0 0.5rem',background:'linear-gradient(135deg,#e2e8f0,#93c5fd,#4ade80)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1.05 }}>
                  Configuration
                </h1>
                <p style={{ color:'#94a3b8',fontSize:'1rem',margin:'0 0 1.5rem',maxWidth:500 }}>
                  Multi-format config loading (JSON, YAML, TOML), hot reload, environment cascading, variable interpolation, Vault integration, and type-safe env validation.
                </p>
                <div style={{ display:'flex',gap:'0.6rem',flexWrap:'wrap' }}>
                  {['Hot Reload','JSON/YAML/TOML','Env Cascading','Interpolation','Vault Integration','Type-Safe'].map(t => (
                    <span key={t} style={{ padding:'0.3rem 0.7rem',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'6px',color:'#93c5fd',fontSize:'0.72rem',fontWeight:700 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize:'5rem',lineHeight:1,animation:'float 4s ease-in-out infinite',flexShrink:0 }}>⚙️</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap' }}>
            <Link href="/" style={{ color:'#3b82f6',textDecoration:'none',fontSize:'0.85rem' }}>← All Demos</Link>
            <span style={{ color:'#1e293b' }}>·</span>
            <Link href="/config/hotreload" style={{ color:'#ef4444',textDecoration:'none',fontSize:'0.85rem',fontWeight:700 }}>🔥 Hot Reload Demo →</Link>
            <span style={{ color:'#1e293b' }}>·</span>
            <a href="https://www.npmjs.com/package/@yedoma-labs/turar-config" target="_blank" rel="noopener noreferrer" style={{ color:'#06b6d4',textDecoration:'none',fontSize:'0.85rem' }}>npm ↗</a>
            <span style={{ color:'#1e293b' }}>·</span>
            <a href="https://github.com/yedoma-labs/turar-config" target="_blank" rel="noopener noreferrer" style={{ color:'#64748b',textDecoration:'none',fontSize:'0.85rem' }}>GitHub ↗</a>
          </div>

          {/* Interactive Demos */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="🎯" title="Interactive Demos" subtitle="Run live server-side demos — results appear below each button" gradient="linear-gradient(135deg,#1e3a8a,#3b82f6)" />
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem' }}>
              {/* Load config */}
              <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.75rem' }}>
                  <div style={{ width:10,height:10,borderRadius:'50%',background:'#3b82f6',flexShrink:0 }} />
                  <h3 style={{ color:'#e2e8f0',fontSize:'0.95rem',fontWeight:700,margin:0 }}>Load Server Configuration</h3>
                </div>
                <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'0.5rem',lineHeight:1.5 }}>
                  Load config from <code style={{ color:'#93c5fd',background:'rgba(59,130,246,0.1)',padding:'0.1rem 0.3rem',borderRadius:'3px',fontSize:'0.7rem' }}>config/</code> with environment cascading.
                </p>
                <p style={{ color:'#334155',fontSize:'0.72rem',fontFamily:'monospace',marginBottom:'1rem' }}>
                  default.json → development.json → env vars
                </p>
                <button
                  type="button"
                  onClick={handleLoadConfig}
                  disabled={loading}
                  style={{ background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',color:'white',border:'none',borderRadius:'8px',padding:'0.55rem 1.1rem',fontSize:'0.82rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1 }}
                >
                  {loading ? 'Loading…' : '⚙️ Load Configuration'}
                </button>
                {configData && (
                  <pre style={{ background:'#020817',color:'#93c5fd',padding:'0.75rem',borderRadius:'8px',fontSize:'0.7rem',marginTop:'1rem',overflowX:'auto',border:'1px solid #1e293b',maxHeight:200,overflow:'auto' }}>
                    {JSON.stringify(configData, null, 2)}
                  </pre>
                )}
              </div>

              {/* Env health */}
              <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.75rem' }}>
                  <div style={{ width:10,height:10,borderRadius:'50%',background:'#10b981',flexShrink:0 }} />
                  <h3 style={{ color:'#e2e8f0',fontSize:'0.95rem',fontWeight:700,margin:0 }}>Environment Health Check</h3>
                </div>
                <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'0.5rem',lineHeight:1.5 }}>
                  Validate and inspect env vars using bylyt-env-guard.
                </p>
                <p style={{ color:'#334155',fontSize:'0.72rem',fontFamily:'monospace',marginBottom:'1rem' }}>
                  Required vars, types, defaults, URLs, enums
                </p>
                <button
                  type="button"
                  onClick={handleCheckEnv}
                  disabled={loading}
                  style={{ background:'linear-gradient(135deg,#064e3b,#10b981)',color:'white',border:'none',borderRadius:'8px',padding:'0.55rem 1.1rem',fontSize:'0.82rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1 }}
                >
                  {loading ? 'Checking…' : '🔍 Check Environment'}
                </button>
                {envHealth && (
                  <pre style={{ background:'#020817',color:'#34d399',padding:'0.75rem',borderRadius:'8px',fontSize:'0.7rem',marginTop:'1rem',overflowX:'auto',border:'1px solid #1e293b',maxHeight:200,overflow:'auto' }}>
                    {JSON.stringify(envHealth, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </Card>

          {/* Schema Docs Generator */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="📄" title="Schema Documentation Generator" subtitle="bylyt-env-guard can auto-generate markdown docs and .env.example from your schema — zero effort" gradient="linear-gradient(135deg,#166534,#16a34a)" />
            <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                <button
                  type="button"
                  onClick={handleGenerateDocs}
                  disabled={loading}
                  style={{ background:'linear-gradient(135deg,#166534,#16a34a)',color:'white',border:'none',borderRadius:'8px',padding:'0.55rem 1.1rem',fontSize:'0.82rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1 }}
                >
                  {loading && !schemaDocs ? 'Generating…' : '📄 Generate from Schema'}
                </button>
                <span style={{ color:'#475569',fontSize:'0.75rem' }}>
                  Calls <code style={{ color:'#4ade80',background:'rgba(74,222,128,0.1)',padding:'0.1rem 0.35rem',borderRadius:'3px',fontSize:'0.7rem' }}>generateMarkdownDocs()</code> + <code style={{ color:'#4ade80',background:'rgba(74,222,128,0.1)',padding:'0.1rem 0.35rem',borderRadius:'3px',fontSize:'0.7rem' }}>generateEnvExample()</code>
                </span>
              </div>
              {schemaDocs && !('error' in schemaDocs) && (
                <>
                  <div style={{ display:'flex',gap:'0.5rem',marginBottom:'0.75rem' }}>
                    {(['env', 'markdown'] as const).map(tab => (
                      <button key={tab} type="button" onClick={() => setDocsTab(tab)}
                        style={{ padding:'0.3rem 0.8rem',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',
                          background: docsTab === tab ? 'rgba(74,222,128,0.15)' : 'rgba(30,41,59,0.8)',
                          border: docsTab === tab ? '1px solid #16a34a' : '1px solid #334155',
                          color: docsTab === tab ? '#4ade80' : '#64748b' }}
                      >{tab === 'env' ? '.env.example' : 'Markdown Docs'}</button>
                    ))}
                  </div>
                  <pre style={{ background:'#020817',color: docsTab === 'env' ? '#34d399' : '#93c5fd',padding:'1rem',borderRadius:'8px',fontSize:'0.72rem',overflowX:'auto',fontFamily:"'Fira Code','Consolas',monospace",lineHeight:1.7,border:'1px solid #1e293b',maxHeight:300,overflow:'auto',margin:0 }}>
                    {docsTab === 'env' ? schemaDocs.envExample : schemaDocs.markdown}
                  </pre>
                </>
              )}
              {'error' in (schemaDocs ?? {}) && (
                <div style={{ color:'#ef4444',fontSize:'0.8rem',marginTop:'0.5rem' }}>Error: {(schemaDocs as any).error}</div>
              )}
            </div>
          </Card>

          {/* Config Files */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="📁" title="Configuration Files" subtitle="turar-config supports JSON, YAML, and TOML — auto-detected by extension. Files cascade: default → {NODE_ENV}" gradient="linear-gradient(135deg,#064e3b,#10b981)" />
            <div style={{ display:'flex',flexDirection:'column',gap:'0.75rem' }}>
              {[
                { title:'config/default.json — Base configuration', color:'#3b82f6', code:`{
  "app": { "name": "Yedoma Labs Demo", "version": "0.3.0", "port": 3000 },
  "features": { "enableAnalytics": false, "enableLogging": true, "maxUploadSize": 5242880 },
  "api": { "baseUrl": "http://localhost:3000/api", "timeout": 30000, "retries": 3 },
  "database": { "host": "localhost", "port": 5432, "name": "demo_db", "poolSize": 10 }
}` },
                { title:'config/development.json — Dev overrides', color:'#f59e0b', code:`{
  "features": { "enableAnalytics": false, "enableLogging": true },
  "api": { "baseUrl": "http://localhost:3000/api", "timeout": 60000 },
  "database": { "host": "localhost", "name": "demo_dev" }
}` },
                { title:'config/production.json — Prod with interpolation', color:'#ef4444', code:`{
  "features": { "enableAnalytics": true },
  "api": { "baseUrl": "\${NEXT_PUBLIC_API_URL}", "timeout": 15000 },
  "database": { "host": "\${DB_HOST}", "name": "\${DB_NAME}" }
}` },
              ].map(({ title, color, code }) => (
                <details key={title} style={{ background:'#0a0f1e',borderRadius:'10px',border:`1px solid ${color}22`,overflow:'hidden' }}>
                  <summary style={{ padding:'0.85rem 1rem',cursor:'pointer',color:'#e2e8f0',fontSize:'0.82rem',fontWeight:700,borderLeft:`3px solid ${color}` }}>
                    {title}
                  </summary>
                  <div style={{ padding:'0 1rem 1rem' }}>
                    <CodeBlock code={code} />
                  </div>
                </details>
              ))}
            </div>
          </Card>

          {/* Code Examples */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="💻" title="Code Examples" subtitle="How to wire up turar-config and bylyt-env-guard in a real Next.js project" gradient="linear-gradient(135deg,#4c1d95,#8b5cf6)" />
            <div style={{ display:'flex',flexDirection:'column',gap:'1.5rem' }}>
              <div>
                <h3 style={{ color:'#94a3b8',fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem' }}>1. Define Configuration Schema (lib/config.ts)</h3>
                <CodeBlock code={`import { createConfigSync } from '@yedoma-labs/turar-config'
import { eg } from '@yedoma-labs/bylyt-env-guard'
import path from 'node:path'

export const config = createConfigSync({
  schema: {
    app_name:                 eg.string().default('Yedoma Labs Demo'),
    app_version:              eg.string().default('0.3.0'),
    app_port:                 eg.number().default(3000),
    features_enableAnalytics: eg.boolean().default(false),
    features_enableLogging:   eg.boolean().default(true),
    api_baseUrl:              eg.url().default('http://localhost:3000/api'),
    api_timeout:              eg.number().default(30000),
    api_retries:              eg.number().default(3),
  },
  configDir: path.join(process.cwd(), 'config'),
})

config.app_name              // ✅ string
config.features_maxUploadSize // ✅ number`} />
              </div>
              <div>
                <h3 style={{ color:'#94a3b8',fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem' }}>2. Environment Variables (env.ts)</h3>
                <CodeBlock code={`import { createEnv, eg } from '@yedoma-labs/bylyt-env-guard'

export const env = createEnv({
  schema: {
    NODE_ENV:             eg.enum(['development','staging','production'] as const).default('development'),
    NEXT_PUBLIC_API_URL:  eg.url().default('http://localhost:3000/api'),
    DEMO_MODE:            eg.boolean().default(true),
  },
})

env.NODE_ENV           // ✅ 'development' | 'staging' | 'production'
env.NEXT_PUBLIC_API_URL // ✅ string (validated URL)`} />
              </div>
              <div>
                <h3 style={{ color:'#94a3b8',fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem' }}>3. Use in Server Actions</h3>
                <CodeBlock code={`'use server'
import { config } from '@/lib/config'
import { env }    from '@/env'

export async function getAppSettings() {
  return {
    appName:           config.app_name,
    version:           config.app_version,
    environment:       env.NODE_ENV,
    apiUrl:            config.api_baseUrl,
    analyticsEnabled:  config.features_enableAnalytics,
  }
}`} />
              </div>
            </div>
          </Card>

          {/* Environment Cascading */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="🔄" title="Environment Cascading" subtitle="Config loading order — later entries override earlier ones" gradient="linear-gradient(135deg,#0e7490,#06b6d4)" />
            <div style={{ display:'flex',flexDirection:'column',gap:'0.5rem' }}>
              {[
                { step:'1', label:'default.json', desc:'Base configuration (always loaded)',                                  color:'#94a3b8' },
                { step:'2', label:'{NODE_ENV}.json', desc:'Environment-specific overrides (development, staging, production)', color:'#3b82f6' },
                { step:'3', label:'Environment Variables', desc:'Variable interpolation with ${VAR_NAME}',                     color:'#10b981' },
                { step:'4', label:'Schema Defaults', desc:'Fallbacks from bylyt-env-guard schema definitions',               color:'#a78bfa' },
              ].map(({ step, label, desc, color }) => (
                <div key={step} style={{ display:'flex',gap:'1rem',alignItems:'flex-start',background:'#0a0f1e',borderRadius:'8px',padding:'0.75rem 1rem',borderLeft:`3px solid ${color}` }}>
                  <span style={{ color,fontWeight:800,fontSize:'0.85rem',flexShrink:0,fontFamily:'monospace' }}>{step}</span>
                  <div>
                    <code style={{ color,fontSize:'0.82rem',fontWeight:700 }}>{label}</code>
                    <p style={{ color:'#475569',fontSize:'0.75rem',margin:'0.15rem 0 0' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* When to use */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="🎯" title="When to Use What" subtitle="Choosing between turar-config, bylyt-env-guard, or both" gradient="linear-gradient(135deg,#7f1d1d,#ef4444)" />
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1rem' }}>
              {[
                { title:'turar-config', color:'#3b82f6', bullets:['Multi-environment file-based config','JSON, YAML, TOML support','Config cascading base → env','Variable interpolation needed','Vault secrets integration'] },
                { title:'bylyt-env-guard', color:'#10b981', bullets:['Simple env var validation','12-factor app principles','Zero file-based config','Minimal bundle size','Runtime-only validation'] },
                { title:'Both Together', color:'#f59e0b', bullets:['Complex enterprise apps','File defaults + env overrides','Maximum flexibility + type safety','Multiple deployment environments','Config management is critical'] },
              ].map(({ title, color, bullets }) => (
                <div key={title} style={{ background:'#0a0f1e',borderRadius:'10px',padding:'1.25rem',border:`1px solid ${color}22` }}>
                  <h3 style={{ color,fontSize:'0.9rem',fontWeight:700,marginBottom:'0.75rem' }}>Use {title} when:</h3>
                  <ul style={{ listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'0.35rem' }}>
                    {bullets.map(b => (
                      <li key={b} style={{ color:'#64748b',fontSize:'0.78rem',display:'flex',gap:'0.5rem',alignItems:'flex-start' }}>
                        <span style={{ color,flexShrink:0 }}>›</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Comparison table */}
          <Card style={{ marginBottom:'1.5rem' }}>
            <SectionHeader emoji="📊" title="Feature Comparison" subtitle="" gradient="linear-gradient(135deg,#312e81,#6366f1)" />
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #334155' }}>
                    <th style={{ textAlign:'left',padding:'0.65rem 0.75rem',color:'#64748b',fontWeight:600 }}>Feature</th>
                    <th style={{ textAlign:'center',padding:'0.65rem 0.75rem',color:'#4ade80',fontWeight:700 }}>bylyt-env-guard</th>
                    <th style={{ textAlign:'center',padding:'0.65rem 0.75rem',color:'#93c5fd',fontWeight:700 }}>turar-config</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Env Variable Validation','✅','✅'],
                    ['File-based Config','❌','✅'],
                    ['Env Cascading','❌','✅'],
                    ['Variable Interpolation','❌','✅'],
                    ['Secrets Integration','❌','✅'],
                    ['TypeScript Inference','✅','✅'],
                    ['Zero Runtime Deps','✅','❌ (yaml, toml)'],
                    ['Bundle Size','~2KB','~15KB'],
                    ['Supported Formats','Env only','JSON, YAML, TOML, Env'],
                  ].map(([feature, left, right], i) => (
                    <tr key={feature} style={{ borderBottom:'1px solid #1e293b',background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding:'0.6rem 0.75rem',color:'#94a3b8' }}>{feature}</td>
                      <td style={{ textAlign:'center',padding:'0.6rem 0.75rem',color: left.startsWith('✅') ? '#4ade80' : left.startsWith('❌') ? '#ef4444' : '#94a3b8' }}>{left}</td>
                      <td style={{ textAlign:'center',padding:'0.6rem 0.75rem',color: right.startsWith('✅') ? '#93c5fd' : right.startsWith('❌') ? '#ef4444' : '#94a3b8' }}>{right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Footer */}
          <div style={{ textAlign:'center',padding:'2rem 1rem',borderTop:'1px solid #1e293b',color:'#334155' }}>
            <p style={{ marginBottom:'0.5rem' }}>
              <span style={{ background:'linear-gradient(135deg,#93c5fd,#4ade80)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontWeight:800,fontSize:'1rem' }}>
                turar-config + bylyt-env-guard
              </span>
            </p>
            <p style={{ fontSize:'0.8rem' }}>
              <Link href="/" style={{ color:'#3b82f6',textDecoration:'none' }}>← Yedoma Labs Demo Hub</Link>
              <span style={{ color:'#1e293b',margin:'0 0.75rem' }}>·</span>
              <Link href="/config/hotreload" style={{ color:'#ef4444',textDecoration:'none' }}>🔥 Hot Reload Demo →</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
