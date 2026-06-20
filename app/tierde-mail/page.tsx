'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import pkg from '../../package.json'

const TIERDE_VERSION = (pkg.dependencies as Record<string, string>)['@yedoma-labs/tierde-mail']

type TemplateKey =
  | 'Welcome' | 'PasswordReset' | 'EmailVerification' | 'TwoFactorAuth'
  | 'MagicLink' | 'Invoice' | 'Notification' | 'SecurityAlert'
  | 'WeeklyDigest' | 'OnboardingProgress' | 'AbandonedCart' | 'ShippingUpdate'
  | 'AppointmentReminder' | 'EventInvitation' | 'ApiKeyCreated' | 'GiftCard'
  | 'PasswordlessOtp' | 'PhoneVerification'
  | 'RegistrationConfirmation' | 'ProfileUpdated' | 'PasswordChangedConfirmation'
  | 'EmailChangeVerification' | 'AccountDeactivated' | 'AccountLocked'
  | 'AccountUnlocked' | 'AccountDeletionConfirmation' | 'LoginActivity' | 'DataExportRequest'
  | 'OrderConfirmation' | 'RefundConfirmation' | 'PaymentFailed' | 'BackInStock'
  | 'NewsletterConfirmation' | 'WinBack' | 'Referral' | 'FeatureAnnouncement' | 'ReviewRequest'
  | 'SupportTicket' | 'TeamInvite' | 'CommentMention' | 'UsageAlert' | 'ExportReady'
  | 'MaintenanceNotification' | 'Subscription' | 'PolicyUpdate'

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
    { name: 'GiftCard', props: 'recipientName, amount, currency?, code, message?, expiresAt?' },
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
  { category: 'Scheduling', color: '#14b8a6', templates: [
    { name: 'AppointmentReminder', props: 'name, date, time, provider, location?, rescheduleUrl?, cancelUrl?' },
    { name: 'EventInvitation', props: 'name, eventName, date, time, location?, registerUrl, calendarUrl?' },
  ]},
  { category: 'Developer', color: '#84cc16', templates: [
    { name: 'ApiKeyCreated', props: 'name, keyName, keyPrefix, event (created|revoked|expiring), expiresAt?' },
  ]},
]

