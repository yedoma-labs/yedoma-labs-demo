'use client'

import { useState } from 'react'
import Link from 'next/link'

type TemplateKey = 'Welcome' | 'PasswordReset' | 'EmailVerification' | 'TwoFactorAuth' | 'MagicLink' | 'Invoice' | 'Notification'
type ProviderKey = 'resend' | 'smtp' | 'ses' | 'sendgrid' | 'postmark'

interface Theme {
  primary: string
  accentBar: string
  borderRadius: string
}

const TEMPLATES: { key: TemplateKey; label: string; icon: string; desc: string }[] = [
  { key: 'Welcome',            icon: '👋', label: 'Welcome',             desc: 'name, loginUrl' },
  { key: 'PasswordReset',      icon: '🔑', label: 'Password Reset',      desc: 'username, resetUrl' },
  { key: 'EmailVerification',  icon: '✉️', label: 'Email Verification',  desc: 'name, verifyUrl' },
  { key: 'TwoFactorAuth',      icon: '🛡️', label: 'Two-Factor Auth',     desc: 'username, code' },
  { key: 'MagicLink',          icon: '✨', label: 'Magic Link',           desc: 'email, loginUrl' },
  { key: 'Invoice',            icon: '🧾', label: 'Invoice',              desc: 'customerName, invoiceNumber, items' },
  { key: 'Notification',       icon: '🔔', label: 'Notification',         desc: 'title, body' },
]

const PROVIDERS: { key: ProviderKey; label: string; color: string; pkg: string }[] = [
  { key: 'resend',     label: 'Resend',     color: '#000000', pkg: 'resend' },
  { key: 'smtp',       label: 'SMTP',       color: '#0891b2', pkg: 'nodemailer' },
  { key: 'ses',        label: 'AWS SES',    color: '#f59e0b', pkg: '@aws-sdk/client-ses' },
  { key: 'sendgrid',   label: 'SendGrid',   color: '#1a82e2', pkg: '@sendgrid/mail' },
  { key: 'postmark',   label: 'Postmark',   color: '#ef4444', pkg: 'postmark' },
]

