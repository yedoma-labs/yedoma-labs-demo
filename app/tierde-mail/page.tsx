'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import pkg from '../../package.json'

const TIERDE_VERSION = (pkg.dependencies as Record<string, string>)['@yedoma-labs/tierde-mail']

type TemplateKey =
  | 'Welcome' | 'PasswordReset' | 'EmailVerification' | 'TwoFactorAuth'
  | 'MagicLink' | 'Invoice' | 'Notification' | 'SecurityAlert'
  | 'WeeklyDigest' | 'OnboardingProgress' | 'AbandonedCart' | 'ShippingUpdate'

type ProviderKey = 'resend' | 'smtp' | 'ses' | 'sendgrid' | 'postmark' | 'mailpit'

interface Theme { primary: string; accentBar: string; borderRadius: string; buttonBorderRadius: string }

const TEMPLATE_CATALOG = [
  { category: 'Authentication', color: '#6366f1', templates: [
    { name: 'Welcome', props: 'name, loginUrl' }, { name: 'EmailVerification', props: 'name, verifyUrl' },
    { name: 'MagicLink', props: 'email, loginUrl' }, { name: 'TwoFactorAuth', props: 'username, code' },
    { name: 'PasswordReset', props: 'username, resetUrl' }, { name: 'PasswordlessOtp', props: 'username, code' },
    { name: 'PhoneVerification', props: 'phoneNumber, code' },
  ]},
  { category: 'Account Management', color: '#0891b2', templates: [
    { name: 'RegistrationConfirmation', props: 'name, dashboardUrl' }, { name: 'ProfileUpdated', props: 'name, changes[]' },
    { name: 'PasswordChangedConfirmation', props: 'name, ...SecurityDetails?' }, { name: 'EmailChangeVerification', props: 'name, newEmail, verifyUrl' },
    { name: 'AccountDeactivated', props: 'name, reactivateUrl' }, { name: 'AccountLocked', props: 'name, reason, supportEmail?' },
    { name: 'AccountUnlocked', props: 'name, loginUrl' }, { name: 'AccountDeletionConfirmation', props: 'name, event, cancelUrl?' },
    { name: 'LoginActivity', props: 'name, events[] (LoginEvent)' }, { name: 'DataExportRequest', props: 'name, event, downloadUrl?, expiresAt?' },
  ]},
  { category: 'Security', color: '#ef4444', templates: [
    { name: 'SecurityAlert', props: 'name, event (7 types), reviewUrl, ...SecurityDetails?' },
  ]},
  { category: 'Commerce', color: '#10b981', templates: [
    { name: 'Invoice', props: 'customerName, invoiceNumber, items[], currency?' },
    { name: 'OrderConfirmation', props: 'customerName, orderNumber, items[], currency?' },
    { name: 'ShippingUpdate', props: 'customerName, orderNumber, status, trackingUrl?' },
    { name: 'AbandonedCart', props: 'name, cartUrl, items[], currency?' },
    { name: 'RefundConfirmation', props: 'customerName, amount, currency?, refundId, orderId?' },
    { name: 'PaymentFailed', props: 'customerName, amount?, currency?, reason?, updateUrl' },
    { name: 'BackInStock', props: 'name, productName, productUrl, imageUrl?' },
  ]},
  { category: 'Engagement', color: '#f59e0b', templates: [
    { name: 'NewsletterConfirmation', props: 'name, confirmUrl, unsubscribeUrl?' },
    { name: 'WeeklyDigest', props: 'name, weekOf, dashboardUrl, stats[]?, items[]?' },
    { name: 'WinBack', props: 'name, ctaUrl, discount?' },
    { name: 'Referral', props: 'name, event, referralUrl?, rewardDescription?' },
    { name: 'FeatureAnnouncement', props: 'name, featureName, changes[], ctaUrl' },
    { name: 'ReviewRequest', props: 'name, productName, reviewUrl, orderDate?' },
  ]},
  { category: 'Productivity', color: '#8b5cf6', templates: [
    { name: 'OnboardingProgress', props: 'name, steps[] (OnboardingStep), dashboardUrl' },
    { name: 'SupportTicket', props: 'name, ticketId, event, subject?, ctaUrl' },
    { name: 'TeamInvite', props: 'name, inviterName, teamName, inviteUrl' },
    { name: 'CommentMention', props: 'name, mentionedBy, event, contextUrl' },
    { name: 'UsageAlert', props: 'name, resource, used, limit, severity, ctaUrl' },
    { name: 'ExportReady', props: 'name, exportType, downloadUrl, expiresAt' },
    { name: 'MaintenanceNotification', props: 'name, event, startTime, endTime?, affectedServices[]?' },
    { name: 'Notification', props: 'title, body, ctaUrl?, ctaLabel?' },
  ]},
  { category: 'Billing', color: '#fb923c', templates: [
    { name: 'Subscription', props: 'name, event (7 types), plan, ctaUrl?' },
    { name: 'PolicyUpdate', props: 'name, policyType, changes[], effectiveDate, ctaUrl?' },
  ]},
]

const DEMO_TEMPLATES: { key: TemplateKey; icon: string; label: string; cat: string }[] = [
  { key: 'Welcome',            icon: '👋', label: 'Welcome',         cat: 'Auth'     },
  { key: 'TwoFactorAuth',      icon: '🛡️', label: '2FA Code',        cat: 'Auth'     },
  { key: 'MagicLink',          icon: '✨', label: 'Magic Link',      cat: 'Auth'     },
  { key: 'SecurityAlert',      icon: '🚨', label: 'Security Alert',  cat: 'Security' },
  { key: 'Invoice',            icon: '🧾', label: 'Invoice',         cat: 'Commerce' },
  { key: 'AbandonedCart',      icon: '🛒', label: 'Abandoned Cart',  cat: 'Commerce' },
  { key: 'ShippingUpdate',     icon: '📦', label: 'Shipping',        cat: 'Commerce' },
  { key: 'WeeklyDigest',       icon: '📊', label: 'Weekly Digest',   cat: 'Engage'   },
  { key: 'OnboardingProgress', icon: '🎯', label: 'Onboarding',      cat: 'Product'  },
  { key: 'PasswordReset',      icon: '🔑', label: 'Pwd Reset',       cat: 'Auth'     },
  { key: 'EmailVerification',  icon: '✉️', label: 'Verify Email',    cat: 'Auth'     },
  { key: 'Notification',       icon: '🔔', label: 'Notification',    cat: 'Product'  },
]

