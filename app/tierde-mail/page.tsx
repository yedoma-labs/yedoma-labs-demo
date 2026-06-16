'use client'

import { useState } from 'react'
import Link from 'next/link'

type TemplateKey =
  | 'Welcome'
  | 'PasswordReset'
  | 'EmailVerification'
  | 'TwoFactorAuth'
  | 'MagicLink'
  | 'Invoice'
  | 'Notification'
  | 'SecurityAlert'
  | 'WeeklyDigest'
  | 'OnboardingProgress'
  | 'AbandonedCart'
  | 'ShippingUpdate'

type ProviderKey = 'resend' | 'smtp' | 'ses' | 'sendgrid' | 'postmark'

interface Theme {
  primary: string
  accentBar: string
  borderRadius: string
  buttonBorderRadius: string
}

// ── Template catalog — all 41 ─────────────────────────────────────────────────
const TEMPLATE_CATALOG = [
  {
    category: 'Authentication',
    color: '#6366f1',
    templates: [
      { name: 'Welcome',               props: 'name, loginUrl' },
      { name: 'EmailVerification',      props: 'name, verifyUrl' },
      { name: 'MagicLink',              props: 'email, loginUrl' },
      { name: 'TwoFactorAuth',          props: 'username, code' },
      { name: 'PasswordReset',          props: 'username, resetUrl' },
      { name: 'PasswordlessOtp',        props: 'username, code' },
      { name: 'PhoneVerification',      props: 'phoneNumber, code' },
    ],
  },
  {
    category: 'Account Management',
    color: '#0891b2',
    templates: [
      { name: 'RegistrationConfirmation', props: 'name, dashboardUrl' },
      { name: 'ProfileUpdated',           props: 'name, changes[]' },
      { name: 'PasswordChangedConfirmation', props: 'name, ...SecurityDetails?' },
      { name: 'EmailChangeVerification',  props: 'name, newEmail, verifyUrl' },
      { name: 'AccountDeactivated',       props: 'name, reactivateUrl' },
      { name: 'AccountLocked',            props: 'name, reason, supportEmail?' },
      { name: 'AccountUnlocked',          props: 'name, loginUrl' },
      { name: 'AccountDeletionConfirmation', props: 'name, event, cancelUrl?' },
      { name: 'LoginActivity',            props: 'name, events[] (LoginEvent)' },
      { name: 'DataExportRequest',        props: 'name, event, downloadUrl?, expiresAt?' },
    ],
  },
  {
    category: 'Security',
    color: '#ef4444',
    templates: [
      { name: 'SecurityAlert',  props: 'name, event (7 types), reviewUrl, ...SecurityDetails?' },
    ],
  },
  {
    category: 'Commerce',
    color: '#10b981',
    templates: [
      { name: 'Invoice',             props: 'customerName, invoiceNumber, items[], currency?' },
      { name: 'OrderConfirmation',   props: 'customerName, orderNumber, items[], currency?' },
      { name: 'ShippingUpdate',      props: 'customerName, orderNumber, status, trackingUrl?' },
      { name: 'AbandonedCart',       props: 'name, cartUrl, items[], currency?' },
      { name: 'RefundConfirmation',  props: 'customerName, amount, currency?, refundId, orderId?' },
      { name: 'PaymentFailed',       props: 'customerName, amount?, currency?, reason?, updateUrl' },
      { name: 'BackInStock',         props: 'name, productName, productUrl, imageUrl?' },
    ],
  },
  {
    category: 'Engagement',
    color: '#f59e0b',
    templates: [
      { name: 'NewsletterConfirmation', props: 'name, confirmUrl, unsubscribeUrl?' },
      { name: 'WeeklyDigest',           props: 'name, weekOf, dashboardUrl, stats[]?, items[]?' },
      { name: 'WinBack',                props: 'name, ctaUrl, discount?' },
      { name: 'Referral',               props: 'name, event, referralUrl?, rewardDescription?' },
      { name: 'FeatureAnnouncement',    props: 'name, featureName, changes[], ctaUrl' },
      { name: 'ReviewRequest',          props: 'name, productName, reviewUrl, orderDate?' },
    ],
  },
  {
    category: 'Productivity',
    color: '#8b5cf6',
    templates: [
      { name: 'OnboardingProgress',     props: 'name, steps[] (OnboardingStep), dashboardUrl' },
      { name: 'SupportTicket',          props: 'name, ticketId, event, subject?, ctaUrl' },
      { name: 'TeamInvite',             props: 'name, inviterName, teamName, inviteUrl' },
      { name: 'CommentMention',         props: 'name, mentionedBy, event, contextUrl' },
      { name: 'UsageAlert',             props: 'name, resource, used, limit, severity, ctaUrl' },
      { name: 'ExportReady',            props: 'name, exportType, downloadUrl, expiresAt' },
      { name: 'MaintenanceNotification', props: 'name, event, startTime, endTime?, affectedServices[]?' },
      { name: 'Notification',           props: 'title, body, ctaUrl?, ctaLabel?' },
    ],
  },
  {
    category: 'Billing',
    color: '#fb923c',
    templates: [
      { name: 'Subscription',  props: 'name, event (subscribed/upgraded/downgraded/cancelled/renewed/trial_started/trial_ending/trial_expired), plan, ctaUrl?' },
      { name: 'PolicyUpdate',  props: 'name, policyType, changes[], effectiveDate, ctaUrl?' },
    ],
  },
]