// ── MockEmail ─────────────────────────────────────────────────────────────────
function MockEmail({ template, theme }: { template: TemplateKey; theme: Theme }) {
  const { primary, accentBar, borderRadius } = theme
  const br = borderRadius

  const outer: React.CSSProperties = {
    background: '#f1f5f9',
    borderRadius: '12px',
    padding: '2rem 1.5rem',
    minHeight: '340px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const card: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: br,
    boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }
  const bar: React.CSSProperties = { height: '4px', background: accentBar, width: '100%' }
  const body: React.CSSProperties = { padding: '2rem 2rem 1.5rem' }
  const h1: React.CSSProperties = { color: '#1e293b', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.6rem', lineHeight: 1.3 }
  const p: React.CSSProperties = { color: '#64748b', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1.25rem' }
  const btn: React.CSSProperties = {
    display: 'inline-block', background: primary, color: '#fff',
    padding: '0.65rem 1.5rem', borderRadius: '6px', fontWeight: 600,
    fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem',
  }
  const divider: React.CSSProperties = { borderTop: '1px solid #e2e8f0', margin: '0 0 1rem' }
  const footer: React.CSSProperties = { padding: '0 2rem 1.5rem', color: '#94a3b8', fontSize: '0.72rem', textAlign: 'center' as const }

  if (template === 'TwoFactorAuth') return (
    <div style={outer}>
      <div style={card}>
        <div style={bar} />
        <div style={body}>
          <h1 style={h1}>Your verification code</h1>
          <p style={{ ...p, marginBottom: '1rem' }}>Enter this code to complete sign-in for <strong>alice.j</strong></p>
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.3em', color: primary }}>
              847 293
            </span>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.4rem' }}>Expires in 10 minutes</div>
          </div>
          <p style={{ ...p, fontSize: '0.78rem', color: '#94a3b8', marginBottom: 0 }}>
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        <div style={divider} />
        <div style={footer}>© 2026 Acme Corp · <span style={{ textDecoration: 'underline' }}>Unsubscribe</span></div>
      </div>
    </div>
  )

  if (template === 'Invoice') return (
    <div style={outer}>
      <div style={card}>
        <div style={bar} />
        <div style={body}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ ...h1, marginBottom: '0.2rem' }}>Invoice</h1>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>#INV-2026-0042</div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Alice Johnson</div>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>alice@example.com</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left' as const, padding: '0.4rem 0', color: '#94a3b8', fontWeight: 600 }}>Item</th>
                <th style={{ textAlign: 'right' as const, padding: '0.4rem 0', color: '#94a3b8', fontWeight: 600 }}>Qty</th>
                <th style={{ textAlign: 'right' as const, padding: '0.4rem 0', color: '#94a3b8', fontWeight: 600 }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Pro Plan (annual)', qty: 1, price: '$299.00' },
                { name: 'Extra seats × 3',  qty: 3, price: '$45.00'  },
              ].map(row => (
                <tr key={row.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0', color: '#1e293b' }}>{row.name}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' as const, color: '#64748b' }}>{row.qty}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' as const, color: '#1e293b', fontWeight: 600 }}>{row.price}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ padding: '0.5rem 0', color: '#94a3b8', fontSize: '0.78rem', textAlign: 'right' as const, paddingRight: '0.5rem' }}>Total</td>
                <td style={{ padding: '0.5rem 0', textAlign: 'right' as const, color: primary, fontWeight: 800, fontSize: '1rem' }}>$344.00</td>
              </tr>
            </tfoot>
          </table>
          <a href="#" style={btn}>Pay Invoice</a>
        </div>
        <div style={divider} />
        <div style={footer}>© 2026 Acme Corp · <span style={{ textDecoration: 'underline' }}>Unsubscribe</span></div>
      </div>
    </div>
  )

  const CONTENT: Record<TemplateKey, { heading: string; body: string; cta: string }> = {
    Welcome:           { heading: 'Welcome to Acme!',       body: 'Your account is ready and waiting. Click below to get started.',                         cta: 'Get Started →' },
    PasswordReset:     { heading: 'Reset your password',    body: 'You requested a password reset for alice.j. This link expires in 1 hour.',               cta: 'Reset Password →' },
    EmailVerification: { heading: 'Verify your email',      body: 'Click the button below to verify alice@example.com and activate your account.',           cta: 'Verify Email →' },
    MagicLink:         { heading: 'Sign in to Acme',        body: 'Click the link below to sign in as alice@example.com. This link expires in 15 minutes.',  cta: 'Sign In →' },
    Notification:      { heading: 'New device logged in',   body: 'A new device signed into your account from Berlin, Germany. If this wasn\'t you, secure your account immediately.',  cta: 'Review Activity →' },
    TwoFactorAuth:     { heading: '', body: '', cta: '' },
    Invoice:           { heading: '', body: '', cta: '' },
  }

  const { heading, body: bodyText, cta } = CONTENT[template]

  return (
    <div style={outer}>
      <div style={card}>
        <div style={bar} />
        <div style={body}>
          <h1 style={h1}>{heading}</h1>
          <p style={p}>{bodyText}</p>
          <a href="#" style={btn} onClick={e => e.preventDefault()}>{cta}</a>
          <p style={{ ...p, fontSize: '0.78rem', color: '#94a3b8', marginBottom: 0 }}>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style={divider} />
        <div style={footer}>© 2026 Acme Corp · <span style={{ textDecoration: 'underline' }}>Unsubscribe</span></div>
      </div>
    </div>
  )
}

// ── Code blocks ───────────────────────────────────────────────────────────────
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={copy}
        style={{
          position: 'absolute', top: '0.6rem', right: '0.6rem',
          background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`,
          color: copied ? '#34d399' : '#64748b',
          borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.68rem',
          fontFamily: 'monospace', cursor: 'pointer', zIndex: 1,
        }}
      >{copied ? '✓ copied' : 'copy'}</button>
      <pre style={{
        background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '1.25rem 1.5rem', overflow: 'auto',
        fontSize: '0.78rem', lineHeight: 1.7, color: '#e2e8f0',
        fontFamily: '"Fira Code", "Cascadia Code", monospace',
        margin: 0,
      }}>
        <code>{children}</code>
      </pre>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '1rem',
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em',
      textTransform: 'uppercase' as const, color: '#818cf8', fontFamily: 'monospace',
    }}>
      {children}
    </div>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #0c1a30 100%)',
      border: '1px solid rgba(99,102,241,0.18)',
      borderRadius: '20px', padding: '2rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Provider code ─────────────────────────────────────────────────────────────
const PROVIDER_CODE: Record<ProviderKey, string> = {
  resend: `import { createMailer } from '@yedoma-labs/tierde-mail'
import { resend } from '@yedoma-labs/tierde-mail/providers/resend'

const mailer = createMailer({
  provider: resend({ apiKey: process.env.RESEND_API_KEY! }),
  from: { email: 'hello@acme.com', name: 'Acme' },
})`,
  smtp: `import { createMailer } from '@yedoma-labs/tierde-mail'
import { smtp } from '@yedoma-labs/tierde-mail/providers/smtp'

const mailer = createMailer({
  provider: smtp({
    host: process.env.SMTP_HOST!,
    port: 587,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  }),
  from: 'hello@acme.com',
})`,
  ses: `import { createMailer } from '@yedoma-labs/tierde-mail'
import { ses } from '@yedoma-labs/tierde-mail/providers/ses'
import { SESClient } from '@aws-sdk/client-ses'

const mailer = createMailer({
  provider: ses({
    client: new SESClient({ region: 'us-east-1' }),
  }),
  from: 'hello@acme.com',
})`,
  sendgrid: `import { createMailer } from '@yedoma-labs/tierde-mail'
import { sendgrid } from '@yedoma-labs/tierde-mail/providers/sendgrid'

const mailer = createMailer({
  provider: sendgrid({ apiKey: process.env.SENDGRID_API_KEY! }),
  from: { email: 'hello@acme.com', name: 'Acme' },
})`,
  postmark: `import { createMailer } from '@yedoma-labs/tierde-mail'
import { postmark } from '@yedoma-labs/tierde-mail/providers/postmark'

const mailer = createMailer({
  provider: postmark({ serverToken: process.env.POSTMARK_TOKEN! }),
  from: 'hello@acme.com',
})`,
}

// ── Template send code ────────────────────────────────────────────────────────
const TEMPLATE_CODE: Record<TemplateKey, string> = {
  Welcome: `import { Welcome } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(Welcome, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    loginUrl: 'https://app.acme.com/start',
  },
})`,
  PasswordReset: `import { PasswordReset } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(PasswordReset, {
  to: 'alice@example.com',
  props: {
    username: 'alice.j',
    resetUrl: 'https://app.acme.com/reset/tok_abc123',
  },
})`,
  EmailVerification: `import { EmailVerification } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(EmailVerification, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    verifyUrl: 'https://app.acme.com/verify/tok_xyz789',
  },
})`,
  TwoFactorAuth: `import { TwoFactorAuth } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(TwoFactorAuth, {
  to: 'alice@example.com',
  props: {
    username: 'alice.j',
    code: '847 293',
  },
})`,
  MagicLink: `import { MagicLink } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(MagicLink, {
  to: 'alice@example.com',
  props: {
    email: 'alice@example.com',
    loginUrl: 'https://app.acme.com/magic/tok_m4g1c',
  },
})`,
  Invoice: `import { Invoice } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(Invoice, {
  to: 'alice@example.com',
  props: {
    customerName: 'Alice Johnson',
    invoiceNumber: 'INV-2026-0042',
    items: [
      { name: 'Pro Plan (annual)', quantity: 1, price: 29900 },
      { name: 'Extra seats × 3',  quantity: 3, price:  4500 },
    ],
  },
})`,
  Notification: `import { Notification } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(Notification, {
  to: 'alice@example.com',
  props: {
    title: 'New device logged in',
    body: 'A new device signed into your account from Berlin, Germany.',
  },
})`,
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TierdeMailPage() {
  const [activeTemplate, setActiveTemplate]       = useState<TemplateKey>('Welcome')
  const [activeProvider, setActiveProvider]       = useState<ProviderKey>('resend')
  const [theme, setTheme]                         = useState<Theme>({ primary: '#6366f1', accentBar: '#6366f1', borderRadius: '8px' })
  const [showStrategy, setShowStrategy]           = useState<'failover' | 'round-robin'>('failover')

  return (
    <>
      <style>{`
        html, body { background: #0f172a !important; }
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        @keyframes aurora-sweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blink-cursor {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes float-slow {
          0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); }
        }
        .tm-tab { transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .tm-tab:hover { filter: brightness(1.1); }
        .tm-card { transition: transform 0.2s, box-shadow 0.2s; }
        .tm-card:hover { transform: translateY(-2px); }
      `}</style>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', minHeight: '100vh', position: 'relative', zIndex: 10 }}>

        {/* ── Back ── */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '2rem' }}>
          ← back to hub
        </Link>

        {/* ── Hero ── */}
        <div style={{
          borderRadius: '28px', padding: '4rem 3rem 3.5rem', marginBottom: '3rem',
          border: '1px solid rgba(239,68,68,0.25)',
          background: 'linear-gradient(135deg, #1a0505 0%, #2d0a0a 30%, #1a0a1a 60%, #0f0f1a 100%)',
          position: 'relative', overflow: 'hidden', textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(45deg, transparent 20%, rgba(239,68,68,0.06) 40%, rgba(251,146,60,0.04) 60%, transparent 80%)',
            backgroundSize: '400% 400%', animation: 'aurora-sweep 12s ease infinite',
          }} />
          <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'float-slow 5s ease-in-out infinite' }}>📬</div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: '#fca5a5',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1.5rem',
              fontFamily: 'monospace',
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'blink-cursor 1.5s ease-in-out infinite' }} />
              @yedoma-labs/tierde-mail — v0.1.0
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1rem',
              background: 'linear-gradient(135deg, #fecaca 0%, #fb923c 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              tierde-mail
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 0.5rem', lineHeight: 1.65 }}>
              JSX email templates · multi-provider · TypeScript-first
            </p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace', margin: '0 auto 2rem' }}>
              // тиэрдэ — "to deliver · to convey" (Sakha)
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.75rem' }}>
              {['JSX Templates', '5 Providers', '7 Built-in Templates', 'Failover / Round-Robin', 'Testing Helpers', 'i18n', 'CSS Inline'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '100px', padding: '0.3rem 0.85rem', fontSize: '0.75rem', color: '#fca5a5',
                  fontFamily: 'monospace',
                }}>{tag}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <a href="https://www.npmjs.com/package/@yedoma-labs/tierde-mail" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1.1rem', borderRadius: '8px',
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: '0.82rem', fontWeight: 600,
              }}>npm ↗</a>
              <a href="https://github.com/yedoma-labs/tierde-mail" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1.1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600,
              }}>GitHub ↗</a>
            </div>
          </div>
        </div>

        {/* ── Install ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Install</SectionLabel>
          <Code>{`npm install @yedoma-labs/tierde-mail
# or
pnpm add @yedoma-labs/tierde-mail`}</Code>
        </Card>

        {/* ── Quick Start ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Quick Start</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1rem' }}>Send your first email in 3 steps</h2>
          <Code>{`import { createMailer, defineEmail, EmailTemplate, Heading, Text, Button } from '@yedoma-labs/tierde-mail'
import { resend } from '@yedoma-labs/tierde-mail/providers/resend'

// 1. Define a typed email template
const WelcomeEmail = defineEmail<{ name: string; url: string }>({
  subject: ({ name }) => \`Welcome, \${name}!\`,
  component: ({ name, url }) => (
    <EmailTemplate preview={\`Welcome, \${name}!\`}>
      <Heading>Welcome, {name}!</Heading>
      <Text>Your account is ready.</Text>
      <Button href={url}>Get Started</Button>
    </EmailTemplate>
  ),
})

// 2. Create a mailer
const mailer = createMailer({
  provider: resend({ apiKey: process.env.RESEND_API_KEY! }),
  from: { email: 'hello@acme.com', name: 'Acme' },
})

// 3. Send
await mailer.send(WelcomeEmail, {
  to: 'alice@example.com',
  props: { name: 'Alice', url: 'https://app.acme.com/start' },
})`}</Code>
        </Card>

        {/* ── Interactive template preview ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Built-in Templates</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>7 production-ready templates</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            Import from <code style={{ fontFamily: 'monospace', color: '#fca5a5', fontSize: '0.8rem' }}>@yedoma-labs/tierde-mail/templates</code> — each accepts <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>theme?</code>, <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>locale?</code>, <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>strings?</code>
          </p>

          {/* Template tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.key}
                className="tm-tab"
                onClick={() => setActiveTemplate(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.8rem', borderRadius: '8px',
                  background: activeTemplate === t.key ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeTemplate === t.key ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: activeTemplate === t.key ? '#fca5a5' : '#64748b',
                  fontSize: '0.78rem', fontWeight: activeTemplate === t.key ? 700 : 400,
                  fontFamily: 'monospace', cursor: 'pointer',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Split: preview + code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
                LIVE PREVIEW
              </div>
              <MockEmail template={activeTemplate} theme={theme} />
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
                SEND CALL — props: {TEMPLATES.find(t => t.key === activeTemplate)?.desc}
              </div>
              <Code>{TEMPLATE_CODE[activeTemplate]}</Code>
            </div>
          </div>
        </Card>

        {/* ── Theme customization ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Theme Customization</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>createTheme — live preview</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            Customize accent color, button color, and border radius. Propagates to all templates and built-ins.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>primary (button color)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input type="color" value={theme.primary} onChange={e => setTheme(t => ({ ...t, primary: e.target.value, accentBar: e.target.value }))}
                      style={{ width: '40px', height: '32px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '2px', background: 'none' }} />
                    <code style={{ color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace' }}>{theme.primary}</code>
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>accentBar (top bar color)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input type="color" value={theme.accentBar} onChange={e => setTheme(t => ({ ...t, accentBar: e.target.value }))}
                      style={{ width: '40px', height: '32px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '2px', background: 'none' }} />
                    <code style={{ color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace' }}>{theme.accentBar}</code>
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>borderRadius</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['0px', '4px', '8px', '16px'].map(r => (
                      <button key={r} onClick={() => setTheme(t => ({ ...t, borderRadius: r }))}
                        style={{
                          padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem',
                          fontFamily: 'monospace', cursor: 'pointer',
                          background: theme.borderRadius === r ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${theme.borderRadius === r ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: theme.borderRadius === r ? '#fca5a5' : '#64748b',
                        }}>{r}</button>
                    ))}
                  </div>
                </label>
              </div>
              <Code>{`import { createTheme } from '@yedoma-labs/tierde-mail'

const myTheme = createTheme({
  primary: '${theme.primary}',
  accentBar: '${theme.accentBar}',
  borderRadius: '${theme.borderRadius}',
  logo: 'https://cdn.acme.com/logo.png',
})

// Apply to a built-in template
await mailer.send(Welcome, {
  to: 'alice@example.com',
  props: { name: 'Alice', loginUrl: '...' },
  theme: myTheme,
})`}</Code>
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
                LIVE PREVIEW
              </div>
              <MockEmail template="Welcome" theme={theme} />
            </div>
          </div>
        </Card>

        {/* ── defineEmail ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>defineEmail API</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Custom templates with full TypeScript inference</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Props are typed end-to-end — from the template definition through to the <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>mailer.send()</code> call.
          </p>
          <Code>{`import {
  defineEmail,
  EmailTemplate,
  Heading,
  Text,
  Button,
  Footer,
} from '@yedoma-labs/tierde-mail'

// Fully typed props — TypeScript will enforce them at mailer.send()
const TrialExpiring = defineEmail<{
  name: string
  daysLeft: number
  upgradeUrl: string
}>({
  subject: ({ name, daysLeft }) =>
    \`\${name}, your trial ends in \${daysLeft} day\${daysLeft === 1 ? '' : 's'}\`,

  component: ({ name, daysLeft, upgradeUrl }) => (
    <EmailTemplate preview={\`Trial ending soon — \${daysLeft} days left\`}>
      <Heading>Your trial ends {daysLeft === 1 ? 'tomorrow' : \`in \${daysLeft} days\`}</Heading>
      <Text>
        Hey {name}, you have <strong>{daysLeft} days</strong> left on your free trial.
        Upgrade now to keep access to all features.
      </Text>
      <Button href={upgradeUrl}>Upgrade Now →</Button>
      <Footer>
        Questions? Reply to this email — we're happy to help.
      </Footer>
    </EmailTemplate>
  ),
})

// TypeScript enforces these props match the generic
await mailer.send(TrialExpiring, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    daysLeft: 3,
    upgradeUrl: 'https://app.acme.com/upgrade',
  },
})`}</Code>
        </Card>

        {/* ── Providers ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Provider Setup</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>5 providers — swap without changing send logic</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {PROVIDERS.map(p => (
              <button
                key={p.key}
                className="tm-tab"
                onClick={() => setActiveProvider(p.key)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem',
                  fontFamily: 'monospace', cursor: 'pointer', fontWeight: activeProvider === p.key ? 700 : 400,
                  background: activeProvider === p.key ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeProvider === p.key ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: activeProvider === p.key ? '#fca5a5' : '#64748b',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Code>{PROVIDER_CODE[activeProvider]}</Code>

          {activeProvider === 'smtp' && (
            <div style={{ marginTop: '0.75rem', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#67e8f9' }}>
              SMTP provider requires <code style={{ fontFamily: 'monospace' }}>nodemailer</code> — install it separately: <code style={{ fontFamily: 'monospace' }}>pnpm add nodemailer</code>
            </div>
          )}
          {activeProvider === 'ses' && (
            <div style={{ marginTop: '0.75rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#fcd34d' }}>
              AWS SES requires <code style={{ fontFamily: 'monospace' }}>@aws-sdk/client-ses</code> — install it separately: <code style={{ fontFamily: 'monospace' }}>pnpm add @aws-sdk/client-ses</code>
            </div>
          )}
        </Card>

        {/* ── Multi-provider strategies ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Multi-Provider Strategies</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Failover & round-robin out of the box</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Pass multiple providers and a strategy. The mailer handles routing automatically — your send call stays identical.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {(['failover', 'round-robin'] as const).map(s => (
              <button key={s} className="tm-tab" onClick={() => setShowStrategy(s)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem',
                  fontFamily: 'monospace', cursor: 'pointer', fontWeight: showStrategy === s ? 700 : 400,
                  background: showStrategy === s ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showStrategy === s ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: showStrategy === s ? '#fca5a5' : '#64748b',
                }}>{s}</button>
            ))}
          </div>

          {showStrategy === 'failover' ? (
            <Code>{`import { resend } from '@yedoma-labs/tierde-mail/providers/resend'
import { smtp } from '@yedoma-labs/tierde-mail/providers/smtp'

const mailer = createMailer({
  // Try resend first — fall back to SMTP on failure
  providers: [
    resend({ apiKey: process.env.RESEND_API_KEY! }),
    smtp({ host: 'smtp.acme.com', port: 587, auth: { user: '...', pass: '...' } }),
  ],
  strategy: 'failover',
  from: 'hello@acme.com',
})

// Send call is identical — routing is transparent
await mailer.send(WelcomeEmail, {
  to: 'alice@example.com',
  props: { name: 'Alice', loginUrl: '...' },
})`}</Code>
          ) : (
            <Code>{`import { resend } from '@yedoma-labs/tierde-mail/providers/resend'
import { sendgrid } from '@yedoma-labs/tierde-mail/providers/sendgrid'
import { postmark } from '@yedoma-labs/tierde-mail/providers/postmark'

const mailer = createMailer({
  // Distribute load across 3 providers evenly
  providers: [
    resend({ apiKey: process.env.RESEND_API_KEY! }),
    sendgrid({ apiKey: process.env.SENDGRID_API_KEY! }),
    postmark({ serverToken: process.env.POSTMARK_TOKEN! }),
  ],
  strategy: 'round-robin',
  from: 'hello@acme.com',
})

// Each call routes to the next provider in sequence
await mailer.send(WelcomeEmail, { to: 'alice@example.com', props: { ... } })
await mailer.send(WelcomeEmail, { to: 'bob@example.com',   props: { ... } })
await mailer.send(WelcomeEmail, { to: 'carol@example.com', props: { ... } })
// resend → sendgrid → postmark → resend → ...`}</Code>
          )}
        </Card>

        {/* ── Testing ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Testing</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>captureEmails — zero-config test inbox</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            No mock setup, no config — <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>captureEmails()</code> intercepts sends into an in-memory inbox. Works with vitest, jest, any test runner.
          </p>
          <Code>{`import { captureEmails } from '@yedoma-labs/tierde-mail/testing'
import { WelcomeEmail } from '../emails/welcome'

describe('WelcomeEmail', () => {
  it('sends with correct subject and recipient', async () => {
    const { mailer, inbox, clear } = captureEmails()

    await mailer.send(WelcomeEmail, {
      to: 'alice@example.com',
      props: { name: 'Alice', loginUrl: 'https://app.acme.com/start' },
    })

    expect(inbox).toHaveLength(1)
    expect(inbox[0].to).toBe('alice@example.com')
    expect(inbox[0].subject).toBe('Welcome, Alice!')
    expect(inbox[0].html).toContain('Get Started')

    clear() // reset inbox between tests
  })

  it('sends to multiple recipients', async () => {
    const { mailer, inbox } = captureEmails()

    await mailer.send(WelcomeEmail, {
      to: ['alice@example.com', 'bob@example.com'],
      props: { name: 'Team', loginUrl: '...' },
    })

    expect(inbox).toHaveLength(2)
  })
})`}</Code>
        </Card>

        {/* ── i18n ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>i18n & String Overrides</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Localize any built-in template</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Pass <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>locale</code> for RTL/LTR direction, or <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>strings</code> to override any copy in any built-in template.
          </p>
          <Code>{`import { Welcome, PasswordReset } from '@yedoma-labs/tierde-mail/templates'

// German locale — sets dir="ltr", applies locale-aware date formatting
await mailer.send(Welcome, {
  to: 'alice@example.de',
  props: { name: 'Alice', loginUrl: '...' },
  locale: 'de',
  strings: {
    cta: 'Jetzt starten',
    footer: '© 2026 Acme GmbH · Abmelden',
  },
})

// Arabic — RTL layout applied automatically via dir="rtl"
await mailer.send(PasswordReset, {
  to: 'alice@example.sa',
  props: { username: 'alice', resetUrl: '...' },
  locale: 'ar',
  strings: {
    heading: 'إعادة تعيين كلمة المرور',
    body: 'انقر على الزر أدناه لإعادة تعيين كلمة المرور.',
    cta: 'إعادة التعيين',
  },
})`}</Code>
        </Card>

        {/* ── CLI eject ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>CLI — tierde eject</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Eject built-in templates for full control</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Need to change layout, add custom sections, or rebrand completely? Eject copies the source JSX into your project.
          </p>
          <Code>{`# Eject all 7 built-in templates into ./emails/
npx tierde eject

# Eject a specific template
npx tierde eject Welcome
npx tierde eject Invoice PasswordReset

# Eject to a custom directory
npx tierde eject --out src/emails/templates/

# Output (example):
# ✓ emails/Welcome.tsx
# ✓ emails/PasswordReset.tsx
# ✓ emails/Invoice.tsx
# ... (update imports to '@yedoma-labs/tierde-mail' components)`}</Code>

          <div style={{ marginTop: '0.75rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#a5b4fc' }}>
            After eject, the ejected file is yours — tierde-mail won't override it on update. You keep all component primitives (<code style={{ fontFamily: 'monospace' }}>EmailTemplate</code>, <code style={{ fontFamily: 'monospace' }}>Button</code>, etc.) and own the layout.
          </div>
        </Card>

        {/* ── CSS inlining ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>CSS Inlining</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Automatic — powered by @css-inline/css-inline</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            CSS is inlined at send time for maximum email client compatibility (Gmail, Outlook, Apple Mail). Write styles naturally in JSX — tierde-mail handles inlining before delivery.
          </p>
          <Code>{`// Write styles as normal JSX style props or <style> tags in EmailTemplate
const OrderConfirmed = defineEmail<{ orderId: string; total: number }>({
  subject: ({ orderId }) => \`Order #\${orderId} confirmed!\`,
  component: ({ orderId, total }) => (
    <EmailTemplate
      preview={\`Your order #\${orderId} is confirmed\`}
      // <style> blocks are inlined automatically — no manual inlining needed
    >
      <Heading>Order Confirmed 🎉</Heading>
      <Text>
        Thank you! Order <strong style={{ color: '#6366f1' }}>#{orderId}</strong> is
        confirmed. Total: <strong>\${total.toFixed(2)}</strong>
      </Text>
      <Button href={\`https://app.acme.com/orders/\${orderId}\`}>
        View Order →
      </Button>
    </EmailTemplate>
  ),
})
// tierde-mail calls css-inline before sending — style={{ color: '#6366f1' }}
// becomes style="color:#6366f1" on the element for Outlook compatibility`}</Code>
        </Card>

        {/* ── Architecture overview ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Architecture</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>How tierde-mail works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { step: '1', title: 'defineEmail / template', desc: 'JSX component + typed props + subject function. No rendering happens here.', color: '#ef4444' },
              { step: '2', title: 'mailer.send()', desc: 'Renders JSX to HTML string via React Server renderToStaticMarkup.', color: '#f97316' },
              { step: '3', title: 'CSS inlining', desc: '@css-inline/css-inline inlines <style> blocks for max email-client compat.', color: '#f59e0b' },
              { step: '4', title: 'Text fallback', desc: 'html-to-text generates a plain-text part automatically — no extra work needed.', color: '#84cc16' },
              { step: '5', title: 'Provider dispatch', desc: 'The configured provider (or strategy) delivers the final message.', color: '#10b981' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="tm-card" style={{
                background: `linear-gradient(135deg, rgba(15,23,42,0.9), ${color}08)`,
                border: `1px solid ${color}25`, borderRadius: '12px', padding: '1.1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ background: color, color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>{step}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace' }}>{title}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.55, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Ecosystem deps ── */}
        <Card style={{ marginBottom: '3rem' }}>
          <SectionLabel>Yedoma Labs Integration</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Built on the Yedoma Labs stack</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            tierde-mail uses other yedoma packages internally — the same stack you're already running.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { pkg: 'bylyt-env-guard',  color: '#06b6d4', use: 'validates SMTP/API key env vars at startup, not at send time — fails fast on misconfiguration' },
              { pkg: 'suruk-logger',     color: '#10b981', use: 'structured send/failure logs via Pino — correlate email traces with your app logs' },
              { pkg: 'tuuru-chrono-tz',  color: '#6366f1', use: 'locale-aware date formatting in Invoice and Notification templates (amounts, timestamps)' },
            ].map(({ pkg, color, use }) => (
              <div key={pkg} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                background: 'rgba(30,41,59,0.5)', borderRadius: '10px', padding: '0.9rem',
                border: `1px solid ${color}18`,
              }}>
                <div style={{ width: '3px', borderRadius: '2px', background: color, alignSelf: 'stretch', flexShrink: 0 }} />
                <div>
                  <div style={{ color, fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace', marginBottom: '0.2rem' }}>@yedoma-labs/{pkg}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5 }}>{use}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            @yedoma-labs/tierde-mail — v0.1.0
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="https://www.npmjs.com/package/@yedoma-labs/tierde-mail" target="_blank" rel="noopener noreferrer" style={{ color: '#fca5a5', fontSize: '0.8rem', fontFamily: 'monospace' }}>npm ↗</a>
            <a href="https://github.com/yedoma-labs/tierde-mail" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>GitHub ↗</a>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>← hub</Link>
          </div>
        </footer>
      </main>
    </>
  )
}