// ── MockEmail ─────────────────────────────────────────────────────────────────
function MockEmail({ template, theme }: { template: TemplateKey; theme: Theme }) {
  const { primary, accentBar, borderRadius, buttonBorderRadius } = theme
  const outer: React.CSSProperties = { background: '#f1f5f9', borderRadius: '12px', padding: '1.25rem', minHeight: '280px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }
  const card: React.CSSProperties = { background: '#ffffff', borderRadius, boxShadow: '0 4px 20px rgba(0,0,0,0.09)', width: '100%', maxWidth: '440px', overflow: 'hidden', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }
  const bar: React.CSSProperties = { height: '4px', background: accentBar }
  const body: React.CSSProperties = { padding: '1.5rem 1.5rem 1rem' }
  const h1: React.CSSProperties = { color: '#1e293b', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem', lineHeight: 1.3 }
  const p: React.CSSProperties = { color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 0.85rem' }
  const btn: React.CSSProperties = { display: 'inline-block', background: primary, color: '#fff', padding: '0.55rem 1.25rem', borderRadius: buttonBorderRadius, fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none', marginBottom: '1rem', cursor: 'default' }
  const div_: React.CSSProperties = { borderTop: '1px solid #e2e8f0' }
  const foot: React.CSSProperties = { padding: '0.75rem 1.5rem', color: '#94a3b8', fontSize: '0.68rem', textAlign: 'center' as const }
  const kv = (l: string, v: string, mono = false) => (
    <tr key={l}><td style={{ padding: '4px 0', color: '#6b7280', fontSize: '0.72rem', width: '40%' }}>{l}</td><td style={{ padding: '4px 0', color: '#0f172a', fontSize: mono ? '0.68rem' : '0.72rem', fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit' }}>{v}</td></tr>
  )

  if (template === 'TwoFactorAuth') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Your verification code</h1><p style={p}>Complete sign-in for <strong>alice.j</strong></p>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.28em', color: primary }}>847 293</span>
        <div style={{ color: '#94a3b8', fontSize: '0.67rem', marginTop: '3px' }}>Expires in 10 minutes</div>
      </div>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'Invoice') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div><h1 style={{ ...h1, marginBottom: '0.1rem' }}>Invoice</h1><div style={{ color: '#94a3b8', fontSize: '0.67rem', fontFamily: 'monospace' }}>#INV-2026-0042</div></div>
        <div style={{ textAlign: 'right' as const }}><div style={{ color: '#64748b', fontSize: '0.68rem' }}>Alice Johnson</div></div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem', marginBottom: '0.75rem' }}>
        <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}><th style={{ textAlign: 'left' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600 }}>Item</th><th style={{ textAlign: 'right' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600 }}>Price</th></tr></thead>
        <tbody>
          {[['Pro Plan (annual)', '$299.00'], ['Extra seats ×3', '$45.00']].map(([n, pv]) => (
            <tr key={n} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '4px 0', color: '#1e293b' }}>{n}</td><td style={{ padding: '4px 0', textAlign: 'right' as const, color: '#1e293b', fontWeight: 600 }}>{pv}</td></tr>
          ))}
          <tr><td style={{ padding: '5px 0', textAlign: 'right' as const, paddingRight: '0.5rem', color: '#94a3b8', fontSize: '0.68rem' }}>Total</td><td style={{ padding: '5px 0', textAlign: 'right' as const, color: primary, fontWeight: 800, fontSize: '0.9rem' }}>$344.00</td></tr>
        </tbody>
      </table>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>Pay Invoice</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'SecurityAlert') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#ef4444' }} /><div style={body}>
      <h1 style={h1}>Suspicious activity detected</h1><p style={p}>Hi Alice,</p>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <p style={{ color: '#7f1d1d', fontSize: '0.76rem', margin: 0, lineHeight: 1.5 }}>We detected unusual activity on your account. Please review and secure your account if needed.</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Time', 'Jun 17, 2026 — 14:32 UTC')}{kv('Device', 'Chrome on Windows 11')}{kv('Location', 'Moscow, Russia')}{kv('IP', '185.220.101.47', true)}
      </tbody></table>
      <a href="#" style={{ ...btn, background: '#ef4444' }} onClick={e => e.preventDefault()}>Review Activity</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'WeeklyDigest') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Week of Jun 9 – 15, 2026</h1><p style={p}>Hi Alice, here's your weekly roundup.</p>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '5px', marginBottom: '0.75rem' }}><tbody><tr>
        {[['1,247','Visitors','+12%'],['38','Sign-ups','+5%'],['$4,820','Revenue','+18%']].map(([v,l,c]) => (
          <td key={l} style={{ textAlign: 'center' as const, padding: '8px 5px', background: '#f8fafc', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginTop: '2px' }}>{l}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#16a34a', marginTop: '1px' }}>{c}</div>
          </td>
        ))}
      </tr></tbody></table>
      {[{ t: 'New Slack integration', m: 'Product · 2d ago' }, { t: 'Dashboard load -40%', m: 'Engineering · 4d ago' }].map(i => (
        <div key={i.t} style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{i.m}</div>
          <div style={{ fontWeight: 600, fontSize: '0.76rem', color: '#0f172a' }}>{i.t}</div>
        </div>
      ))}
      <a href="#" style={{ ...btn, marginTop: '0.75rem' }} onClick={e => e.preventDefault()}>View All Activity</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'OnboardingProgress') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>3 of 5 steps complete</h1><p style={p}>Hi Alice, making great progress! Complete the remaining steps.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {[['Create account', true], ['Verify email', true], ['Connect data source', true], ['Invite team', false], ['First workflow', false]].map(([t, done]) => (
          <tr key={t as string} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '6px 0', fontSize: '0.76rem', color: done ? '#16a34a' : '#1e293b', fontWeight: 600 }}>{t}</td>
            <td style={{ padding: '6px 0', textAlign: 'right' as const }}>
              <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '10px', fontSize: '0.62rem', fontWeight: 700, background: done ? '#dcfce7' : '#f1f5f9', color: done ? '#166534' : '#475569' }}>{done ? '✓ Done' : 'To do'}</span>
            </td>
          </tr>
        ))}
      </tbody></table>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>Continue Setup</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'AbandonedCart') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Your cart is waiting</h1><p style={p}>Hi Alice, you left items behind. Complete your purchase before they sell out.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem', marginBottom: '0.75rem' }}><tbody>
        {[['Wireless Headphones Pro', '$129.00'], ['USB-C Hub 7-in-1', '$49.00']].map(([n, pv]) => (
          <tr key={n} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={{ padding: '4px 0', color: '#1e293b', fontWeight: 600 }}>{n}</td><td style={{ padding: '4px 0', textAlign: 'right' as const, color: '#1e293b', fontWeight: 600 }}>{pv}</td></tr>
        ))}
        <tr><td style={{ padding: '5px 0', fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>Total</td><td style={{ padding: '5px 0', textAlign: 'right' as const, fontWeight: 800, color: primary, fontSize: '0.85rem' }}>$178.00</td></tr>
      </tbody></table>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>Complete Purchase</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'ShippingUpdate') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Your order is on its way!</h1><p style={p}><strong>#ORD-2026-0892</strong> has shipped and is heading your way.</p>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.76rem' }}>📦 Shipped</div>
        <div style={{ color: '#166534', fontSize: '0.7rem', marginTop: '1px' }}>Est. delivery: Jun 20 – 21, 2026</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Carrier', 'DHL Express')}{kv('Tracking', '1Z999AA1012345678', true)}
      </tbody></table>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>Track Shipment</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  const CONTENT: Record<string, { h: string; b: string; cta: string }> = {
    Welcome:          { h: 'Welcome to Acme!',    b: 'Your account is ready. Click below to get started.',                           cta: 'Get Started →' },
    PasswordReset:    { h: 'Reset your password', b: 'You requested a password reset for alice.j. Link expires in 1 hour.',           cta: 'Reset Password →' },
    EmailVerification:{ h: 'Verify your email',   b: 'Click below to verify alice@example.com and activate your account.',            cta: 'Verify Email →' },
    MagicLink:        { h: 'Sign in to Acme',     b: 'Click below to sign in as alice@example.com. Link expires in 15 minutes.',       cta: 'Sign In →' },
    Notification:     { h: 'New device logged in',b: 'A new device signed into your account from Berlin, Germany.',                   cta: 'Review Activity →' },
  }
  const c = CONTENT[template] ?? CONTENT['Welcome']
  return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>{c.h}</h1><p style={p}>{c.b}</p>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>{c.cta}</a>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>Didn't request this? You can safely ignore.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )
}