// ── Interactive template tab list (12 most visual) ─────────────────────────────
const DEMO_TEMPLATES: { key: TemplateKey; icon: string; label: string; cat: string }[] = [
  { key: 'Welcome',           icon: '👋', label: 'Welcome',           cat: 'Auth'      },
  { key: 'TwoFactorAuth',     icon: '🛡️', label: 'Two-Factor Auth',   cat: 'Auth'      },
  { key: 'MagicLink',         icon: '✨', label: 'Magic Link',         cat: 'Auth'      },
  { key: 'SecurityAlert',     icon: '🚨', label: 'Security Alert',     cat: 'Security'  },
  { key: 'Invoice',           icon: '🧾', label: 'Invoice',            cat: 'Commerce'  },
  { key: 'AbandonedCart',     icon: '🛒', label: 'Abandoned Cart',     cat: 'Commerce'  },
  { key: 'ShippingUpdate',    icon: '📦', label: 'Shipping Update',    cat: 'Commerce'  },
  { key: 'WeeklyDigest',      icon: '📊', label: 'Weekly Digest',      cat: 'Engage'    },
  { key: 'OnboardingProgress',icon: '🎯', label: 'Onboarding',         cat: 'Product'   },
  { key: 'PasswordReset',     icon: '🔑', label: 'Password Reset',     cat: 'Auth'      },
  { key: 'EmailVerification', icon: '✉️', label: 'Verify Email',       cat: 'Auth'      },
  { key: 'Notification',      icon: '🔔', label: 'Notification',       cat: 'Product'   },
]