const DEMO_TEMPLATES: { key: TemplateKey; icon: string; label: string; cat: string }[] = [
  // Auth
  { key: 'Welcome',                    icon: '👋', label: 'Welcome',           cat: 'Auth'     },
  { key: 'TwoFactorAuth',              icon: '🛡️', label: '2FA Code',          cat: 'Auth'     },
  { key: 'MagicLink',                  icon: '✨', label: 'Magic Link',        cat: 'Auth'     },
  { key: 'PasswordReset',              icon: '🔑', label: 'Pwd Reset',         cat: 'Auth'     },
  { key: 'EmailVerification',          icon: '✉️', label: 'Verify Email',      cat: 'Auth'     },
  { key: 'PasswordlessOtp',            icon: '🔓', label: 'Passwordless OTP',  cat: 'Auth'     },
  { key: 'PhoneVerification',          icon: '📱', label: 'Phone Verify',      cat: 'Auth'     },
  // Security
  { key: 'SecurityAlert',              icon: '🚨', label: 'Security Alert',    cat: 'Security' },
  // Account
  { key: 'RegistrationConfirmation',   icon: '🎉', label: 'Reg Confirm',       cat: 'Account'  },
  { key: 'ProfileUpdated',             icon: '👤', label: 'Profile Updated',   cat: 'Account'  },
  { key: 'PasswordChangedConfirmation',icon: '🔒', label: 'Pwd Changed',       cat: 'Account'  },
  { key: 'EmailChangeVerification',    icon: '📧', label: 'Email Change',      cat: 'Account'  },
  { key: 'AccountDeactivated',         icon: '⏸️', label: 'Deactivated',       cat: 'Account'  },
  { key: 'AccountLocked',              icon: '🔐', label: 'Acct Locked',       cat: 'Account'  },
  { key: 'AccountUnlocked',            icon: '🔓', label: 'Acct Unlocked',     cat: 'Account'  },
  { key: 'AccountDeletionConfirmation',icon: '🗑️', label: 'Deletion',          cat: 'Account'  },
  { key: 'LoginActivity',              icon: '📋', label: 'Login Activity',    cat: 'Account'  },
  { key: 'DataExportRequest',          icon: '📤', label: 'Data Export',       cat: 'Account'  },
  // Commerce
  { key: 'Invoice',                    icon: '🧾', label: 'Invoice',           cat: 'Commerce' },
  { key: 'OrderConfirmation',          icon: '✅', label: 'Order Confirm',     cat: 'Commerce' },
  { key: 'ShippingUpdate',             icon: '📦', label: 'Shipping',          cat: 'Commerce' },
  { key: 'AbandonedCart',              icon: '🛒', label: 'Abandoned Cart',    cat: 'Commerce' },
  { key: 'RefundConfirmation',         icon: '💰', label: 'Refund',            cat: 'Commerce' },
  { key: 'PaymentFailed',              icon: '❌', label: 'Payment Failed',    cat: 'Commerce' },
  { key: 'BackInStock',                icon: '🛍️', label: 'Back In Stock',     cat: 'Commerce' },
  { key: 'GiftCard',                   icon: '🎁', label: 'Gift Card',         cat: 'Commerce' },
  // Engagement
  { key: 'NewsletterConfirmation',     icon: '📰', label: 'Newsletter',        cat: 'Engage'   },
  { key: 'WeeklyDigest',               icon: '📊', label: 'Weekly Digest',     cat: 'Engage'   },
  { key: 'WinBack',                    icon: '💝', label: 'Win Back',          cat: 'Engage'   },
  { key: 'Referral',                   icon: '🤝', label: 'Referral',          cat: 'Engage'   },
  { key: 'FeatureAnnouncement',        icon: '🚀', label: 'Feature Announce',  cat: 'Engage'   },
  { key: 'ReviewRequest',              icon: '⭐', label: 'Review Request',    cat: 'Engage'   },
  // Productivity
  { key: 'OnboardingProgress',         icon: '🎯', label: 'Onboarding',        cat: 'Product'  },
  { key: 'SupportTicket',              icon: '🎫', label: 'Support Ticket',    cat: 'Product'  },
  { key: 'TeamInvite',                 icon: '👥', label: 'Team Invite',       cat: 'Product'  },
  { key: 'CommentMention',             icon: '💬', label: 'Mention',           cat: 'Product'  },
  { key: 'UsageAlert',                 icon: '📈', label: 'Usage Alert',       cat: 'Product'  },
  { key: 'ExportReady',                icon: '⬇️', label: 'Export Ready',      cat: 'Product'  },
  { key: 'MaintenanceNotification',    icon: '🔧', label: 'Maintenance',       cat: 'Product'  },
  { key: 'Notification',               icon: '🔔', label: 'Notification',      cat: 'Product'  },
  // Billing
  { key: 'Subscription',               icon: '💳', label: 'Subscription',      cat: 'Billing'  },
  { key: 'PolicyUpdate',               icon: '📜', label: 'Policy Update',     cat: 'Billing'  },
  // Scheduling
  { key: 'AppointmentReminder',        icon: '📅', label: 'Appt Reminder',     cat: 'Schedule' },
  { key: 'EventInvitation',            icon: '🎟️', label: 'Event Invite',      cat: 'Schedule' },
  // Developer
  { key: 'ApiKeyCreated',              icon: '🔑', label: 'API Key',           cat: 'Dev'      },
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

  if (template === 'GiftCard') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: 'linear-gradient(90deg,#f59e0b,#ef4444,#ec4899)' }} /><div style={body}>
      <div style={{ textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>🎁</div>
        <h1 style={{ ...h1, textAlign: 'center' as const }}>You received a gift card!</h1>
        <p style={{ ...p, textAlign: 'center' as const }}><strong>Bob</strong> sent you a gift card to Acme Shop.</p>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '1px solid #fbbf24', borderRadius: '10px', padding: '1rem', textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400e', marginBottom: '0.25rem' }}>$50.00</div>
        <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.2em', color: '#78350f', background: 'rgba(255,255,255,0.6)', borderRadius: '6px', padding: '0.3rem 0.75rem', display: 'inline-block' }}>GIFT-A1B2-C3D4</div>
        <div style={{ color: '#92400e', fontSize: '0.67rem', marginTop: '0.4rem' }}>Expires Dec 31, 2026</div>
      </div>
      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '0.75rem', fontStyle: 'italic', color: '#475569', fontSize: '0.76rem', lineHeight: 1.5 }}>"Happy birthday! Enjoy shopping! 🎉"</div>
      <a href="#" style={{ ...btn, background: '#f59e0b', display: 'block', textAlign: 'center' as const }} onClick={e => e.preventDefault()}>Redeem Gift Card →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Shop</div></div></div>
  )

  if (template === 'AppointmentReminder') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#14b8a6' }} /><div style={body}>
      <h1 style={h1}>Appointment reminder</h1><p style={p}>Hi Alice, your appointment is coming up soon.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Date', 'Friday, Jun 20, 2026')}{kv('Time', '10:00 AM – 10:30 AM')}{kv('Provider', 'Dr. Sarah Chen')}{kv('Location', '42 Medical Plaza, Suite 3')}
      </tbody></table>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <a href="#" style={{ ...btn, marginBottom: 0, flex: 1, textAlign: 'center' as const, background: '#14b8a6' }} onClick={e => e.preventDefault()}>Reschedule</a>
        <a href="#" style={{ ...btn, marginBottom: 0, flex: 1, textAlign: 'center' as const, background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={e => e.preventDefault()}>Cancel</a>
      </div>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Health</div></div></div>
  )

  if (template === 'ApiKeyCreated') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#84cc16' }} /><div style={body}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>🔑</span>
        <h1 style={{ ...h1, margin: 0 }}>New API key created</h1>
      </div>
      <p style={p}>Hi Alice, a new API key was created on your account.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Key name', 'production-app')}{kv('Prefix', 'sk_live_a1b2c3...', true)}{kv('Created', 'Jun 18, 2026 — 09:14 UTC')}{kv('Expires', 'Jun 18, 2027')}
      </tbody></table>
      <div style={{ background: '#f7fee7', border: '1px solid #bef264', borderRadius: '8px', padding: '8px 12px', marginBottom: '0.75rem' }}>
        <p style={{ color: '#365314', fontSize: '0.74rem', margin: 0, lineHeight: 1.5 }}>Store your key securely — it will not be shown again.</p>
      </div>
      <a href="#" style={{ ...btn, background: '#84cc16' }} onClick={e => e.preventDefault()}>Manage API Keys →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'PasswordlessOtp') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Your sign-in code</h1><p style={p}>Use this code to sign in — no password needed.</p>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.28em', color: primary }}>593 847</span>
        <div style={{ color: '#94a3b8', fontSize: '0.67rem', marginTop: '3px' }}>Expires in 15 minutes · single use</div>
      </div>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>Didn't request this? Ignore — your account is safe.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'PhoneVerification') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Verify your phone number</h1>
      <p style={p}>Enter this code to verify <strong>+1 (555) 012-3456</strong></p>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.32em', color: primary }}>7 4 2 1</span>
        <div style={{ color: '#94a3b8', fontSize: '0.67rem', marginTop: '3px' }}>Expires in 10 minutes</div>
      </div>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'RegistrationConfirmation') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#10b981' }} /><div style={body}>
      <div style={{ textAlign: 'center' as const, marginBottom: '1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>🎉</div>
        <h1 style={{ ...h1, textAlign: 'center' as const }}>Account created!</h1>
        <p style={{ ...p, textAlign: 'center' as const }}>Welcome Alice — your Acme account is ready.</p>
      </div>
      <a href="#" style={{ ...btn, display: 'block', textAlign: 'center' as const, background: '#10b981' }} onClick={e => e.preventDefault()}>Go to Dashboard →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'ProfileUpdated') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#0891b2' }} /><div style={body}>
      <h1 style={h1}>Your profile was updated</h1><p style={p}>Hi Alice, the following changes were saved.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.71rem', marginBottom: '0.75rem' }}>
        <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ textAlign: 'left' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600, width: '33%' }}>Field</th>
          <th style={{ textAlign: 'left' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600, width: '33%' }}>Before</th>
          <th style={{ textAlign: 'left' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600 }}>After</th>
        </tr></thead>
        <tbody>
          {[['Display name', 'alice', 'Alice Johnson'], ['Timezone', 'UTC', 'America/Chicago'], ['Language', 'en', 'en-US']].map(([f, o, n]) => (
            <tr key={f} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '4px 0', color: '#64748b' }}>{f}</td>
              <td style={{ padding: '4px 0', color: '#94a3b8', textDecoration: 'line-through' }}>{o}</td>
              <td style={{ padding: '4px 0', color: '#0f172a', fontWeight: 600 }}>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'PasswordChangedConfirmation') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#10b981' }} /><div style={body}>
      <h1 style={h1}>Password changed</h1>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <div style={{ color: '#166534', fontWeight: 700, fontSize: '0.76rem' }}>✓ Password successfully updated</div>
        <div style={{ color: '#14532d', fontSize: '0.7rem', marginTop: '1px' }}>Jun 18, 2026 — 09:14 UTC</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Device', 'Chrome on macOS 14')}{kv('Location', 'San Francisco, CA')}{kv('IP', '198.51.100.42', true)}
      </tbody></table>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>If you didn't make this change, contact support immediately.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'EmailChangeVerification') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Confirm your new email</h1><p style={p}>Click below to confirm your email change.</p>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.75rem' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.67rem', marginBottom: '2px' }}>New address</div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: primary, fontFamily: 'monospace' }}>alice.new@example.com</div>
      </div>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>Confirm New Email →</a>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>Link expires in 24 hours.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'AccountDeactivated') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#f59e0b' }} /><div style={body}>
      <h1 style={h1}>Your account has been deactivated</h1>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <p style={{ color: '#78350f', fontSize: '0.76rem', margin: 0, lineHeight: 1.5 }}>Your account is deactivated. Data preserved — reactivate any time to restore access.</p>
      </div>
      <a href="#" style={{ ...btn, background: '#f59e0b' }} onClick={e => e.preventDefault()}>Reactivate Account →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'AccountLocked') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#ef4444' }} /><div style={body}>
      <h1 style={h1}>Account temporarily locked</h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <p style={{ color: '#7f1d1d', fontSize: '0.76rem', margin: 0, lineHeight: 1.5 }}><strong>Reason:</strong> Too many failed sign-in attempts. Locked for 30 minutes.</p>
      </div>
      <p style={{ ...p, fontSize: '0.73rem' }}>Need immediate access? Contact <strong style={{ color: primary }}>support@acme.com</strong></p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'AccountUnlocked') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#10b981' }} /><div style={body}>
      <div style={{ textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>🔓</div>
        <h1 style={{ ...h1, textAlign: 'center' as const }}>Account restored</h1>
        <p style={{ ...p, textAlign: 'center' as const }}>Your account has been unlocked. You can sign in again.</p>
      </div>
      <a href="#" style={{ ...btn, display: 'block', textAlign: 'center' as const, background: '#10b981' }} onClick={e => e.preventDefault()}>Sign In →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'AccountDeletionConfirmation') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#ef4444' }} /><div style={body}>
      <h1 style={h1}>Account deletion scheduled</h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <p style={{ color: '#7f1d1d', fontSize: '0.76rem', margin: 0, lineHeight: 1.5 }}>Account and all data permanently deleted on <strong>Jun 25, 2026</strong>. This cannot be undone.</p>
      </div>
      <a href="#" style={{ ...btn, background: '#64748b' }} onClick={e => e.preventDefault()}>Cancel Deletion →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'LoginActivity') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#0891b2' }} /><div style={body}>
      <h1 style={h1}>Recent login activity</h1><p style={p}>Hi Alice, here's a summary of recent sign-ins.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem', marginBottom: '0.75rem' }}>
        <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ textAlign: 'left' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600 }}>Time</th>
          <th style={{ textAlign: 'left' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600 }}>Device</th>
          <th style={{ textAlign: 'right' as const, padding: '3px 0', color: '#94a3b8', fontWeight: 600 }}>Status</th>
        </tr></thead>
        <tbody>
          {[['Jun 18, 09:14', 'Chrome · macOS', 'success'], ['Jun 17, 22:03', 'Safari · iPhone', 'success'], ['Jun 17, 14:55', 'Unknown · Linux', 'failed']].map(([t, d, s]) => (
            <tr key={t} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '4px 0', color: '#334155' }}>{t}</td>
              <td style={{ padding: '4px 0', color: '#64748b' }}>{d}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' as const }}>
                <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '10px', fontSize: '0.62rem', fontWeight: 700, background: s === 'success' ? '#dcfce7' : '#fef2f2', color: s === 'success' ? '#166534' : '#991b1b' }}>{s}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'DataExportRequest') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#0891b2' }} /><div style={body}>
      <h1 style={h1}>Your data export is ready</h1><p style={p}>Hi Alice, your requested export has been prepared.</p>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.75rem', textAlign: 'center' as const }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📦</div>
        <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.82rem' }}>acme-export-alice-2026-06.zip</div>
        <div style={{ color: '#3b82f6', fontSize: '0.68rem', marginTop: '2px' }}>4.2 MB · Expires Jun 25, 2026</div>
      </div>
      <a href="#" style={{ ...btn, background: '#2563eb', display: 'block', textAlign: 'center' as const }} onClick={e => e.preventDefault()}>Download Export →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'OrderConfirmation') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#10b981' }} /><div style={body}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div><h1 style={{ ...h1, marginBottom: '0.1rem' }}>Order confirmed!</h1><div style={{ color: '#94a3b8', fontSize: '0.67rem', fontFamily: 'monospace' }}>#ORD-2026-0892</div></div>
        <span style={{ background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px' }}>Paid</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem', marginBottom: '0.5rem' }}><tbody>
        {[['Wireless Headphones Pro', '$129.00'], ['USB-C Hub 7-in-1', '$49.00']].map(([n, pv]) => (
          <tr key={n} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '4px 0', color: '#1e293b' }}>{n}</td><td style={{ padding: '4px 0', textAlign: 'right' as const, fontWeight: 600, color: '#10b981' }}>{pv}</td></tr>
        ))}
        <tr><td style={{ padding: '5px 0', fontWeight: 700, color: '#0f172a' }}>Total</td><td style={{ padding: '5px 0', textAlign: 'right' as const, fontWeight: 800, color: '#10b981', fontSize: '0.9rem' }}>$178.00</td></tr>
      </tbody></table>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Shop</div></div></div>
  )

  if (template === 'RefundConfirmation') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#10b981' }} /><div style={body}>
      <div style={{ textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>💚</div>
        <h1 style={{ ...h1, textAlign: 'center' as const }}>Refund issued</h1>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>$49.00</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Refund ID', 'rfnd_a1b2c3d4', true)}{kv('Order', 'ORD-2026-0892', true)}{kv('Method', 'Visa ···· 4242')}{kv('Estimated', '3–5 business days')}
      </tbody></table>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Shop</div></div></div>
  )

  if (template === 'PaymentFailed') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#ef4444' }} /><div style={body}>
      <h1 style={h1}>Payment failed</h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <div style={{ color: '#991b1b', fontWeight: 700, fontSize: '0.76rem' }}>$29.00 — Pro Plan renewal</div>
        <div style={{ color: '#7f1d1d', fontSize: '0.7rem', marginTop: '2px' }}>Reason: Insufficient funds</div>
      </div>
      <p style={{ ...p, fontSize: '0.73rem' }}>Update your payment method to keep your subscription active.</p>
      <a href="#" style={{ ...btn, background: '#ef4444' }} onClick={e => e.preventDefault()}>Update Payment →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Shop</div></div></div>
  )

  if (template === 'BackInStock') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#10b981' }} /><div style={body}>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 10px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem' }}>✅</span>
        <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.76rem' }}>Back in stock!</span>
      </div>
      <h1 style={h1}>Wireless Headphones Pro</h1>
      <p style={p}>The item you were watching is available again. Grab it before it sells out.</p>
      <a href="#" style={{ ...btn, background: '#10b981' }} onClick={e => e.preventDefault()}>Shop Now →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Shop</div></div></div>
  )

  if (template === 'NewsletterConfirmation') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Confirm your subscription</h1>
      <p style={p}>You signed up for <strong>Acme Weekly</strong>. Click below to confirm.</p>
      <a href="#" style={{ ...btn, display: 'block', textAlign: 'center' as const }} onClick={e => e.preventDefault()}>Confirm Subscription →</a>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' as const, marginBottom: 0 }}>Didn't sign up? Safely ignore this.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp · <span style={{ color: '#94a3b8' }}>Unsubscribe</span></div></div></div>
  )

  if (template === 'WinBack') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <div style={{ textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <h1 style={{ ...h1, textAlign: 'center' as const }}>We miss you, Alice 💝</h1>
        <p style={{ ...p, textAlign: 'center' as const }}>It's been a while. Here's a special offer to welcome you back.</p>
        <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '2px dashed #f59e0b', borderRadius: '10px', padding: '0.65rem 1.5rem', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#92400e' }}>30% OFF</div>
          <div style={{ fontFamily: 'monospace', color: '#78350f', fontSize: '0.75rem', letterSpacing: '0.1em' }}>COMEBACK30</div>
        </div>
      </div>
      <a href="#" style={{ ...btn, display: 'block', textAlign: 'center' as const }} onClick={e => e.preventDefault()}>Claim Your Offer →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'Referral') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Your referral reward 🤝</h1>
      <p style={p}><strong>Bob</strong> joined Acme using your link. You've earned a reward!</p>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem', textAlign: 'center' as const }}>
        <div style={{ color: '#14532d', fontSize: '0.68rem', fontWeight: 600, marginBottom: '4px' }}>YOUR REFERRAL LINK</div>
        <div style={{ fontFamily: 'monospace', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>acme.com/ref/alice-j7k2</div>
      </div>
      <p style={{ ...p, fontSize: '0.73rem' }}>Reward: <strong>$10 account credit</strong> applied to next invoice.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'FeatureAnnouncement') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <div style={{ display: 'inline-block', background: `rgba(99,102,241,0.1)`, border: `1px solid rgba(99,102,241,0.3)`, borderRadius: '100px', padding: '0.2rem 0.65rem', fontSize: '0.63rem', fontWeight: 700, color: primary, fontFamily: 'monospace', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>NEW FEATURE</div>
      <h1 style={h1}>AI-powered search is here 🚀</h1>
      <p style={p}>Search your entire workspace with natural language. Available now on all plans.</p>
      {[['✦', 'Ask questions in plain English — get instant answers'], ['✦', 'Works across documents, conversations, and data'], ['✦', 'Privacy-first: data never used for training']].map(([icon, text]) => (
        <div key={text} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.73rem', color: '#334155' }}>
          <span style={{ color: primary, flexShrink: 0 }}>{icon}</span><span>{text}</span>
        </div>
      ))}
      <a href="#" style={{ ...btn, marginTop: '0.75rem' }} onClick={e => e.preventDefault()}>Try It Now →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'ReviewRequest') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>How was your experience?</h1>
      <p style={p}>You recently purchased <strong>Wireless Headphones Pro</strong>. We'd love your feedback.</p>
      <div style={{ textAlign: 'center' as const, marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1.6rem', letterSpacing: '0.15em', color: '#f59e0b', marginBottom: '0.3rem' }}>★ ★ ★ ★ ★</div>
        <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Click a star to rate</div>
      </div>
      <a href="#" style={{ ...btn, display: 'block', textAlign: 'center' as const }} onClick={e => e.preventDefault()}>Write a Review →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Shop</div></div></div>
  )

  if (template === 'SupportTicket') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#8b5cf6' }} /><div style={body}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h1 style={{ ...h1, margin: 0 }}>Ticket opened</h1>
        <span style={{ background: '#ddd6fe', color: '#4c1d95', fontWeight: 700, fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px', fontFamily: 'monospace' }}>#4892</span>
      </div>
      <p style={p}><strong>Subject:</strong> API rate limit errors in production</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Status', 'Open')}{kv('Priority', 'High')}{kv('Created', 'Jun 18, 2026 — 10:30 AM')}
      </tbody></table>
      <a href="#" style={{ ...btn, background: '#8b5cf6' }} onClick={e => e.preventDefault()}>View Ticket →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Support</div></div></div>
  )

  if (template === 'TeamInvite') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <div style={{ textAlign: 'center' as const, marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>👥</div>
        <h1 style={{ ...h1, textAlign: 'center' as const }}>You've been invited!</h1>
        <p style={{ ...p, textAlign: 'center' as const }}><strong>Bob Smith</strong> invited you to join <strong>Acme Engineering</strong>.</p>
      </div>
      <a href="#" style={{ ...btn, display: 'block', textAlign: 'center' as const }} onClick={e => e.preventDefault()}>Accept Invitation →</a>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' as const, marginBottom: 0 }}>Invitation expires in 7 days.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'CommentMention') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Bob mentioned you in a comment</h1>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `3px solid ${primary}`, borderRadius: '0 8px 8px 0', padding: '0.65rem 0.85rem', marginBottom: '0.75rem' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.67rem', marginBottom: '4px' }}>Bob Smith · Dashboard Redesign · 2m ago</div>
        <div style={{ fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.5 }}>Hey <strong style={{ color: primary }}>@alice</strong>, can you review the new layout? I think the metrics section needs your input.</div>
      </div>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>View Comment →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'UsageAlert') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#ef4444' }} /><div style={body}>
      <h1 style={h1}>Storage limit at 90%</h1>
      <p style={p}>Your workspace is using <strong>18 GB</strong> of your <strong>20 GB</strong> limit.</p>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginBottom: '4px' }}>
          <span>18 GB used</span><span>20 GB total</span>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: '90%', height: '100%', background: 'linear-gradient(90deg,#f59e0b,#ef4444)', borderRadius: '100px' }} />
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>90% — critical</div>
      </div>
      <a href="#" style={{ ...btn, background: '#ef4444' }} onClick={e => e.preventDefault()}>Upgrade Storage →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'ExportReady') return (
    <div style={outer}><div style={card}><div style={bar} /><div style={body}>
      <h1 style={h1}>Your export is ready ⬇️</h1>
      <p style={p}>The CSV export you requested is ready to download.</p>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📄</span>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>users-export-2026-06-18.csv</div>
          <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: '2px' }}>1,247 rows · 842 KB · Expires in 72h</div>
        </div>
      </div>
      <a href="#" style={btn} onClick={e => e.preventDefault()}>Download CSV →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'MaintenanceNotification') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#f59e0b' }} /><div style={body}>
      <h1 style={h1}>Scheduled maintenance</h1>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
        <div style={{ color: '#78350f', fontWeight: 700, fontSize: '0.76rem' }}>🔧 Planned downtime</div>
        <div style={{ color: '#92400e', fontSize: '0.7rem', marginTop: '2px' }}>Jun 22, 2026 · 2:00 AM – 4:00 AM UTC</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.6rem' }}><tbody>
        {kv('Duration', '~2 hours')}{kv('Affected', 'API, Dashboard, Webhooks')}
      </tbody></table>
      <p style={{ ...p, fontSize: '0.72rem', color: '#94a3b8', marginBottom: 0 }}>No action required. Systems restore automatically.</p>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'Subscription') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#fb923c' }} /><div style={body}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h1 style={{ ...h1, margin: 0 }}>Subscription activated</h1>
        <span style={{ background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.62rem', padding: '2px 8px', borderRadius: '10px' }}>Active</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}><tbody>
        {kv('Plan', 'Pro Annual')}{kv('Billing', '$299.00 / year')}{kv('Next renewal', 'Jun 18, 2027')}{kv('Seats', '5 included')}
      </tbody></table>
      <a href="#" style={{ ...btn, background: '#fb923c' }} onClick={e => e.preventDefault()}>Manage Subscription →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'PolicyUpdate') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#fb923c' }} /><div style={body}>
      <h1 style={h1}>Terms of Service updated</h1>
      <p style={p}>These changes take effect on <strong>Jul 1, 2026</strong>.</p>
      <div style={{ marginBottom: '0.75rem' }}>
        {['Data retention extended from 1 to 2 years', 'Clearer language on third-party integrations', 'New opt-out options for analytics'].map(change => (
          <div key={change} style={{ display: 'flex', gap: '0.5rem', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.73rem', color: '#334155' }}>
            <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span><span>{change}</span>
          </div>
        ))}
      </div>
      <a href="#" style={{ ...btn, background: '#fb923c' }} onClick={e => e.preventDefault()}>Review Full Changes →</a>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Corp</div></div></div>
  )

  if (template === 'EventInvitation') return (
    <div style={outer}><div style={card}><div style={{ height: '4px', background: '#14b8a6' }} /><div style={body}>
      <div style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', borderRadius: '8px', padding: '1rem', marginBottom: '0.85rem', textAlign: 'center' as const }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '4px' }}>YOU'RE INVITED</div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2, marginBottom: '4px' }}>TypeScript Summit 2026</div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem' }}>Tue, Sep 15 · 9:00 AM – 5:00 PM UTC</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', marginTop: '2px' }}>Online — Zoom</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a href="#" style={{ ...btn, marginBottom: 0, flex: 1, textAlign: 'center' as const, background: '#14b8a6' }} onClick={e => e.preventDefault()}>Register Now →</a>
        <a href="#" style={{ ...btn, marginBottom: 0, flex: 1, textAlign: 'center' as const, background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem' }} onClick={e => e.preventDefault()}>Add to Calendar</a>
      </div>
    </div><div style={div_} /><div style={foot}>© 2026 Acme Events</div></div></div>
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
  GiftCard:          `await mailer.send(GiftCard, { to: 'alice@example.com', props: {\n  recipientName: 'Alice', amount: 5000, currency: 'USD',\n  code: 'GIFT-A1B2-C3D4', message: 'Happy birthday! Enjoy shopping! 🎉',\n  expiresAt: new Date('2026-12-31'), appName: 'Acme Shop',\n} })`,
  AppointmentReminder:`await mailer.send(AppointmentReminder, { to: 'alice@example.com', props: {\n  name: 'Alice', date: 'Friday, Jun 20, 2026', time: '10:00 AM – 10:30 AM',\n  provider: 'Dr. Sarah Chen', location: '42 Medical Plaza, Suite 3',\n  rescheduleUrl: 'https://app.acme.com/reschedule/apt_123',\n  cancelUrl: 'https://app.acme.com/cancel/apt_123', appName: 'Acme Health',\n} })`,
  EventInvitation:   `await mailer.send(EventInvitation, { to: 'alice@example.com', props: {\n  name: 'Alice', eventName: 'TypeScript Summit 2026',\n  date: 'Tuesday, Sep 15, 2026', time: '9:00 AM – 5:00 PM UTC',\n  location: 'Online — Zoom', registerUrl: 'https://events.acme.com/ts-summit/register',\n  calendarUrl: 'https://events.acme.com/ts-summit/calendar.ics', appName: 'Acme Events',\n} })`,
  ApiKeyCreated:     `await mailer.send(ApiKeyCreated, { to: 'alice@example.com', props: {\n  name: 'Alice', keyName: 'production-app', keyPrefix: 'sk_live_a1b2c3',\n  event: 'created', expiresAt: new Date('2027-06-18'), appName: 'Acme',\n} })\n\n// event: 'revoked' — uses danger AlertBox\n// event: 'expiring' — uses warning AlertBox with daysLeft in subject`,
  PasswordlessOtp:   `await mailer.send(PasswordlessOtp, { to: 'alice@example.com', props: { username: 'alice.j', code: '593 847', appName: 'Acme' } })`,
  PhoneVerification: `await mailer.send(PhoneVerification, { to: 'alice@example.com', props: { phoneNumber: '+1 (555) 012-3456', code: '7421', appName: 'Acme' } })`,
  RegistrationConfirmation: `await mailer.send(RegistrationConfirmation, { to: 'alice@example.com', props: { name: 'Alice', dashboardUrl: 'https://app.acme.com/dashboard', appName: 'Acme' } })`,
  ProfileUpdated:    `await mailer.send(ProfileUpdated, { to: 'alice@example.com', props: {\n  name: 'Alice', appName: 'Acme',\n  changes: [\n    { field: 'Display name', oldValue: 'alice', newValue: 'Alice Johnson' },\n    { field: 'Timezone', oldValue: 'UTC', newValue: 'America/Chicago' },\n  ],\n} })`,
  PasswordChangedConfirmation: `await mailer.send(PasswordChangedConfirmation, { to: 'alice@example.com', props: {\n  name: 'Alice', appName: 'Acme',\n  ipAddress: '198.51.100.42', device: 'Chrome on macOS 14', location: 'San Francisco, CA',\n  timestamp: 'Jun 18, 2026 — 09:14 UTC',\n} })`,
  EmailChangeVerification: `await mailer.send(EmailChangeVerification, { to: 'alice@example.com', props: {\n  name: 'Alice', newEmail: 'alice.new@example.com',\n  verifyUrl: 'https://app.acme.com/verify-email/tok_xyz', appName: 'Acme',\n} })`,
  AccountDeactivated:`await mailer.send(AccountDeactivated, { to: 'alice@example.com', props: { name: 'Alice', reactivateUrl: 'https://app.acme.com/reactivate', appName: 'Acme' } })`,
  AccountLocked:     `await mailer.send(AccountLocked, { to: 'alice@example.com', props: {\n  name: 'Alice', reason: 'too_many_attempts', supportEmail: 'support@acme.com', appName: 'Acme',\n} })`,
  AccountUnlocked:   `await mailer.send(AccountUnlocked, { to: 'alice@example.com', props: { name: 'Alice', loginUrl: 'https://app.acme.com/login', appName: 'Acme' } })`,
  AccountDeletionConfirmation: `await mailer.send(AccountDeletionConfirmation, { to: 'alice@example.com', props: {\n  name: 'Alice', event: 'scheduled', appName: 'Acme',\n  cancelUrl: 'https://app.acme.com/cancel-deletion',\n} })\n// event: 'completed' — danger box\n// event: 'cancelled' — success box`,
  LoginActivity:     `await mailer.send(LoginActivity, { to: 'alice@example.com', props: {\n  name: 'Alice', appName: 'Acme',\n  events: [\n    { timestamp: 'Jun 18, 09:14 UTC', device: 'Chrome on macOS', location: 'San Francisco, CA', status: 'success' },\n    { timestamp: 'Jun 17, 14:55 UTC', device: 'Unknown on Linux', location: 'Moscow, Russia',   status: 'failed'  },\n  ],\n} })`,
  DataExportRequest: `await mailer.send(DataExportRequest, { to: 'alice@example.com', props: {\n  name: 'Alice', event: 'ready', appName: 'Acme',\n  downloadUrl: 'https://app.acme.com/exports/acme-export-alice.zip',\n  expiresAt: new Date('2026-06-25'),\n} })\n// event: 'expired' — shows re-request CTA`,
  OrderConfirmation: `await mailer.send(OrderConfirmation, { to: 'alice@example.com', props: {\n  customerName: 'Alice Johnson', orderNumber: 'ORD-2026-0892', currency: 'USD',\n  items: [\n    { name: 'Wireless Headphones Pro', quantity: 1, price: 12900 },\n    { name: 'USB-C Hub 7-in-1',        quantity: 1, price: 4900  },\n  ],\n} })`,
  RefundConfirmation:`await mailer.send(RefundConfirmation, { to: 'alice@example.com', props: {\n  customerName: 'Alice Johnson', amount: 4900, currency: 'USD',\n  refundId: 'rfnd_a1b2c3d4', orderId: 'ORD-2026-0892',\n  paymentMethod: 'Visa ···· 4242', appName: 'Acme Shop',\n} })`,
  PaymentFailed:     `await mailer.send(PaymentFailed, { to: 'alice@example.com', props: {\n  customerName: 'Alice Johnson', amount: 2900, currency: 'USD',\n  reason: 'Insufficient funds', updateUrl: 'https://app.acme.com/billing', appName: 'Acme',\n} })`,
  BackInStock:       `await mailer.send(BackInStock, { to: 'alice@example.com', props: {\n  name: 'Alice', productName: 'Wireless Headphones Pro',\n  productUrl: 'https://shop.acme.com/products/headphones-pro', appName: 'Acme Shop',\n} })`,
  NewsletterConfirmation: `await mailer.send(NewsletterConfirmation, { to: 'alice@example.com', props: {\n  name: 'Alice', confirmUrl: 'https://acme.com/newsletter/confirm/tok_abc',\n  unsubscribeUrl: 'https://acme.com/newsletter/unsubscribe/tok_xyz', appName: 'Acme',\n} })`,
  WinBack:           `await mailer.send(WinBack, { to: 'alice@example.com', props: {\n  name: 'Alice', ctaUrl: 'https://app.acme.com/return?promo=COMEBACK30',\n  discount: 'COMEBACK30', appName: 'Acme',\n} })`,
  Referral:          `await mailer.send(Referral, { to: 'alice@example.com', props: {\n  name: 'Alice', event: 'reward_earned', appName: 'Acme',\n  referralUrl: 'https://acme.com/ref/alice-j7k2',\n  rewardDescription: '$10 account credit applied to next invoice',\n} })`,
  FeatureAnnouncement:`await mailer.send(FeatureAnnouncement, { to: 'alice@example.com', props: {\n  name: 'Alice', featureName: 'AI-powered search', appName: 'Acme',\n  ctaUrl: 'https://app.acme.com/search',\n  changes: [\n    'Ask questions in plain English — get instant answers',\n    'Works across documents, conversations, and data',\n    'Privacy-first: data never used for training',\n  ],\n} })`,
  ReviewRequest:     `await mailer.send(ReviewRequest, { to: 'alice@example.com', props: {\n  name: 'Alice', productName: 'Wireless Headphones Pro',\n  reviewUrl: 'https://shop.acme.com/products/headphones-pro/review',\n  orderDate: 'Jun 10, 2026', appName: 'Acme Shop',\n} })`,
  SupportTicket:     `await mailer.send(SupportTicket, { to: 'alice@example.com', props: {\n  name: 'Alice', ticketId: '4892', event: 'opened', appName: 'Acme Support',\n  subject: 'API rate limit errors in production',\n  ctaUrl: 'https://support.acme.com/tickets/4892',\n} })\n// event: 'replied' | 'resolved' | 'closed'`,
  TeamInvite:        `await mailer.send(TeamInvite, { to: 'alice@example.com', props: {\n  name: 'Alice', inviterName: 'Bob Smith', teamName: 'Acme Engineering',\n  inviteUrl: 'https://app.acme.com/invite/tok_team123', appName: 'Acme',\n} })`,
  CommentMention:    `await mailer.send(CommentMention, { to: 'alice@example.com', props: {\n  name: 'Alice', mentionedBy: 'Bob Smith', event: 'mentioned',\n  contextUrl: 'https://app.acme.com/projects/dashboard/comments#c-42', appName: 'Acme',\n} })`,
  UsageAlert:        `await mailer.send(UsageAlert, { to: 'alice@example.com', props: {\n  name: 'Alice', resource: 'Storage', used: 18, limit: 20, severity: 'critical',\n  ctaUrl: 'https://app.acme.com/billing/upgrade', appName: 'Acme',\n} })\n// severity: 'warning' (>75%) | 'critical' (>90%) | 'exceeded'`,
  ExportReady:       `await mailer.send(ExportReady, { to: 'alice@example.com', props: {\n  name: 'Alice', exportType: 'CSV', appName: 'Acme',\n  downloadUrl: 'https://app.acme.com/exports/users-export-2026-06-18.csv',\n  expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),\n} })`,
  MaintenanceNotification: `await mailer.send(MaintenanceNotification, { to: 'alice@example.com', props: {\n  name: 'Alice', event: 'scheduled', appName: 'Acme',\n  startTime: new Date('2026-06-22T02:00:00Z'),\n  endTime: new Date('2026-06-22T04:00:00Z'),\n  affectedServices: ['API', 'Dashboard', 'Webhooks'],\n} })\n// event: 'started' | 'completed' | 'extended'`,
  Subscription:      `await mailer.send(Subscription, { to: 'alice@example.com', props: {\n  name: 'Alice', event: 'activated', plan: 'Pro Annual',\n  ctaUrl: 'https://app.acme.com/billing', appName: 'Acme',\n} })\n// event: 'trial_started' | 'trial_ending' | 'activated'\n//        'cancelled' | 'expired' | 'renewed' | 'paused'`,
  PolicyUpdate:      `await mailer.send(PolicyUpdate, { to: 'alice@example.com', props: {\n  name: 'Alice', policyType: 'Terms of Service', appName: 'Acme',\n  effectiveDate: new Date('2026-07-01'),\n  ctaUrl: 'https://acme.com/legal/terms',\n  changes: [\n    'Data retention extended from 1 to 2 years',\n    'Clearer language on third-party integrations',\n    'New opt-out options for analytics',\n  ],\n} })`,
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
              {[`${totalTemplates} Templates`, '6 Providers', 'sendBatch + Rate Limiting', 'Webhooks (Resend · Postmark)', 'React <EmailPreview>', 'mailpit local dev', 'Unsubscribe Headers', 'Middleware · embedImages', 'Attachments + CID inline', 'WireMock · LocalStack dev', 'WCAG AA · 52 variants', '33 Design Tokens + PALETTE', 'tierde dev · send · render'].map(t => (
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

        {/* ── What's New in v0.8.1 ── */}
        <Card style={{ marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.3)', background: 'linear-gradient(135deg,#1a0505 0%,#0f0c29 100%)' }}>
          <Label>What&apos;s New — v0.8.1</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>Middleware pipeline · Attachments · embedImages · WireMock/LocalStack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.65rem' }}>
            {[
              { color: '#8b5cf6', icon: '⚙️', title: 'Middleware pipeline', desc: 'middleware: [] on createMailer — ordered MailMiddleware transforms run on every EmailMessage before the provider call' },
              { color: '#10b981', icon: '🖼️', title: 'embedImages()', desc: 'Built-in middleware: fetches remote images and embeds them as CID inline attachments — email clients that block remote images still render them' },
              { color: '#f59e0b', icon: '📎', title: 'Attachments API', desc: 'Send files via attachments[] on send() and sendBatch(). Shared + per-recipient, inline CID, content-type allowlist enforced before provider call' },
              { color: '#06b6d4', icon: '🧪', title: 'WireMock + LocalStack', desc: 'Docker Compose dev stack: WireMock stubs Resend/SendGrid/Postmark HTTP APIs, LocalStack mocks SES — smoke-test delivery without real credentials' },
              { color: '#ef4444', icon: '🗂️', title: 'collectResults: false', desc: 'sendBatch memory mode for large lists — skip per-recipient result retention, consume results via onResult, sent/failed counts stay accurate' },
              { color: '#6366f1', icon: '🔌', title: 'baseUrl on providers', desc: 'Resend, SendGrid, Postmark now accept baseUrl to redirect calls at WireMock or any HTTP mock — no env var hacks needed' },
              { color: '#84cc16', icon: '📝', title: 'htmlToPlainText()', desc: 'Convert rendered HTML to a readable plain-text fallback — utility exposed for custom template pipelines' },
              { color: '#fca5a5', icon: '🛡️', title: 'validateAttachment()', desc: 'Explicit attachment validation before the send — surfaces filename/CID/content-type errors early in your own pipelines' },
            ].map(({ color, icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '0.6rem', background: 'rgba(30,41,59,0.4)', borderRadius: '10px', padding: '0.75rem', border: `1px solid ${color}18` }}>
                <div style={{ width: '3px', borderRadius: '2px', background: color, alignSelf: 'stretch', flexShrink: 0 }} />
                <div>
                  <div style={{ color, fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.15rem' }}>{icon} {title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── CLI — tierde dev ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>CLI — tierde dev</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>One-command email preview server</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Starts a local preview server with all {totalTemplates} built-in templates and canonical sample data — no config, no script needed. New in v0.5.0: WCAG AA audit via <code style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#fca5a5' }}>pnpm wcag</code>.
          </p>
          <Code>{`# Start the preview server with all 45 templates + sample data:
npx tierde dev
# → http://localhost:3000
#   - live reload via SSE (auto-refreshes on file change)
#   - dark mode toggle (injects color-scheme:dark into iframe)
#   - compare mode (side-by-side iframe with independent selectors)

npx tierde dev --port 4000  # custom port

# WCAG AA audit — 52 variant tests, runs in CI:
pnpm wcag    # audits all 52 template variants for color contrast

# Render a single template to HTML (no server):
npx tierde render Welcome --props '{"name":"Alice","loginUrl":"https://app.com/start"}'
npx tierde render GiftCard --props '{"recipientName":"Alice","amount":5000,"code":"GIFT-A1B2"}' -o gift.html
npx tierde render Welcome --text  # plain-text output

# Smoke-test real delivery via TIERDE_PROVIDER env:
npx tierde send Welcome --to alice@example.com --props '{"name":"Alice","loginUrl":"..."}'

# Eject built-in templates for full customization:
npx tierde eject --list                           # print all 45 template names (pipe-friendly)
npx tierde eject --all emails/                    # eject all 45 into emails/ directory
npx tierde eject AppointmentReminder EventInvitation ApiKeyCreated GiftCard`}</Code>
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
// ses:       SES_REGION (or AWS_REGION), SES_ENDPOINT (optional, e.g. LocalStack)
// sendgrid:  SENDGRID_API_KEY, SENDGRID_BASE_URL (optional, e.g. WireMock)
// postmark:  POSTMARK_SERVER_TOKEN, POSTMARK_BASE_URL (optional, e.g. WireMock)
// mailpit:   MAILPIT_HOST (localhost), MAILPIT_PORT (1025)

// Swap providers without changing application code:
// TIERDE_PROVIDER=mailpit pnpm dev    ← captures to local Mailpit
// TIERDE_PROVIDER=resend  pnpm start  ← delivers for real`}</Code>
        </Card>

        {/* ── Middleware ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Middleware Pipeline</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Transform every message before the provider call</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>MailMiddleware</code> is <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>(message: EmailMessage) =&gt; EmailMessage | Promise&lt;EmailMessage&gt;</code>. Middleware runs in order, per-recipient, after rendering and before the provider. Built-in: <code style={{ fontFamily: 'monospace', color: '#fca5a5' }}>embedImages()</code>.
          </p>
          <Code>{`import { createMailer, embedImages } from '@yedoma-labs/tierde-mail'
import type { MailMiddleware } from '@yedoma-labs/tierde-mail'
import { smtp } from '@yedoma-labs/tierde-mail/providers/smtp'
import { randomUUID } from 'node:crypto'

// ── Built-in: embedImages ──────────────────────────────────────────
// Fetches remote images and swaps src="https://..." → src="cid:<filename>"
// Images are cached per middleware instance (batch-safe).
// SSRF warning: embedImages() without a list fetches ALL remote src attrs.
const mailer = createMailer({
  provider: smtp({ host: 'smtp.acme.com', port: 587, auth: { user: '...', pass: '...' } }),
  from: 'hello@acme.com',
  middleware: [
    embedImages([
      'https://raw.githubusercontent.com/yedoma-labs/assets/main/banner.png',
    ]),
  ],
})

// ── Custom middleware: open-tracking pixel ─────────────────────────
export const trackOpens = (baseUrl: string): MailMiddleware =>
  (msg) => ({
    ...msg,
    html: msg.html + \`<img src="\${baseUrl}/\${randomUUID()}" width="1" height="1" alt="" />\`,
  })

// ── Custom middleware: click tracking ─────────────────────────────
export const trackClicks = (baseUrl: string): MailMiddleware =>
  (msg) => ({
    ...msg,
    html: msg.html.replace(
      /href="(https?:[^"]+)"/g,
      (_, url) => \`href="\${baseUrl}?url=\${encodeURIComponent(url)}"\`,
    ),
  })

const trackedMailer = createMailer({
  provider: smtp({ host: 'smtp.acme.com', port: 587, auth: { user: '...', pass: '...' } }),
  from: 'hello@acme.com',
  middleware: [
    trackOpens('https://track.acme.com/open'),    // pixel injection first
    trackClicks('https://track.acme.com/click'),  // then rewrite links
  ],
})

// Middleware runs per-recipient — each send gets its own pixel URL.
// Subject + attachments are re-validated AFTER middleware runs.`}</Code>
        </Card>

        {/* ── Attachments ── */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <Label>Attachments</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Files, inline images, per-recipient attachments</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            Pass <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>attachments[]</code> on <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>send()</code> or <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>sendBatch()</code>. Allowed types: PDF, ZIP, images, CSV, plain text. Filenames may not contain <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>..</code>, slashes, or control characters. SVG is blocked (active content). Validated before any provider call.
          </p>
          <Code>{`import { validateAttachment } from '@yedoma-labs/tierde-mail'
import { InvoiceEmail } from '@/emails/InvoiceEmail'

// ── Per-send attachment ────────────────────────────────────────────
await mailer.send(InvoiceEmail, {
  to: 'alice@example.com',
  props: { customerName: 'Alice', invoiceNumber: 'INV-001', items: [...] },
  attachments: [
    {
      filename: 'invoice-2026-06.pdf',
      content: pdfBuffer,            // Buffer or base64 string
      contentType: 'application/pdf',
    },
  ],
})

// ── Inline image (CID) ────────────────────────────────────────────
// Embed logo directly — no remote fetch, works in all clients
await mailer.send(WelcomeEmail, {
  to: 'alice@example.com',
  props: { name: 'Alice', loginUrl: '...' },
  attachments: [
    {
      filename: 'logo.png',
      content: logoBuffer,
      contentType: 'image/png',
      cid: 'logo.png',              // reference in JSX: src="cid:logo.png"
    },
  ],
})

// ── Batch: shared + per-recipient ────────────────────────────────
await mailer.sendBatch(InvoiceEmail, {
  attachments: [
    // Shared: every recipient gets this
    { filename: 'terms.pdf', content: termsBuffer, contentType: 'application/pdf' },
  ],
  recipients: [
    {
      to: 'alice@example.com',
      props: { customerName: 'Alice', invoiceNumber: 'INV-001', items: [...] },
      attachments: [
        // Per-recipient: appended after shared
        { filename: 'invoice-alice.pdf', content: alicePdf, contentType: 'application/pdf' },
      ],
    },
    {
      to: 'bob@example.com',
      props: { customerName: 'Bob', invoiceNumber: 'INV-002', items: [...] },
      attachments: [
        { filename: 'invoice-bob.pdf', content: bobPdf, contentType: 'application/pdf' },
      ],
    },
  ],
})

// ── Validate explicitly (optional) ───────────────────────────────
// Use in your own pipelines before attachments reach the mailer:
validateAttachment({ filename: 'report.csv', content: csvData, contentType: 'text/csv' })
// throws TypeError on invalid filename, CID, or content type`}</Code>
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
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }}>Rate limiting — maxPerSecond (token-bucket)</div>
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
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, margin: '1.25rem 0 0.75rem' }}>Large batches — collectResults: false</div>
          <Code>{`// Default: results array holds one entry (with its props) per recipient — O(n) heap.
// For very large batches set collectResults: false — sent/failed counts stay accurate,
// consume each result via onResult as it completes, results array stays empty.
let sent = 0
await mailer.sendBatch(NewsletterEmail, {
  recipients: hundredsOfThousands,
  maxPerSecond: 10,
  collectResults: false,
  onResult(r) {
    if (r.result) sent++
    else logBounce(r.to, r.error)
  },
})`}</Code>
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
          <Label>Local Dev</Label>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Mailpit · WireMock · LocalStack — zero real credentials needed</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            A <code style={{ fontFamily: 'monospace', color: '#94a3b8' }}>docker-compose.yml</code> ships with the package. <strong style={{ color: '#e2e8f0' }}>Mailpit</strong> catches SMTP sends. <strong style={{ color: '#e2e8f0' }}>WireMock</strong> stubs the Resend/SendGrid/Postmark HTTP APIs. <strong style={{ color: '#e2e8f0' }}>LocalStack</strong> mocks SES — no real AWS account.
          </p>
          <Code>{`# Start the full dev stack (Mailpit + WireMock + LocalStack):
docker compose up -d
# Mailpit SMTP  → localhost:1025   (catch-all SMTP sink)
# Mailpit UI    → http://localhost:8025
# WireMock      → http://localhost:8080  (Resend / SendGrid / Postmark stubs)
# LocalStack    → http://localhost:4566  (SES API mock)

# ── mailpit: direct SMTP, zero config ────────────────────────────
import { createMailer } from '@yedoma-labs/tierde-mail'
import { mailpit } from '@yedoma-labs/tierde-mail/providers/mailpit'

const mailer = createMailer({ provider: mailpit(), from: 'dev@localhost' })
// → all sends captured at http://localhost:8025

# ── Resend/SendGrid/Postmark via WireMock (baseUrl) ──────────────
import { resend }    from '@yedoma-labs/tierde-mail/providers/resend'
import { sendgrid }  from '@yedoma-labs/tierde-mail/providers/sendgrid'
import { postmark }  from '@yedoma-labs/tierde-mail/providers/postmark'

resend({   apiKey: 'test', baseUrl: 'http://localhost:8080' })
sendgrid({ apiKey: 'test', baseUrl: 'http://localhost:8080' })
postmark({ serverToken: 'test', baseUrl: 'http://localhost:8080' })
// WireMock returns a mock message ID — zero real HTTP calls

# ── SES via LocalStack ───────────────────────────────────────────
import { ses } from '@yedoma-labs/tierde-mail/providers/ses'

ses({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
})
// LocalStack accepts SES calls — no real AWS account needed

# ── Or use env vars (createMailerFromEnv) ────────────────────────
TIERDE_PROVIDER=mailpit pnpm dev          # → Mailpit
TIERDE_PROVIDER=resend RESEND_BASE_URL=http://localhost:8080 pnpm dev  # → WireMock`}</Code>
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
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 0.35rem' }}>createTheme — 33 design tokens + PALETTE, live preview</h2>
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
  // All 33 tokens (core + semantic):
  // primaryHover, primaryText, secondary, secondaryText,
  // background, cardBackground, surfaceSubtle,
  // textPrimary, textSecondary, textMuted,
  // border, borderSubtle, fontFamily, maxWidth,
  // logo?, logoAlt?, logoWidth?
  // successBg, successBorder, successText,
  // dangerBg, dangerBorder, dangerText,
  // warningBg, warningBorder, warningText,
  // infoBg, infoBorder, infoText
  // PALETTE: changelog (new/improvement/fix), impact, severity, trial
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
          <h2 style={{ color: '#f1f5f9', fontSize: '1.15rem', margin: '0 0 1.25rem' }}>{totalTemplates} templates across 9 categories</h2>
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