// ── BatchDemo ─────────────────────────────────────────────────────────────────
type BatchItemState = { email: string; name: string; status: 'pending' | 'sending' | 'sent' | 'failed' }

function BatchDemo() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [items, setItems] = useState<BatchItemState[]>([
    { email: 'alice@acme.com',   name: 'Alice',   status: 'pending' },
    { email: 'bob@acme.com',     name: 'Bob',     status: 'pending' },
    { email: 'carol@acme.com',   name: 'Carol',   status: 'pending' },
    { email: 'dave@acme.com',    name: 'Dave',    status: 'pending' },
    { email: 'eve@acme.com',     name: 'Eve',     status: 'pending' },
    { email: 'frank@acme.com',   name: 'Frank',   status: 'pending' },
    { email: 'grace@acme.com',   name: 'Grace',   status: 'pending' },
    { email: 'henry@acme.com',   name: 'Henry',   status: 'failed'  }, // simulate failure
  ])
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runBatch = () => {
    setRunning(true)
    setDone(false)
    setItems(prev => prev.map(i => ({ ...i, status: 'pending' as const })))
    let idx = 0
    const tick = () => {
      setItems(prev => {
        const next = [...prev]
        if (idx < next.length) {
          next[idx] = { ...next[idx]!, status: 'sending' as const }
          if (idx > 0) {
            const fail = next[idx - 1]!.name === 'Henry'
            next[idx - 1] = { ...next[idx - 1]!, status: fail ? 'failed' as const : 'sent' as const }
          }
        } else if (idx === next.length) {
          const last = next[idx - 1]!
          next[idx - 1] = { ...last, status: last.name === 'Henry' ? 'failed' as const : 'sent' as const }
          setRunning(false)
          setDone(true)
          return next
        }
        return next
      })
      idx++
      if (idx <= items.length) rafRef.current = setTimeout(tick, 280)
    }
    tick()
  }

  useEffect(() => () => { if (rafRef.current) clearTimeout(rafRef.current) }, [])

  const sent = items.filter(i => i.status === 'sent').length
  const failed = items.filter(i => i.status === 'failed').length

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.25rem', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#475569', letterSpacing: '0.08em' }}>BATCH SEND SIMULATION</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {done && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>sent {sent} · failed {failed}</span>}
          <button onClick={runBatch} disabled={running} style={{
            padding: '0.3rem 0.85rem', borderRadius: '6px', fontSize: '0.74rem', cursor: running ? 'default' : 'pointer',
            background: running ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
            color: running ? '#64748b' : '#a5b4fc', fontFamily: 'monospace',
          }}>{running ? '⏳ sending…' : done ? '↺ replay' : '▶ run batch'}</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {items.map(item => {
          const icon = item.status === 'sent' ? '✓' : item.status === 'failed' ? '✗' : item.status === 'sending' ? '⟳' : '·'
          const color = item.status === 'sent' ? '#34d399' : item.status === 'failed' ? '#f87171' : item.status === 'sending' ? '#fbbf24' : '#334155'
          return (
            <div key={item.email} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.74rem', padding: '0.2rem 0' }}>
              <span style={{ color, width: '14px', flexShrink: 0, transition: 'color 0.2s', animation: item.status === 'sending' ? 'spin 0.8s linear infinite' : 'none' }}>{icon}</span>
              <span style={{ color: '#94a3b8', width: '155px' }}>{item.email}</span>
              <span style={{ color: '#334155', fontSize: '0.7rem' }}>
                {item.status === 'sent' && <span style={{ color: '#34d399' }}>delivered</span>}
                {item.status === 'failed' && <span style={{ color: '#f87171' }}>bounce (retry later)</span>}
                {item.status === 'sending' && <span style={{ color: '#fbbf24' }}>in flight…</span>}
                {item.status === 'pending' && <span style={{ color: '#334155' }}>queued</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={copy} style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`, color: copied ? '#34d399' : '#64748b', borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontFamily: 'monospace', cursor: 'pointer', zIndex: 1 }}>{copied ? '✓ copied' : 'copy'}</button>
      <pre style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.25rem 1.5rem', overflow: 'auto', fontSize: '0.76rem', lineHeight: 1.7, color: '#e2e8f0', fontFamily: '"Fira Code","Cascadia Code",monospace', margin: 0 }}><code>{children}</code></pre>
    </div>
  )
}

function Label({ children }: { children: string }) {
  return <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '1rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#fca5a5', fontFamily: 'monospace' }}>{children}</div>
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#0c1a30 100%)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '2rem', ...style }}>{children}</div>
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'monospace', cursor: 'pointer', fontWeight: active ? 700 : 400, background: active ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, color: active ? '#fca5a5' : '#64748b' }}>{children}</button>
}

const PROVIDER_CODE: Record<ProviderKey, string> = {
  resend:   `const mailer = createMailer({ provider: resend({ apiKey: process.env.RESEND_API_KEY! }), from: 'hello@acme.com' })`,
  smtp:     `const mailer = createMailer({ provider: smtp({ host: 'smtp.acme.com', port: 587, auth: { user: '...', pass: '...' } }), from: 'hello@acme.com' })`,
  ses:      `const mailer = createMailer({ provider: ses({ client: new SESClient({ region: 'us-east-1' }) }), from: 'hello@acme.com' })`,
  sendgrid: `const mailer = createMailer({ provider: sendgrid({ apiKey: process.env.SENDGRID_API_KEY! }), from: 'hello@acme.com' })`,
  postmark: `const mailer = createMailer({ provider: postmark({ serverToken: process.env.POSTMARK_TOKEN! }), from: 'hello@acme.com' })`,
  mailpit:  `import { mailpit } from '@yedoma-labs/tierde-mail/providers/mailpit'\n\n// Zero-config — targets localhost:1025 (Mailpit default)\nconst mailer = createMailer({ provider: mailpit(), from: 'dev@localhost' })\n\n// Docker or custom host:\n// mailpit({ host: 'mailpit', port: 1025 })\n\n// Or via createMailerFromEnv:\n// TIERDE_PROVIDER=mailpit  (optional: MAILPIT_HOST, MAILPIT_PORT)`,
}

const TEMPLATE_CODE: Record<TemplateKey, string> = {
  Welcome:           `await mailer.send(Welcome, { to: 'alice@example.com', props: { name: 'Alice', loginUrl: 'https://app.acme.com/start', appName: 'Acme' } })`,
  PasswordReset:     `await mailer.send(PasswordReset, { to: 'alice@example.com', props: { username: 'alice.j', resetUrl: 'https://app.acme.com/reset/tok_abc', appName: 'Acme' } })`,
  EmailVerification: `await mailer.send(EmailVerification, { to: 'alice@example.com', props: { name: 'Alice', verifyUrl: 'https://app.acme.com/verify/tok_xyz', appName: 'Acme' } })`,
  TwoFactorAuth:     `await mailer.send(TwoFactorAuth, { to: 'alice@example.com', props: { username: 'alice.j', code: '847 293', appName: 'Acme' } })`,
  MagicLink:         `await mailer.send(MagicLink, { to: 'alice@example.com', props: { email: 'alice@example.com', loginUrl: 'https://app.acme.com/magic/tok_m4g1c', appName: 'Acme' } })`,
  Invoice:           `await mailer.send(Invoice, { to: 'alice@example.com', props: {\n  customerName: 'Alice Johnson', invoiceNumber: 'INV-2026-0042',\n  items: [{ name: 'Pro Plan', quantity: 1, price: 29900 }, { name: 'Extra seats ×3', quantity: 3, price: 4500 }],\n  currency: 'USD', appName: 'Acme',\n} })`,
  Notification:      `await mailer.send(Notification, { to: 'alice@example.com', props: { title: 'New device logged in', body: 'A new device signed in from Berlin, Germany.', appName: 'Acme' } })`,
  SecurityAlert:     `await mailer.send(SecurityAlert, { to: 'alice@example.com', props: {\n  name: 'Alice', event: 'suspicious_activity', reviewUrl: 'https://app.acme.com/security',\n  ipAddress: '185.220.101.47', location: 'Moscow, Russia', device: 'Chrome on Windows 11',\n  timestamp: 'Jun 17, 2026 — 14:32 UTC', appName: 'Acme',\n} })`,
  WeeklyDigest:      `await mailer.send(WeeklyDigest, { to: 'alice@example.com', props: {\n  name: 'Alice', weekOf: 'Jun 9 – 15, 2026', dashboardUrl: 'https://app.acme.com/dashboard',\n  stats: [{ label: 'Visitors', value: '1,247', change: '+12%', positive: true }, ...],\n  items: [{ title: 'New Slack integration', url: '...', category: 'Product', meta: '2 days ago' }],\n} })`,
  OnboardingProgress:`await mailer.send(OnboardingProgress, { to: 'alice@example.com', props: {\n  name: 'Alice', dashboardUrl: 'https://app.acme.com/onboarding',\n  steps: [\n    { title: 'Create account', completed: true },\n    { title: 'Verify email', completed: true },\n    { title: 'Invite team', completed: false, url: 'https://app.acme.com/team' },\n  ],\n} })`,
  AbandonedCart:     `await mailer.send(AbandonedCart, { to: 'alice@example.com', props: {\n  name: 'Alice', cartUrl: 'https://shop.acme.com/cart/tok_123', currency: 'USD',\n  items: [{ name: 'Wireless Headphones Pro', price: 12900 }, { name: 'USB-C Hub 7-in-1', price: 4900 }],\n} })`,
  ShippingUpdate:    `await mailer.send(ShippingUpdate, { to: 'alice@example.com', props: {\n  customerName: 'Alice Johnson', orderNumber: 'ORD-2026-0892',\n  status: 'shipped', trackingUrl: 'https://track.dhl.com/1Z999AA1012345678',\n} })`,
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TierdeMailPage() {
  const [activeTemplate, setActiveTemplate]   = useState<TemplateKey>('Welcome')
  const [activeProvider, setActiveProvider]   = useState<ProviderKey>('resend')
  const [theme, setTheme]                     = useState<Theme>({ primary: '#4f46e5', accentBar: '#4f46e5', borderRadius: '12px', buttonBorderRadius: '8px' })
  const [strategy, setStrategy]               = useState<'failover' | 'round-robin'>('failover')
  const [catFilter, setCatFilter]             = useState('All')
  const [webhookProvider, setWebhookProvider] = useState<'resend' | 'postmark'>('resend')

  const totalTemplates = TEMPLATE_CATALOG.reduce((n, c) => n + c.templates.length, 0)
  const allCats = ['All', ...TEMPLATE_CATALOG.map(c => c.category)]
  const filteredCatalog = catFilter === 'All' ? TEMPLATE_CATALOG : TEMPLATE_CATALOG.filter(c => c.category === catFilter)

  return (
    <>
      <style>{`
        html,body { background:#0f172a !important; } * { box-sizing:border-box; } a { text-decoration:none; }
        @keyframes aurora-sweep { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
        @keyframes blink-cursor { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes float-slow   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        @keyframes spin         { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .tm-card { transition:transform .2s,box-shadow .2s; } .tm-card:hover { transform:translateY(-2px); }
      `}</style>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '2rem' }}>← back to hub</Link>

        {/* ── Hero ── */}
        <div style={{ borderRadius: '28px', padding: '4rem 3rem 3.5rem', marginBottom: '3rem', border: '1px solid rgba(239,68,68,0.25)', background: 'linear-gradient(135deg,#1a0505 0%,#2d0a0a 30%,#1a0a1a 60%,#0f0f1a 100%)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(45deg,transparent 20%,rgba(239,68,68,0.06) 40%,rgba(251,146,60,0.04) 60%,transparent 80%)', backgroundSize: '400% 400%', animation: 'aurora-sweep 12s ease infinite' }} />
          <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(239,68,68,0.1) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'float-slow 5s ease-in-out infinite' }}>📬</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'blink-cursor 1.5s ease-in-out infinite' }} />
              @yedoma-labs/tierde-mail — v{TIERDE_VERSION}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1rem', background: 'linear-gradient(135deg,#fecaca 0%,#fb923c 50%,#fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>tierde-mail</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 0.5rem', lineHeight: 1.65 }}>JSX email templates · multi-provider · TypeScript-first</p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace', margin: '0 auto 2rem' }}>// тиэрдэ — "to deliver · to convey" (Sakha)</p>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.75rem' }}>
              {[`${totalTemplates} Templates`, '6 Providers', 'sendBatch + Rate Limiting', 'Webhooks (Resend · Postmark)', 'React <EmailPreview>', 'mailpit local dev', 'Unsubscribe Headers', 'tierde dev · send · render'].map(t => (
                <span key={t} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '100px', padding: '0.28rem 0.75rem', fontSize: '0.72rem', color: '#fca5a5', fontFamily: 'monospace' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <a href="https://www.npmjs.com/package/@yedoma-labs/tierde-mail" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 600 }}>npm ↗</a>
              <a href="https://github.com/yedoma-labs/tierde-mail" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>GitHub ↗</a>
            </div>
          </div>
        </div>

        {/* ── Install ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Install</Label>
          <Code>{`npm install @yedoma-labs/tierde-mail
pnpm add @yedoma-labs/tierde-mail`}</Code>
        </Card>

        {/* ── CLI — tierde dev ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>CLI — tierde dev</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>One-command email preview server</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Starts a local preview server with all {totalTemplates} built-in templates and canonical sample data — no config, no script needed.
          </p>
          <Code>{`# Start the preview server with all 41 templates + sample data:
npx tierde dev
# → http://localhost:3000
#   - live reload via SSE (auto-refreshes on file change)
#   - dark mode toggle (injects color-scheme:dark into iframe)
#   - compare mode (side-by-side iframe with independent selectors)

npx tierde dev --port 4000  # custom port

# Render a single template to HTML (no server):
npx tierde render Welcome --props '{"name":"Alice","loginUrl":"https://app.com/start"}'
npx tierde render Invoice --props '{"customerName":"Alice","invoiceNumber":"INV-001","items":[]}' -o invoice.html
npx tierde render Welcome --text  # plain-text output

# Smoke-test real delivery via TIERDE_PROVIDER env:
npx tierde send Welcome --to alice@example.com --props '{"name":"Alice","loginUrl":"..."}'

# Eject built-in templates for full customization:
npx tierde eject --list                # print all 41 template names (pipe-friendly)
npx tierde eject --all emails/         # eject all 41 into emails/ directory
npx tierde eject Welcome PasswordReset # eject specific templates`}</Code>
        </Card>

        {/* ── Quick Start ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Quick Start</Label>
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

        {/* ── createMailerFromEnv ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>createMailerFromEnv</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Zero-config mailer from env vars</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Bootstrapped via <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>bylyt-env-guard</code> — validates at startup, fails fast on misconfiguration, never at send time.
          </p>
          <Code>{`import { createMailerFromEnv } from '@yedoma-labs/tierde-mail'

const mailer = createMailerFromEnv()

// TIERDE_PROVIDER    resend | smtp | ses | sendgrid | postmark | mailpit
// TIERDE_FROM_EMAIL  hello@acme.com
// TIERDE_FROM_NAME   Acme (optional)
//
// resend:    RESEND_API_KEY
// smtp:      SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASS, SMTP_SECURE
// ses:       SES_REGION (or AWS_REGION)
// sendgrid:  SENDGRID_API_KEY
// postmark:  POSTMARK_SERVER_TOKEN
// mailpit:   MAILPIT_HOST (localhost), MAILPIT_PORT (1025)

// Swap providers without changing application code:
// TIERDE_PROVIDER=mailpit pnpm dev    ← captures to local Mailpit
// TIERDE_PROVIDER=resend  pnpm start  ← delivers for real`}</Code>
        </Card>

        {/* ── sendBatch ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>sendBatch</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Send one template to many recipients</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Chunk-based concurrency, per-item failure isolation, real-time <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>onResult</code> callbacks, and token-bucket rate limiting (v0.4.0).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <BatchDemo />
            <Code>{`import { Welcome } from '@yedoma-labs/tierde-mail/templates'

const { results, sent, failed } = await mailer.sendBatch(Welcome, {
  recipients: [
    { to: 'alice@acme.com',   props: { name: 'Alice', loginUrl: '...' } },
    { to: 'bob@acme.com',     props: { name: 'Bob',   loginUrl: '...' } },
    { to: 'carol@acme.com',   props: { name: 'Carol', loginUrl: '...' } },
    // ... as many as you need
  ],

  // Concurrency + inter-chunk delay (default: 5 concurrent, 0ms delay)
  concurrency: 3,
  delayMs: 500,   // 500ms between chunks (for conservative providers)

  // Per-item progress callback (fires after each send attempt)
  onResult(item) {
    if (item.error) {
      console.error('Failed:', item.to, item.error.message)
    } else {
      console.log('Sent:', item.to, item.result?.id)
    }
  },
})

console.log(\`Sent: \${sent}, Failed: \${failed}\`)`}</Code>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }}>Rate limiting — v0.4.0: maxPerSecond (token-bucket)</div>
          <Code>{`// Token-bucket: ≤N sends per second regardless of concurrency
// Ideal for Resend free tier (2 req/s) or provider API limits
const result = await mailer.sendBatch(NewsletterEmail, {
  recipients: subscribers.map(s => ({
    to: s.email,
    props: { name: s.name, unsubscribeToken: s.token },
  })),
  concurrency: 5,
  maxPerSecond: 2,  // overrides delayMs when set; result order preserved
  onResult(item) {
    db.updateEmailStatus(item.to as string, item.error ? 'failed' : 'sent')
  },
})

// Testing sendBatch:
import { captureEmails } from '@yedoma-labs/tierde-mail/testing'
const { mailer, inbox } = captureEmails()
await mailer.sendBatch(Welcome, { recipients: users, concurrency: 3 })
expect(inbox).toHaveLength(users.length)`}</Code>
        </Card>

        {/* ── Webhooks ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Webhooks</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Resend · Postmark — normalized events, HMAC verified</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Constant-time HMAC-SHA256 verification. Normalized <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>WebhookEvent</code> shape across providers — swap providers without rewriting event handlers.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Tab active={webhookProvider === 'resend'} onClick={() => setWebhookProvider('resend')}>Resend (Svix)</Tab>
            <Tab active={webhookProvider === 'postmark'} onClick={() => setWebhookProvider('postmark')}>Postmark (HMAC)</Tab>
          </div>
          {webhookProvider === 'resend' ? (
            <Code>{`import { createResendWebhookHandler } from '@yedoma-labs/tierde-mail/webhooks'

const handler = createResendWebhookHandler({
  secret: process.env.RESEND_WEBHOOK_SECRET!, // whsec_... from Resend dashboard
  toleranceSeconds: 300, // default — reject events older than 5 min
})

// Next.js App Router  (use raw body — don't parse as JSON first)
export async function POST(request: Request) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers)

  let event
  try {
    event = handler.verify(body, headers)  // throws WebhookVerificationError on bad sig
  } catch (err) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Normalized event shape — same across all providers:
  // event.type:      'email.delivered' | 'email.bounced' | 'email.complained'
  //                | 'email.opened' | 'email.clicked' | 'email.sent'
  //                | 'email.delivery_delayed' | 'email.subscription_changed'
  // event.provider:  'resend'
  // event.email:     { id, to[], from, subject?, timestamp }
  // event.raw:       original parsed payload (provider-specific fields)

  switch (event.type) {
    case 'email.bounced':
      await db.markEmailBounced(event.email.to[0], event.email.id)
      break
    case 'email.complained':
      await db.unsubscribeUser(event.email.to[0])
      break
    case 'email.opened':
      await analytics.trackOpen(event.email.id, event.email.timestamp)
      break
  }

  return new Response('OK')
}`}</Code>
          ) : (
            <Code>{`import { createPostmarkWebhookHandler, WebhookVerificationError } from '@yedoma-labs/tierde-mail/webhooks'

const handler = createPostmarkWebhookHandler({
  token: process.env.POSTMARK_WEBHOOK_TOKEN!, // from Postmark stream settings
})

// Express (requires express.raw() or express.text() middleware for this route)
app.post('/webhooks/postmark',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    let event
    try {
      event = handler.verify(req.body, req.headers as Record<string, string>)
    } catch (err) {
      if (err instanceof WebhookVerificationError) return res.sendStatus(401)
      throw err
    }

    // Same normalized shape as Resend handler:
    // event.provider === 'postmark'
    // event.type: 'email.delivered' | 'email.bounced' | 'email.complained' | ...
    // event.email: { id, to[], from, subject?, timestamp }
    // event.raw: original Postmark payload

    if (event.type === 'email.bounced') {
      queue.enqueue('suppress-email', { address: event.email.to[0] })
    }

    res.sendStatus(200)
  }
)`}</Code>
          )}
        </Card>

        {/* ── mailpit local dev ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Local Dev — mailpit</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Zero-config email capture for development</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            The <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>mailpit()</code> provider targets <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>localhost:1025</code> — compatible with{' '}
            <a href="https://mailpit.axllent.org" target="_blank" rel="noopener noreferrer" style={{ color: '#fca5a5' }}>Mailpit</a> and MailHog. No API key, no config, no test emails sent to real addresses.
          </p>
          <Code>{`import { createMailer } from '@yedoma-labs/tierde-mail'
import { mailpit } from '@yedoma-labs/tierde-mail/providers/mailpit'

// Zero-config — targets localhost:1025
const mailer = createMailer({ provider: mailpit(), from: 'dev@localhost' })

// Docker Compose setup:
// mailpit({ host: 'mailpit', port: 1025 })

// Or via createMailerFromEnv:
// TIERDE_PROVIDER=mailpit
// MAILPIT_HOST=mailpit   (optional, for Docker)
// MAILPIT_PORT=1025      (optional)

// Start Mailpit (web UI at http://localhost:8025):
// docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
// brew install mailpit && mailpit

// All sends are captured locally — never delivered externally
await mailer.send(Welcome, { to: 'alice@example.com', props: { name: 'Alice', loginUrl: '...' } })
// → appears at http://localhost:8025 with full HTML rendering`}</Code>
        </Card>

        {/* ── React <EmailPreview> ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>React Integration</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>{'<EmailPreview>'} + renderEmailHtml — embed in admin panels</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Render an email HTML string inside an isolated <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{'<iframe srcDoc>'}</code> — no sandboxing workarounds needed. Use in Next.js admin pages, Storybook, or any React app.
          </p>
          <Code>{`// app/admin/email-preview/page.tsx — Next.js Server Component
import { renderEmailHtml } from '@yedoma-labs/tierde-mail/react'
import { EmailPreview }    from '@yedoma-labs/tierde-mail/react'
import { Welcome }         from '@yedoma-labs/tierde-mail/templates'

// renderEmailHtml runs server-side: React SSR + CSS inlining
const html = renderEmailHtml(Welcome, {
  name: 'Alice',
  loginUrl: 'https://app.acme.com/start',
  appName: 'Acme',
})

export default function Page() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Email Preview</h1>
      {/* Isolated iframe — email CSS can't leak into the admin UI */}
      <EmailPreview
        html={html}
        style={{ height: '600px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
        title="Welcome email preview"
      />
    </div>
  )
}

// Dynamic preview with template selector + custom props:
// app/admin/email-preview/[template]/route.ts
export async function GET(req: Request, { params }: { params: { template: string } }) {
  const { template: name } = params
  const templates = await import('@yedoma-labs/tierde-mail/templates')
  const template = templates[name as keyof typeof templates]
  if (!template) return new Response('Not found', { status: 404 })

  const propsParam = new URL(req.url).searchParams.get('props')
  const props = propsParam ? JSON.parse(propsParam) : {}
  const html = renderEmailHtml(template as any, props)

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}`}</Code>
        </Card>

        {/* ── unsubscribeHeaders ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Unsubscribe Headers</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>RFC 8058 one-click unsubscribe compliance</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Required by Gmail and Yahoo for bulk senders (&gt;5,000 messages/day) since February 2024. Generates <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>List-Unsubscribe</code> and <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>List-Unsubscribe-Post</code> headers.
          </p>
          <Code>{`import { unsubscribeHeaders } from '@yedoma-labs/tierde-mail'
import { NewsletterConfirmation, WeeklyDigest } from '@yedoma-labs/tierde-mail/templates'

// Spread directly into SendOptions.headers:
await mailer.send(WeeklyDigest, {
  to: subscriber.email,
  props: { name: subscriber.name, weekOf: '...', dashboardUrl: '...' },
  headers: unsubscribeHeaders({
    url: \`https://app.acme.com/unsubscribe?token=\${subscriber.unsubToken}\`,
    email: 'unsubscribe@acme.com',  // optional mailto: fallback
    oneClick: true,                  // default — adds List-Unsubscribe-Post header
  }),
})

// Generates:
//   List-Unsubscribe: <https://app.acme.com/unsubscribe?token=...>, <mailto:unsubscribe@acme.com>
//   List-Unsubscribe-Post: List-Unsubscribe=One-Click

// In sendBatch — per-recipient unsubscribe URLs:
await mailer.sendBatch(WeeklyDigest, {
  recipients: subscribers.map(s => ({
    to: s.email,
    props: { name: s.name, weekOf: currentWeek, dashboardUrl: '...' },
    headers: unsubscribeHeaders({ url: \`https://app.acme.com/unsub?t=\${s.token}\` }),
  })),
  maxPerSecond: 10,
})`}</Code>
        </Card>

        {/* ── Template Preview ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Template Preview</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>{totalTemplates} production-ready templates</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            All from <code style={{ fontFamily: 'monospace', color: '#fca5a5', fontSize: '0.78rem' }}>@yedoma-labs/tierde-mail/templates</code> · each accepts <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem' }}>BaseTemplateProps</code>: <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem' }}>appName? locale? dir? theme? strings?</code>
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {DEMO_TEMPLATES.map(t => (
              <button key={t.key} onClick={() => setActiveTemplate(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '8px', background: activeTemplate === t.key ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeTemplate === t.key ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, color: activeTemplate === t.key ? '#fca5a5' : '#64748b', fontSize: '0.72rem', fontWeight: activeTemplate === t.key ? 700 : 400, fontFamily: 'monospace', cursor: 'pointer' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.67rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>LIVE PREVIEW</div>
              <MockEmail template={activeTemplate} theme={theme} />
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.67rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>SEND CALL</div>
              <Code>{TEMPLATE_CODE[activeTemplate]}</Code>
            </div>
          </div>
        </Card>

        {/* ── Theme customization ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Theme Customization</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>createTheme — 18 design tokens, live preview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {[{ label: 'primary', key: 'primary' as const }, { label: 'accentBar', key: 'accentBar' as const }].map(({ label, key }) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input type="color" value={theme[key]} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value, ...(key === 'primary' ? { accentBar: e.target.value } : {}) }))} style={{ width: '38px', height: '28px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '2px', background: 'none' }} />
                      <code style={{ color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'monospace' }}>{theme[key]}</code>
                    </div>
                  </label>
                ))}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace' }}>borderRadius</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {['0px','4px','8px','12px','16px'].map(r => <Tab key={r} active={theme.borderRadius === r} onClick={() => setTheme(t => ({ ...t, borderRadius: r }))}>{r}</Tab>)}
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace' }}>buttonBorderRadius</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {['0px','4px','8px','100px'].map(r => <Tab key={r} active={theme.buttonBorderRadius === r} onClick={() => setTheme(t => ({ ...t, buttonBorderRadius: r }))}>{r}</Tab>)}
                  </div>
                </label>
              </div>
              <Code>{`import { createTheme } from '@yedoma-labs/tierde-mail'

const myTheme = createTheme({
  primary: '${theme.primary}',
  accentBar: '${theme.accentBar}',
  borderRadius: '${theme.borderRadius}',
  buttonBorderRadius: '${theme.buttonBorderRadius}',
  // All 18 tokens:
  // primaryHover, primaryText, secondary, secondaryText,
  // background, cardBackground, textPrimary, textSecondary,
  // textMuted, border, fontFamily, maxWidth, logo?, logoAlt?, logoWidth?
})`}</Code>
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.67rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>LIVE PREVIEW</div>
              <MockEmail template="Welcome" theme={theme} />
            </div>
          </div>
        </Card>

        {/* ── Full template catalog ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Full Template Catalog</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>{totalTemplates} templates across 7 categories</h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {allCats.map(cat => <Tab key={cat} active={catFilter === cat} onClick={() => setCatFilter(cat)}>{cat}</Tab>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredCatalog.map(({ category, color, templates }) => (
              <div key={category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ color, fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{category}</span>
                  <span style={{ color: '#334155', fontSize: '0.67rem' }}>{templates.length} templates</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '0.45rem' }}>
                  {templates.map(t => (
                    <div key={t.name} className="tm-card" style={{ background: `linear-gradient(135deg,rgba(15,23,42,0.9),${color}08)`, border: `1px solid ${color}22`, borderRadius: '9px', padding: '0.65rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace' }}>{t.name}</span>
                      <span style={{ color: '#475569', fontSize: '0.68rem', fontFamily: 'monospace' }}>{t.props}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Providers ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Provider Setup</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>6 providers — swap without changing send logic</h2>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {(['resend', 'smtp', 'ses', 'sendgrid', 'postmark', 'mailpit'] as ProviderKey[]).map(p => <Tab key={p} active={activeProvider === p} onClick={() => setActiveProvider(p)}>{p}</Tab>)}
          </div>
          <Code>{`import { createMailer } from '@yedoma-labs/tierde-mail'
import { ${activeProvider} } from '@yedoma-labs/tierde-mail/providers/${activeProvider}'

${PROVIDER_CODE[activeProvider]}`}</Code>
          {activeProvider === 'smtp' && <div style={{ marginTop: '0.75rem', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.78rem', color: '#67e8f9' }}>Optional dep: <code style={{ fontFamily: 'monospace' }}>pnpm add nodemailer</code></div>}
          {activeProvider === 'ses' && <div style={{ marginTop: '0.75rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.78rem', color: '#fcd34d' }}>Dep: <code style={{ fontFamily: 'monospace' }}>pnpm add @aws-sdk/client-ses</code></div>}
          {activeProvider === 'mailpit' && <div style={{ marginTop: '0.75rem', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.78rem', color: '#6ee7b7' }}>Start Mailpit: <code style={{ fontFamily: 'monospace' }}>docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit</code> or <code style={{ fontFamily: 'monospace' }}>brew install mailpit && mailpit</code></div>}
        </Card>

        {/* ── Multi-provider ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Multi-Provider Strategies</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Failover · Round-robin</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Tab active={strategy === 'failover'} onClick={() => setStrategy('failover')}>failover</Tab>
            <Tab active={strategy === 'round-robin'} onClick={() => setStrategy('round-robin')}>round-robin</Tab>
          </div>
          {strategy === 'failover' ? (
            <Code>{`const mailer = createMailer({
  providers: [
    resend({ apiKey: process.env.RESEND_API_KEY! }),
    smtp({ host: 'smtp.acme.com', port: 587, auth: { user: '...', pass: '...' } }),
  ],
  strategy: 'failover',  // tries resend first, falls back to SMTP on failure
  from: 'hello@acme.com',
})`}</Code>
          ) : (
            <Code>{`const mailer = createMailer({
  providers: [
    resend({ apiKey: process.env.RESEND_API_KEY! }),
    sendgrid({ apiKey: process.env.SENDGRID_API_KEY! }),
    postmark({ serverToken: process.env.POSTMARK_TOKEN! }),
  ],
  strategy: 'round-robin',  // distributes load evenly
  from: 'hello@acme.com',
})
// send 1 → resend · send 2 → sendgrid · send 3 → postmark → resend → …`}</Code>
          )}
        </Card>

        {/* ── defineEmail ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>defineEmail API</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Custom templates — TypeScript inference end-to-end</h2>
          <Code>{`import { defineEmail, EmailTemplate, Heading, Text, Button, AlertBox, KeyValueTable } from '@yedoma-labs/tierde-mail'
import type { BaseTemplateProps } from '@yedoma-labs/tierde-mail/templates'

interface TrialExpiringStrings { heading: string; cta: string }

interface TrialExpiringProps extends BaseTemplateProps<TrialExpiringStrings> {
  name: string
  daysLeft: number
  upgradeUrl: string
  currentPlan: string
}

const TrialExpiring = defineEmail<TrialExpiringProps>({
  subject: ({ name, daysLeft }) => \`\${name}, trial ends in \${daysLeft} day\${daysLeft === 1 ? '' : 's'}\`,
  component: ({ name, daysLeft, upgradeUrl, currentPlan, strings, theme }) => {
    const s = { heading: 'Your trial is ending soon', cta: 'Upgrade Now →', ...strings }
    return (
      <EmailTemplate theme={theme}>
        <Heading>{s.heading}</Heading>
        <Text>Hi {name}, you have <strong>{daysLeft} days</strong> left.</Text>
        {daysLeft <= 1 && <AlertBox variant="warning">Trial expires tomorrow — upgrade to keep your data.</AlertBox>}
        <KeyValueTable rows={[
          { label: 'Current plan', value: currentPlan },
          { label: 'Trial ends', value: new Date(Date.now() + daysLeft * 864e5).toLocaleDateString() },
        ]} />
        <Button href={upgradeUrl}>{s.cta}</Button>
      </EmailTemplate>
    )
  },
})

// TypeScript enforces all props at call site:
await mailer.send(TrialExpiring, {
  to: 'alice@example.com',
  props: { name: 'Alice', daysLeft: 1, upgradeUrl: '...', currentPlan: 'Starter' },
})`}</Code>
        </Card>

        {/* ── Testing ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Testing</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>captureEmails — zero-config inbox, works with sendBatch</h2>
          <Code>{`import { captureEmails } from '@yedoma-labs/tierde-mail/testing'
import { SecurityAlert, WeeklyDigest } from '@yedoma-labs/tierde-mail/templates'

describe('email system', () => {
  it('SecurityAlert: uses danger AlertBox for suspicious_activity', async () => {
    const { mailer, inbox, clear } = captureEmails()
    await mailer.send(SecurityAlert, {
      to: 'alice@example.com',
      props: { name: 'Alice', event: 'suspicious_activity', reviewUrl: '...', ipAddress: '1.2.3.4' },
    })
    expect(inbox[0].subject).toContain('Suspicious activity')
    expect(inbox[0].html).toContain('fef2f2')     // danger AlertBox bg
    expect(inbox[0].html).toContain('1.2.3.4')    // KeyValueTable IP row
    clear()
  })

  it('sendBatch: delivers to all recipients, isolates failures', async () => {
    const { mailer, inbox } = captureEmails()
    const subscribers = [
      { email: 'alice@example.com', name: 'Alice' },
      { email: 'bob@example.com',   name: 'Bob'   },
    ]
    const { sent, failed } = await mailer.sendBatch(WeeklyDigest, {
      recipients: subscribers.map(s => ({
        to: s.email,
        props: { name: s.name, weekOf: 'Jun 9–15', dashboardUrl: '...' },
      })),
      concurrency: 2,
    })
    expect(inbox).toHaveLength(2)
    expect(sent).toBe(2)
    expect(failed).toBe(0)
  })
})`}</Code>
        </Card>

        {/* ── i18n ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>i18n & String Overrides</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>All templates accept locale + strings override</h2>
          <Code>{`import { SecurityAlert } from '@yedoma-labs/tierde-mail/templates'
import { unsubscribeHeaders } from '@yedoma-labs/tierde-mail'

// Arabic — dir="rtl" inferred automatically from locale: 'ar'
await mailer.send(SecurityAlert, {
  to: 'alice@example.sa',
  props: {
    name: 'أليس', event: 'new_login', reviewUrl: '...', locale: 'ar', appName: 'Acme',
    strings: { heading: () => 'تم اكتشاف تسجيل دخول جديد', ctaLabel: 'مراجعة النشاط' },
  },
})

// German — locale-aware year in footer via tuuru-chrono-tz
await mailer.send(SecurityAlert, {
  to: 'alice@example.de',
  props: { name: 'Alice', event: 'new_login', reviewUrl: '...', locale: 'de', appName: 'Acme GmbH',
    strings: { ctaLabel: 'Aktivität prüfen', notYouNote: 'Wenn Sie das nicht waren, ändern Sie sofort Ihr Passwort.' },
  },
  headers: unsubscribeHeaders({ url: 'https://acme.com/abmelden?token=...' }),
})`}</Code>
        </Card>

        {/* ── Ecosystem ── */}
        <Card style={{ marginBottom: '3rem' }}>
          <Label>Yedoma Labs Integration</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Built on the Yedoma Labs stack</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {[
              { pkg: 'bylyt-env-guard', color: '#06b6d4', use: 'Validates SMTP/API key env vars at startup via createMailerFromEnv() — fails fast, never silently at send time' },
              { pkg: 'suruk-logger',    color: '#10b981', use: 'Structured send/failure logs via Pino — correlate email traces with your app logs in the preview server' },
              { pkg: 'tuuru-chrono-tz', color: '#6366f1', use: 'Locale-aware year formatting in all template footers — Invoice, WeeklyDigest, SecurityAlert, etc.' },
            ].map(({ pkg, color, use }) => (
              <div key={pkg} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(30,41,59,0.5)', borderRadius: '10px', padding: '0.85rem', border: `1px solid ${color}18` }}>
                <div style={{ width: '3px', borderRadius: '2px', background: color, alignSelf: 'stretch', flexShrink: 0 }} />
                <div>
                  <div style={{ color, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.15rem' }}>@yedoma-labs/{pkg}</div>
                  <div style={{ color: '#64748b', fontSize: '0.76rem', lineHeight: 1.5 }}>{use}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <footer style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>@yedoma-labs/tierde-mail — v{TIERDE_VERSION}</div>
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