// ── MockEmail ─────────────────────────────────────────────────────────────────
function MockEmail({ template, theme }: { template: TemplateKey; theme: Theme }) {
  const { primary, accentBar, borderRadius, buttonBorderRadius } = theme

  const outer: React.CSSProperties = {
    background: '#f1f5f9', borderRadius: '12px', padding: '1.5rem',
    minHeight: '320px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  }
  const card: React.CSSProperties = {
    background: '#ffffff', borderRadius, boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    width: '100%', maxWidth: '440px', overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }
  const bar: React.CSSProperties = { height: '4px', background: accentBar, width: '100%' }
  const body: React.CSSProperties = { padding: '1.75rem 1.75rem 1.25rem' }
  const h1: React.CSSProperties = { color: '#1e293b', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', lineHeight: 1.3 }
  const p: React.CSSProperties = { color: '#64748b', fontSize: '0.84rem', lineHeight: 1.65, margin: '0 0 1rem' }
  const btn: React.CSSProperties = {
    display: 'inline-block', background: primary, color: '#fff',
    padding: '0.6rem 1.4rem', borderRadius: buttonBorderRadius, fontWeight: 600,
    fontSize: '0.82rem', textDecoration: 'none', marginBottom: '1.25rem',
    cursor: 'default',
  }
  const divider: React.CSSProperties = { borderTop: '1px solid #e2e8f0', margin: '0' }
  const footer: React.CSSProperties = { padding: '0.9rem 1.75rem', color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center' as const }
  const kv = (label: string, value: string, mono = false) => (
    <tr key={label}>
      <td style={{ padding: '5px 0', color: '#6b7280', fontSize: '0.76rem', width: '40%' }}>{label}</td>
      <td style={{ padding: '5px 0', color: '#0f172a', fontSize: mono ? '0.7rem' : '0.76rem', fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</td>
    </tr>
  )
  const alertBox = (variant: 'danger' | 'warning' | 'info', text: string) => {
    const v = { danger: { bg: '#fef2f2', border: '#fecaca', color: '#7f1d1d' }, warning: { bg: '#fff7ed', border: '#fed7aa', color: '#7c2d12' }, info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' } }[variant]
    return <div style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}><p style={{ color: v.color, fontSize: '0.78rem', margin: 0, lineHeight: 1.55 }}>{text}</p></div>
  }

  if (template === 'TwoFactorAuth') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>Your verification code</h1>
        <p style={p}>Enter this code to complete sign-in for <strong>alice.j</strong></p>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem', textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.3em', color: primary }}>847 293</span>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.3rem' }}>Expires in 10 minutes</div>
        </div>
        <p style={{ ...p, fontSize: '0.75rem', color: '#94a3b8', marginBottom: 0 }}>Didn't request this? Ignore this email safely.</p>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  if (template === 'Invoice') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <div><h1 style={{ ...h1, marginBottom: '0.15rem' }}>Invoice</h1><div style={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'monospace' }}>#INV-2026-0042</div></div>
          <div style={{ textAlign: 'right' as const }}><div style={{ color: '#64748b', fontSize: '0.72rem' }}>Alice Johnson</div><div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>alice@example.com</div></div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', marginBottom: '0.85rem' }}>
          <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left' as const, padding: '0.35rem 0', color: '#94a3b8', fontWeight: 600 }}>Item</th>
            <th style={{ textAlign: 'right' as const, padding: '0.35rem 0', color: '#94a3b8', fontWeight: 600 }}>Price</th>
          </tr></thead>
          <tbody>
            {[['Pro Plan (annual)', '$299.00'], ['Extra seats × 3', '$45.00']].map(([n, p_]) => (
              <tr key={n} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.45rem 0', color: '#1e293b' }}>{n}</td>
                <td style={{ padding: '0.45rem 0', textAlign: 'right' as const, color: '#1e293b', fontWeight: 600 }}>{p_}</td>
              </tr>
            ))}
            <tr><td style={{ padding: '0.5rem 0', color: '#94a3b8', fontSize: '0.72rem', textAlign: 'right' as const, paddingRight: '0.5rem' }}>Total</td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right' as const, color: primary, fontWeight: 800, fontSize: '0.95rem' }}>$344.00</td></tr>
          </tbody>
        </table>
        <a href="#" style={btn} onClick={e => e.preventDefault()}>Pay Invoice</a>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  if (template === 'SecurityAlert') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>Suspicious activity detected</h1>
        <p style={p}>Hi Alice,</p>
        {alertBox('danger', 'We detected unusual activity on your account. Please review your recent activity and secure your account if needed.')}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <tbody>
            {kv('Time', 'Jun 16, 2026 — 14:32 UTC')}
            {kv('Device', 'Chrome on Windows 11')}
            {kv('Location', 'Moscow, Russia')}
            {kv('IP Address', '185.220.101.47', true)}
          </tbody>
        </table>
        <a href="#" style={{ ...btn, background: '#ef4444' }} onClick={e => e.preventDefault()}>Review Activity</a>
        <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>If this wasn't you, change your password immediately.</p>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  if (template === 'WeeklyDigest') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>Week of Jun 9 – 15, 2026</h1>
        <p style={p}>Hi Alice, here's your weekly roundup.</p>
        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>This week's stats</div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px', marginBottom: '0.85rem' }}>
          <tbody><tr>
            {[['1,247', 'Visitors', '+12%'], ['38', 'Sign-ups', '+5%'], ['$4,820', 'Revenue', '+18%']].map(([val, lbl, chg]) => (
              <td key={lbl} style={{ textAlign: 'center' as const, padding: '10px 6px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginTop: '2px' }}>{lbl}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#16a34a', marginTop: '2px' }}>{chg}</div>
              </td>
            ))}
          </tr></tbody>
        </table>
        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>Highlights</div>
        {[
          { title: 'New integration: Slack notifications', meta: 'Product · 2 days ago' },
          { title: 'Improved dashboard load time by 40%', meta: 'Engineering · 4 days ago' },
        ].map(item => (
          <div key={item.title} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>{item.meta}</div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{item.title}</div>
          </div>
        ))}
        <a href="#" style={{ ...btn, marginTop: '1rem' }} onClick={e => e.preventDefault()}>View All Activity</a>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  if (template === 'OnboardingProgress') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>3 of 5 steps complete</h1>
        <p style={p}>Hi Alice, you're making great progress! Complete the remaining steps.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <tbody>
            {[
              { title: 'Create your account',      done: true  },
              { title: 'Verify your email',         done: true  },
              { title: 'Connect your data source',  done: true  },
              { title: 'Invite your team',          done: false },
              { title: 'Set up your first workflow',done: false },
            ].map(step => (
              <tr key={step.title} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '7px 0', fontSize: '0.78rem', color: step.done ? '#16a34a' : '#1e293b', fontWeight: 600 }}>{step.title}</td>
                <td style={{ padding: '7px 0', textAlign: 'right' as const }}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, background: step.done ? '#dcfce7' : '#f1f5f9', color: step.done ? '#166534' : '#475569' }}>
                    {step.done ? '✓ Done' : 'To do'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <a href="#" style={btn} onClick={e => e.preventDefault()}>Continue Setup</a>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  if (template === 'AbandonedCart') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>Your cart is waiting</h1>
        <p style={p}>Hi Alice, you left some items behind. Complete your purchase before they sell out.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', marginBottom: '0.85rem' }}>
          <tbody>
            {[['Wireless Headphones Pro', '$129.00'], ['USB-C Hub 7-in-1', '$49.00']].map(([n, p_]) => (
              <tr key={n} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.45rem 0', color: '#1e293b', fontWeight: 600 }}>{n}</td>
                <td style={{ padding: '0.45rem 0', textAlign: 'right' as const, color: '#1e293b', fontWeight: 600 }}>{p_}</td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Total</td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right' as const, fontWeight: 800, fontSize: '0.9rem', color: primary }}>$178.00</td>
            </tr>
          </tbody>
        </table>
        <a href="#" style={btn} onClick={e => e.preventDefault()}>Complete Your Purchase</a>
        <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>Items in your cart are not reserved and may sell out.</p>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  if (template === 'ShippingUpdate') return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>Your order is on its way!</h1>
        <p style={p}>Hi Alice, order <strong>#ORD-2026-0892</strong> has shipped.</p>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginBottom: '1rem' }}>
          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>📦 Shipped</div>
          <div style={{ color: '#166534', fontSize: '0.75rem' }}>Estimated delivery: Jun 19 – 20, 2026</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <tbody>
            {kv('Carrier', 'DHL Express')}
            {kv('Tracking', '1Z999AA1012345678', true)}
          </tbody>
        </table>
        <a href="#" style={btn} onClick={e => e.preventDefault()}>Track Shipment</a>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )

  const CONTENT: Record<string, { heading: string; body: string; cta: string }> = {
    Welcome:          { heading: 'Welcome to Acme!',    body: 'Your account is ready. Click below to get started.',                       cta: 'Get Started →' },
    PasswordReset:    { heading: 'Reset your password', body: 'You requested a password reset for alice.j. This link expires in 1 hour.', cta: 'Reset Password →' },
    EmailVerification:{ heading: 'Verify your email',   body: 'Click below to verify alice@example.com and activate your account.',       cta: 'Verify Email →' },
    MagicLink:        { heading: 'Sign in to Acme',     body: 'Click below to sign in as alice@example.com. Expires in 15 minutes.',       cta: 'Sign In →' },
    Notification:     { heading: 'New device logged in',body: 'A new device signed into your account from Berlin, Germany.',              cta: 'Review Activity →' },
  }

  const { heading, body: bodyText, cta } = CONTENT[template] ?? CONTENT['Welcome']

  return (
    <div style={outer}><div style={card}>
      <div style={bar} />
      <div style={body}>
        <h1 style={h1}>{heading}</h1>
        <p style={p}>{bodyText}</p>
        <a href="#" style={btn} onClick={e => e.preventDefault()}>{cta}</a>
        <p style={{ ...p, fontSize: '0.75rem', color: '#94a3b8', marginBottom: 0 }}>
          Didn't request this? You can safely ignore this email.
        </p>
      </div>
      <div style={divider} /><div style={footer}>© 2026 Acme Corp · Unsubscribe</div>
    </div></div>
  )
}

// ── Code blocks ───────────────────────────────────────────────────────────────
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={copy} style={{
        position: 'absolute', top: '0.6rem', right: '0.6rem',
        background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`,
        color: copied ? '#34d399' : '#64748b',
        borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.68rem',
        fontFamily: 'monospace', cursor: 'pointer', zIndex: 1,
      }}>{copied ? '✓ copied' : 'copy'}</button>
      <pre style={{
        background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '1.25rem 1.5rem', overflow: 'auto',
        fontSize: '0.76rem', lineHeight: 1.7, color: '#e2e8f0',
        fontFamily: '"Fira Code", "Cascadia Code", monospace', margin: 0,
      }}><code>{children}</code></pre>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
      borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '1rem',
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em',
      textTransform: 'uppercase' as const, color: '#fca5a5', fontFamily: 'monospace',
    }}>{children}</div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #0c1a30 100%)',
      border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '2rem',
      ...style,
    }}>{children}</div>
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
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  }),
  from: 'hello@acme.com',
})`,
  ses: `import { createMailer } from '@yedoma-labs/tierde-mail'
import { ses } from '@yedoma-labs/tierde-mail/providers/ses'
import { SESClient } from '@aws-sdk/client-ses'

const mailer = createMailer({
  provider: ses({ client: new SESClient({ region: 'us-east-1' }) }),
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

const TEMPLATE_CODE: Record<TemplateKey, string> = {
  Welcome: `import { Welcome } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(Welcome, {
  to: 'alice@example.com',
  props: { name: 'Alice', loginUrl: 'https://app.acme.com/start', appName: 'Acme' },
})`,
  PasswordReset: `import { PasswordReset } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(PasswordReset, {
  to: 'alice@example.com',
  props: { username: 'alice.j', resetUrl: 'https://app.acme.com/reset/tok_abc', appName: 'Acme' },
})`,
  EmailVerification: `import { EmailVerification } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(EmailVerification, {
  to: 'alice@example.com',
  props: { name: 'Alice', verifyUrl: 'https://app.acme.com/verify/tok_xyz', appName: 'Acme' },
})`,
  TwoFactorAuth: `import { TwoFactorAuth } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(TwoFactorAuth, {
  to: 'alice@example.com',
  props: { username: 'alice.j', code: '847 293', appName: 'Acme' },
})`,
  MagicLink: `import { MagicLink } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(MagicLink, {
  to: 'alice@example.com',
  props: { email: 'alice@example.com', loginUrl: 'https://app.acme.com/magic/tok_m4g1c', appName: 'Acme' },
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
    currency: 'USD',
    appName: 'Acme',
  },
})`,
  Notification: `import { Notification } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(Notification, {
  to: 'alice@example.com',
  props: {
    title: 'New device logged in',
    body: 'A new device signed into your account from Berlin, Germany.',
    appName: 'Acme',
  },
})`,
  SecurityAlert: `import { SecurityAlert } from '@yedoma-labs/tierde-mail/templates'

// event: 'new_login' | 'password_changed' | 'email_changed'
//      | 'two_factor_enabled' | 'two_factor_disabled'
//      | 'api_key_created'   | 'suspicious_activity'
await mailer.send(SecurityAlert, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    event: 'suspicious_activity',
    reviewUrl: 'https://app.acme.com/security',
    // Optional SecurityDetails — rendered as KeyValueTable
    ipAddress: '185.220.101.47',
    location: 'Moscow, Russia',
    device: 'Chrome on Windows 11',
    timestamp: 'Jun 16, 2026 — 14:32 UTC',
    appName: 'Acme',
  },
})
// High-risk events (suspicious_activity, two_factor_disabled) render
// the body inside an <AlertBox variant="danger"> automatically.`,
  WeeklyDigest: `import { WeeklyDigest } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(WeeklyDigest, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    weekOf: 'Jun 9 – 15, 2026',
    dashboardUrl: 'https://app.acme.com/dashboard',
    stats: [
      { label: 'Visitors', value: '1,247', change: '+12%', positive: true },
      { label: 'Sign-ups', value: '38',    change: '+5%',  positive: true },
      { label: 'Revenue',  value: '$4,820', change: '+18%', positive: true },
    ],
    items: [
      { title: 'New integration: Slack notifications', url: 'https://app.acme.com/updates/slack', category: 'Product', meta: '2 days ago' },
      { title: 'Improved dashboard load time by 40%',  url: 'https://app.acme.com/updates/perf',  category: 'Engineering', meta: '4 days ago' },
    ],
    appName: 'Acme',
  },
})`,
  OnboardingProgress: `import { OnboardingProgress } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(OnboardingProgress, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    dashboardUrl: 'https://app.acme.com/onboarding',
    steps: [
      { title: 'Create your account',       completed: true  },
      { title: 'Verify your email',          completed: true  },
      { title: 'Connect your data source',   completed: true  },
      { title: 'Invite your team',           completed: false, url: 'https://app.acme.com/team' },
      { title: 'Set up your first workflow', completed: false, url: 'https://app.acme.com/workflows' },
    ],
    appName: 'Acme',
  },
})`,
  AbandonedCart: `import { AbandonedCart } from '@yedoma-labs/tierde-mail/templates'

await mailer.send(AbandonedCart, {
  to: 'alice@example.com',
  props: {
    name: 'Alice',
    cartUrl: 'https://shop.acme.com/cart/tok_cart123',
    currency: 'USD',
    items: [
      { name: 'Wireless Headphones Pro', price: 12900, quantity: 1 },
      { name: 'USB-C Hub 7-in-1',        price:  4900, quantity: 1 },
    ],
    appName: 'Acme Store',
  },
})`,
  ShippingUpdate: `import { ShippingUpdate } from '@yedoma-labs/tierde-mail/templates'

// status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned'
await mailer.send(ShippingUpdate, {
  to: 'alice@example.com',
  props: {
    customerName: 'Alice Johnson',
    orderNumber: 'ORD-2026-0892',
    status: 'shipped',
    trackingUrl: 'https://track.dhl.com/1Z999AA1012345678',
    appName: 'Acme Store',
  },
})`,
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TierdeMailPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('Welcome')
  const [activeProvider, setActiveProvider] = useState<ProviderKey>('resend')
  const [theme, setTheme] = useState<Theme>({ primary: '#4f46e5', accentBar: '#4f46e5', borderRadius: '12px', buttonBorderRadius: '8px' })
  const [showStrategy, setShowStrategy] = useState<'failover' | 'round-robin'>('failover')
  const [catFilter, setCatFilter] = useState<string>('All')

  const allCats = ['All', ...TEMPLATE_CATALOG.map(c => c.category)]
  const filteredCatalog = catFilter === 'All' ? TEMPLATE_CATALOG : TEMPLATE_CATALOG.filter(c => c.category === catFilter)
  const totalTemplates = TEMPLATE_CATALOG.reduce((n, c) => n + c.templates.length, 0)

  return (
    <>
      <style>{`
        html, body { background: #0f172a !important; }
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        @keyframes aurora-sweep { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
        @keyframes blink-cursor { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes float-slow   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        .tm-tab { transition: background .15s, color .15s, border-color .15s; }
        .tm-tab:hover { filter: brightness(1.1); }
        .tm-card { transition: transform .2s, box-shadow .2s; }
        .tm-card:hover { transform: translateY(-2px); }
        .cat-btn { transition: background .15s, color .15s; }
      `}</style>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', minHeight: '100vh', position: 'relative', zIndex: 10 }}>

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
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(45deg, transparent 20%, rgba(239,68,68,0.06) 40%, rgba(251,146,60,0.04) 60%, transparent 80%)', backgroundSize: '400% 400%', animation: 'aurora-sweep 12s ease infinite' }} />
          <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'float-slow 5s ease-in-out infinite' }}>📬</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
              color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '100px', padding: '0.3rem 1rem', marginBottom: '1.5rem', fontFamily: 'monospace',
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'blink-cursor 1.5s ease-in-out infinite' }} />
              @yedoma-labs/tierde-mail — v0.2.0
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1rem',
              background: 'linear-gradient(135deg, #fecaca 0%, #fb923c 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>tierde-mail</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 0.5rem', lineHeight: 1.65 }}>
              JSX email templates · multi-provider · TypeScript-first
            </p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace', margin: '0 auto 2rem' }}>
              // тиэрдэ — "to deliver · to convey" (Sakha)
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.75rem' }}>
              {[`${totalTemplates} Templates`, '5 Providers', 'Failover / Round-Robin', 'AlertBox · KeyValueTable', 'createMailerFromEnv', 'CSS Inline (Rust)', 'Security Hardened'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '100px', padding: '0.3rem 0.85rem', fontSize: '0.75rem', color: '#fca5a5', fontFamily: 'monospace',
                }}>{tag}</span>
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

        {/* ── createMailerFromEnv ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>createMailerFromEnv</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Zero-config mailer from environment variables</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Bootstraps a mailer from env vars validated by <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>bylyt-env-guard</code>. Fails fast at startup on misconfiguration — not at send time.
          </p>
          <Code>{`import { createMailerFromEnv } from '@yedoma-labs/tierde-mail'

// Auto-selects provider from TIERDE_PROVIDER env var
const mailer = createMailerFromEnv()

// Required env vars:
//   TIERDE_PROVIDER    resend | smtp | ses | sendgrid | postmark
//   TIERDE_FROM_EMAIL  hello@acme.com
//   TIERDE_FROM_NAME   Acme (optional)
//
// Per-provider:
//   resend:    RESEND_API_KEY
//   smtp:      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
//   ses:       SES_REGION (or AWS_REGION)
//   sendgrid:  SENDGRID_API_KEY
//   postmark:  POSTMARK_SERVER_TOKEN

// Swap providers in production without changing any application code:
// TIERDE_PROVIDER=ses pnpm start`}</Code>
        </Card>

        {/* ── Interactive template preview ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Template Preview</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>{totalTemplates} production-ready templates</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            All import from <code style={{ fontFamily: 'monospace', color: '#fca5a5', fontSize: '0.78rem' }}>@yedoma-labs/tierde-mail/templates</code> — each accepts <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem' }}>BaseTemplateProps</code>: <code style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem' }}>appName? locale? dir? theme? strings?</code>
          </p>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {DEMO_TEMPLATES.map(t => (
              <button key={t.key} className="tm-tab" onClick={() => setActiveTemplate(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: activeTemplate === t.key ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTemplate === t.key ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: activeTemplate === t.key ? '#fca5a5' : '#64748b',
                fontSize: '0.74rem', fontWeight: activeTemplate === t.key ? 700 : 400,
                fontFamily: 'monospace', cursor: 'pointer',
              }}>
                {t.icon} {t.label}
                <span style={{ fontSize: '0.6rem', color: activeTemplate === t.key ? '#f87171' : '#475569', opacity: 0.8 }}>{t.cat}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.68rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>LIVE PREVIEW</div>
              <MockEmail template={activeTemplate} theme={theme} />
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.68rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>SEND CALL</div>
              <Code>{TEMPLATE_CODE[activeTemplate]}</Code>
            </div>
          </div>
        </Card>

        {/* ── Template catalog ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Full Template Catalog</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>{totalTemplates} templates across 7 categories</h2>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {allCats.map(cat => (
              <button key={cat} className="cat-btn" onClick={() => setCatFilter(cat)} style={{
                padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem',
                fontFamily: 'monospace', cursor: 'pointer',
                background: catFilter === cat ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${catFilter === cat ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: catFilter === cat ? '#fca5a5' : '#64748b',
              }}>{cat}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredCatalog.map(({ category, color, templates }) => (
              <div key={category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ color, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{category}</span>
                  <span style={{ color: '#334155', fontSize: '0.68rem' }}>{templates.length} templates</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                  {templates.map(t => (
                    <div key={t.name} className="tm-card" style={{
                      background: `linear-gradient(135deg, rgba(15,23,42,0.9), ${color}08)`,
                      border: `1px solid ${color}22`, borderRadius: '10px', padding: '0.75rem 1rem',
                      display: 'flex', flexDirection: 'column', gap: '0.2rem',
                    }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace' }}>{t.name}</span>
                      <span style={{ color: '#475569', fontSize: '0.7rem', fontFamily: 'monospace' }}>{t.props}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Theme customization ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Theme Customization</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>createTheme — live preview</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            18 design tokens including colors, typography, radii, and logo. Propagates via React Context to all components.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'primary', key: 'primary' as const, desc: 'button bg + accent bar (shared)' },
                  { label: 'accentBar', key: 'accentBar' as const, desc: 'top 4px accent bar (override)' },
                ].map(({ label, key, desc }) => (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.73rem', fontFamily: 'monospace' }}>{label} <span style={{ color: '#475569' }}>— {desc}</span></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input type="color" value={theme[key]} onChange={e => setTheme(t => ({ ...t, [key]: e.target.value, ...(key === 'primary' ? { accentBar: e.target.value } : {}) }))}
                        style={{ width: '40px', height: '30px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '2px', background: 'none' }} />
                      <code style={{ color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'monospace' }}>{theme[key]}</code>
                    </div>
                  </label>
                ))}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.73rem', fontFamily: 'monospace' }}>borderRadius</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['0px', '4px', '8px', '12px', '16px'].map(r => (
                      <button key={r} onClick={() => setTheme(t => ({ ...t, borderRadius: r }))}
                        style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: 'monospace', cursor: 'pointer',
                          background: theme.borderRadius === r ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${theme.borderRadius === r ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: theme.borderRadius === r ? '#fca5a5' : '#64748b' }}>{r}</button>
                    ))}
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.73rem', fontFamily: 'monospace' }}>buttonBorderRadius</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['0px', '4px', '8px', '100px'].map(r => (
                      <button key={r} onClick={() => setTheme(t => ({ ...t, buttonBorderRadius: r }))}
                        style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: 'monospace', cursor: 'pointer',
                          background: theme.buttonBorderRadius === r ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${theme.buttonBorderRadius === r ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: theme.buttonBorderRadius === r ? '#fca5a5' : '#64748b' }}>{r}</button>
                    ))}
                  </div>
                </label>
              </div>
              <Code>{`import { createTheme } from '@yedoma-labs/tierde-mail'

const myTheme = createTheme({
  primary: '${theme.primary}',
  accentBar: '${theme.accentBar}',
  borderRadius: '${theme.borderRadius}',
  buttonBorderRadius: '${theme.buttonBorderRadius}',
  // Full interface — 18 tokens:
  // primaryHover, primaryText, secondary, secondaryText,
  // background, cardBackground, textPrimary, textSecondary,
  // textMuted, border, fontFamily, maxWidth, logo?, logoAlt?, logoWidth?
})

// Pass to any template or defineEmail component
await mailer.send(Welcome, {
  to: 'alice@example.com',
  props: { name: 'Alice', loginUrl: '...', theme: myTheme },
})`}</Code>
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.68rem', fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>LIVE PREVIEW</div>
              <MockEmail template="Welcome" theme={theme} />
            </div>
          </div>
        </Card>

        {/* ── AlertBox + KeyValueTable ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>New in v0.2.0 — Components</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>AlertBox · KeyValueTable</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }}>{'<AlertBox>'} — 4 variants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {([
                  ['danger',  '#fef2f2', '#fecaca', '#7f1d1d', '🚨 suspicious_activity or two_factor_disabled triggers danger automatically'],
                  ['warning', '#fff7ed', '#fed7aa', '#7c2d12', '⚠️ Degraded performance in EU region (impact: medium)'],
                  ['success', '#f0fdf4', '#bbf7d0', '#166534', '✓ Your export is ready — download expires in 24 hours'],
                  ['info',    '#eff6ff', '#bfdbfe', '#1e40af', 'ℹ️ This change affects all users in your organization'],
                ] as const).map(([v, bg, border, color, text]) => (
                  <div key={v} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ color, fontSize: '0.76rem', margin: 0, lineHeight: 1.5 }}>{text}</p>
                  </div>
                ))}
              </div>
              <Code>{`import { AlertBox } from '@yedoma-labs/tierde-mail'

// In a defineEmail component:
<AlertBox variant="danger">
  Suspicious activity detected. Secure your account immediately.
</AlertBox>

<AlertBox variant="warning" icon="⚠️">
  Degraded performance in EU region.
</AlertBox>

<AlertBox variant="success">
  Your export is ready — download expires in 24 hours.
</AlertBox>

<AlertBox variant="info">
  This change affects all users in your organization.
</AlertBox>`}</Code>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }}>{'<KeyValueTable>'} — auto-filters empty rows</div>
              <div style={{ background: '#ffffff', borderRadius: '8px', padding: '12px 14px', marginBottom: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[['Time', 'Jun 16, 2026 — 14:32 UTC', false], ['Device', 'Chrome on Windows 11', false], ['Location', 'Moscow, Russia', false], ['IP Address', '185.220.101.47', true]].map(([l, v, mono]) => (
                      <tr key={l as string} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '6px 0', color: '#6b7280', fontSize: '0.75rem', width: '40%' }}>{l}</td>
                        <td style={{ padding: '6px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Code>{`import { KeyValueTable } from '@yedoma-labs/tierde-mail'

// Auto-skips null, undefined, '', and false — no guard needed
<KeyValueTable rows={[
  { label: 'Time',       value: timestamp },   // skipped if undefined
  { label: 'Device',     value: device },
  { label: 'Location',   value: location },
  { label: 'IP Address', value: ipAddress, mono: true },
]} />

// Used by SecurityAlert, PasswordChangedConfirmation,
// LoginActivity, ProfileUpdated`}</Code>
            </div>
          </div>
        </Card>

        {/* ── BaseTemplateProps ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>BaseTemplateProps</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Shared interface — every template extends this</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Eliminates boilerplate from every template interface. All 41 built-in templates extend <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>BaseTemplateProps&lt;S&gt;</code> where <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>S</code> is the template-specific strings type.
          </p>
          <Code>{`import type { BaseTemplateProps } from '@yedoma-labs/tierde-mail/templates'

// Every template gets these 5 fields for free:
interface BaseTemplateProps<S = Record<string, unknown>> {
  appName?: string          // "Acme" → appears in subjects, footers
  locale?: string           // "de", "ja", "ar" — for date formatting + dir
  dir?: 'ltr' | 'rtl'      // auto-inferred from locale if not set
  theme?: Theme             // createTheme() output
  strings?: Partial<S>      // copy overrides (i18n)
}

// Shared security context (SecurityAlert, PasswordChangedConfirmation, etc.):
interface SecurityDetails {
  ipAddress?: string
  location?: string
  device?: string
  timestamp?: string
}

// Profile/account change record (ProfileUpdated):
interface ChangeRecord {
  field: string
  oldValue?: string
  newValue: string
}

// Login history entry (LoginActivity):
interface LoginEvent extends SecurityDetails {
  timestamp: string               // required (vs. SecurityDetails where it's optional)
  status: 'success' | 'failed'
}

// Use in your own defineEmail templates:
interface MyEmailStrings { heading: string; body: string }
interface MyEmailProps extends BaseTemplateProps<MyEmailStrings> {
  name: string
  url: string
}`}</Code>
        </Card>

        {/* ── defineEmail ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>defineEmail API</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Custom templates with full TypeScript inference</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Props are typed end-to-end — from the template definition through to <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>mailer.send()</code>.
          </p>
          <Code>{`import {
  defineEmail, EmailTemplate, Heading, Text, Button, Footer,
  AlertBox, KeyValueTable,
} from '@yedoma-labs/tierde-mail'
import type { BaseTemplateProps } from '@yedoma-labs/tierde-mail/templates'

interface TrialExpiringStrings { heading: string; cta: string }

interface TrialExpiringProps extends BaseTemplateProps<TrialExpiringStrings> {
  name: string
  daysLeft: number
  upgradeUrl: string
  currentPlan: string
}

const TrialExpiring = defineEmail<TrialExpiringProps>({
  subject: ({ name, daysLeft }) =>
    \`\${name}, your trial ends in \${daysLeft} day\${daysLeft === 1 ? '' : 's'}\`,

  component: ({ name, daysLeft, upgradeUrl, currentPlan, strings, theme }) => {
    const s = { heading: 'Your trial is ending soon', cta: 'Upgrade Now →', ...strings }
    return (
      <EmailTemplate preview={\`Trial ending soon — \${daysLeft} days left\`} theme={theme}>
        <Heading>{s.heading}</Heading>
        <Text>Hi {name}, you have <strong>{daysLeft} days</strong> left.</Text>
        {daysLeft <= 1 && (
          <AlertBox variant="warning">
            Your trial expires tomorrow — upgrade to keep your data.
          </AlertBox>
        )}
        <KeyValueTable rows={[
          { label: 'Current plan', value: currentPlan },
          { label: 'Trial ends',   value: new Date(Date.now() + daysLeft * 864e5).toLocaleDateString() },
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

        {/* ── Providers ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Provider Setup</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>5 providers — swap without changing send logic</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {(['resend', 'smtp', 'ses', 'sendgrid', 'postmark'] as ProviderKey[]).map(p => (
              <button key={p} className="tm-tab" onClick={() => setActiveProvider(p)} style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem',
                fontFamily: 'monospace', cursor: 'pointer', fontWeight: activeProvider === p ? 700 : 400,
                background: activeProvider === p ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeProvider === p ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: activeProvider === p ? '#fca5a5' : '#64748b',
              }}>{p}</button>
            ))}
          </div>
          <Code>{PROVIDER_CODE[activeProvider]}</Code>
          {activeProvider === 'smtp' && <div style={{ marginTop: '0.75rem', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#67e8f9' }}>Requires optional dep: <code style={{ fontFamily: 'monospace' }}>pnpm add nodemailer</code></div>}
          {activeProvider === 'ses' && <div style={{ marginTop: '0.75rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#fcd34d' }}>Requires: <code style={{ fontFamily: 'monospace' }}>pnpm add @aws-sdk/client-ses</code></div>}
        </Card>

        {/* ── Multi-provider strategies ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Multi-Provider Strategies</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Failover & round-robin</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {(['failover', 'round-robin'] as const).map(s => (
              <button key={s} className="tm-tab" onClick={() => setShowStrategy(s)} style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem',
                fontFamily: 'monospace', cursor: 'pointer', fontWeight: showStrategy === s ? 700 : 400,
                background: showStrategy === s ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showStrategy === s ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: showStrategy === s ? '#fca5a5' : '#64748b',
              }}>{s}</button>
            ))}
          </div>
          {showStrategy === 'failover' ? (
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
// send 1 → resend · send 2 → sendgrid · send 3 → postmark · send 4 → resend …`}</Code>
          )}
        </Card>

        {/* ── Testing ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Testing</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>captureEmails — zero-config test inbox</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            No mock setup needed — intercepts sends into an in-memory inbox. Works with vitest, jest, any runner.
          </p>
          <Code>{`import { captureEmails } from '@yedoma-labs/tierde-mail/testing'
import { SecurityAlert } from '@yedoma-labs/tierde-mail/templates'

describe('SecurityAlert', () => {
  it('uses danger variant for suspicious_activity', async () => {
    const { mailer, inbox, clear } = captureEmails()

    await mailer.send(SecurityAlert, {
      to: 'alice@example.com',
      props: {
        name: 'Alice',
        event: 'suspicious_activity',
        reviewUrl: 'https://app.acme.com/security',
        ipAddress: '185.220.101.47',
      },
    })

    expect(inbox).toHaveLength(1)
    expect(inbox[0].subject).toContain('Suspicious activity')
    expect(inbox[0].html).toContain('fef2f2')   // danger AlertBox bg color
    expect(inbox[0].html).toContain('185.220.101.47')  // KeyValueTable IP row
    clear()
  })

  it('does not render KeyValueTable when no details provided', async () => {
    const { mailer, inbox } = captureEmails()
    await mailer.send(SecurityAlert, {
      to: 'alice@example.com',
      props: { name: 'Alice', event: 'new_login', reviewUrl: '...' },
      // no ipAddress, location, device, timestamp
    })
    expect(inbox[0].html).not.toContain('IP Address')
  })
})`}</Code>
        </Card>

        {/* ── Security ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Security</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Hardened in v0.2.0</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { sev: 'fix', color: '#ef4444', title: 'Null byte attachment bypass', desc: 'validateAttachment now checks for control characters (\\x00–\\x1f) before path-traversal check. Previously \'\\x00\' bypassed the includes(\'..\') guard.' },
              { sev: 'fix', color: '#ef4444', title: 'Empty recipient array silently accepted', desc: 'normalizeAddresses([]) now throws TypeError(\'At least one recipient address is required\'). Previously sent with no To: header.' },
              { sev: 'fix', color: '#f59e0b', title: 'Link component missing XSS protocol check', desc: '<Link href> now blocks javascript:, data:, and vbscript: protocols — matching the <Button> protection added in v0.1.0.' },
              { sev: 'fix', color: '#10b981', title: 'KeyValueTable rendered false values', desc: 'Filter now excludes false ReactNode in addition to null, undefined, and \'\'. Prevents accidental "false" text in email cells.' },
            ].map(({ sev, color, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(30,41,59,0.5)', borderRadius: '10px', padding: '0.9rem', border: `1px solid ${color}20` }}>
                <span style={{ background: color, color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', height: 'fit-content', fontFamily: 'monospace', flexShrink: 0, marginTop: '1px' }}>{sev}</span>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.2rem' }}>{title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── i18n ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>i18n & String Overrides</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Localize any built-in template</h2>
          <Code>{`import { SecurityAlert } from '@yedoma-labs/tierde-mail/templates'

// Arabic — RTL applied automatically via dir="rtl"
await mailer.send(SecurityAlert, {
  to: 'alice@example.sa',
  props: {
    name: 'أليس',
    event: 'new_login',
    reviewUrl: 'https://app.acme.com/security',
    locale: 'ar',
    // dir: 'rtl' inferred from locale automatically
    strings: {
      heading: () => 'تم اكتشاف تسجيل دخول جديد',
      body: () => 'تم تسجيل الدخول إلى حسابك من جهاز جديد.',
      ctaLabel: 'مراجعة النشاط',
    },
  },
})

// German — locale-aware year in footer via tuuru-chrono-tz
await mailer.send(SecurityAlert, {
  to: 'alice@example.de',
  props: {
    name: 'Alice',
    event: 'new_login',
    reviewUrl: '...',
    locale: 'de',
    appName: 'Acme GmbH',
    strings: {
      ctaLabel: 'Aktivität prüfen',
      notYouNote: 'Wenn Sie das nicht waren, ändern Sie sofort Ihr Passwort.',
    },
  },
})`}</Code>
        </Card>

        {/* ── CLI ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>CLI</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>tierde eject — copy templates into your project</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Template source embedded at build time via Vite <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>?raw</code> imports — eject works offline, no network request needed.
          </p>
          <Code>{`# Eject all 41 templates into ./emails/
npx tierde eject

# Eject specific templates
npx tierde eject SecurityAlert WeeklyDigest OnboardingProgress

# Custom output directory
npx tierde eject --out src/emails/templates/

# Output:
# ✓ emails/SecurityAlert.tsx      (rewrites internal imports)
# ✓ emails/WeeklyDigest.tsx
# ✓ emails/OnboardingProgress.tsx
# ... update imports to '@yedoma-labs/tierde-mail' components`}</Code>
        </Card>

        {/* ── Architecture ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <SectionLabel>Architecture</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Render pipeline</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {[
              { step: '1', title: 'defineEmail', desc: 'JSX component + typed props + subject fn. No rendering here.', color: '#ef4444' },
              { step: '2', title: 'renderToStaticMarkup', desc: 'React Server renders JSX to HTML string (react-dom/server).', color: '#f97316' },
              { step: '3', title: 'CSS inline (Rust)', desc: '@css-inline/css-inline (Rust/NAPI). Replaces juice. Preserves @media for dark mode via keepAtRules.', color: '#f59e0b' },
              { step: '4', title: 'Plain-text fallback', desc: 'html-to-text generates a plain-text part. No extra work needed.', color: '#84cc16' },
              { step: '5', title: 'Provider dispatch', desc: 'Provider (or strategy) delivers the message via HTTP/SMTP.', color: '#10b981' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="tm-card" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), ${color}08)`, border: `1px solid ${color}25`, borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ background: color, color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>{step}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace' }}>{title}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.74rem', lineHeight: 1.55, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#a5b4fc' }}>
            <strong>v0.2.0:</strong> juice CSS inliner replaced with @css-inline/css-inline (Rust/NAPI) — eliminates the <code style={{ fontFamily: 'monospace' }}>juice → cheerio → whatwg-encoding</code> deprecated dependency chain. <code style={{ fontFamily: 'monospace' }}>@media</code> at-rules preserved for dark mode support.
          </div>
        </Card>

        {/* ── Ecosystem ── */}
        <Card style={{ marginBottom: '3rem' }}>
          <SectionLabel>Yedoma Labs Integration</SectionLabel>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Built on the Yedoma Labs stack</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { pkg: 'bylyt-env-guard', color: '#06b6d4', use: 'Validates all SMTP/API key env vars at startup via createMailerFromEnv() — fails fast on misconfiguration, not at send time' },
              { pkg: 'suruk-logger',    color: '#10b981', use: 'Structured send/failure logs via Pino — correlate email traces with your app logs' },
              { pkg: 'tuuru-chrono-tz', color: '#6366f1', use: 'Locale-aware year formatting in all template footers (Invoice, Notification, WeeklyDigest, etc.)' },
            ].map(({ pkg, color, use }) => (
              <div key={pkg} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(30,41,59,0.5)', borderRadius: '10px', padding: '0.9rem', border: `1px solid ${color}18` }}>
                <div style={{ width: '3px', borderRadius: '2px', background: color, alignSelf: 'stretch', flexShrink: 0 }} />
                <div>
                  <div style={{ color, fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace', marginBottom: '0.2rem' }}>@yedoma-labs/{pkg}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5 }}>{use}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <footer style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>@yedoma-labs/tierde-mail — v0.2.0</div>
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
