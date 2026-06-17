'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'
import { submitContactForm, subscribeNewsletter } from '@/app/actions'
import pkg from '../../package.json'

const SIRFORMS_VERSION = (pkg.dependencies as Record<string, string>)['@yedoma-labs/sir-forms']
import { useFormState, recordSubmission, resetFormState } from '@/lib/formStore'
import { formLogger } from '@/lib/clientLogger'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const msgStyle = (ok: boolean) => ({
  marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
  background: ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
  color: ok ? '#10b981' : '#ef4444',
  border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
})

function ContactForm() {
  const form = useForm()
  const nameField = useField('name')
  const emailField = useField('email')
  const messageField = useField('message')
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleSubmit = useFormSubmit(submitContactForm, {
    onSuccess: (data: any) => {
      formLogger.info('Contact form submission succeeded', { data })
      if (data?.name) {
        formLogger.debug('Recording submission', { name: data.name })
        recordSubmission(data.name)
        setMessage({ text: `Thanks ${data.name}! We'll be in touch soon.`, isError: false })
      } else {
        formLogger.warn('No name in success data', { data })
        setMessage({ text: 'Form submitted successfully!', isError: false })
      }
    },
    onError: (errors) => {
      formLogger.error('Validation errors', { errors })
      setMessage({ text: 'Please fix the errors above.', isError: true })
    },
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>📧 Contact Form</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Using <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>FormProvider</code>,{' '}
        <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>useField</code>, and{' '}
        <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>useFormSubmit</code> from sir-forms v{SIRFORMS_VERSION}
      </p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="sf-name">Name *</label>
          <input
            id="sf-name"
            type="text"
            name={nameField.name}
            value={(nameField.value as string) ?? ''}
            onChange={nameField.onChange}
            aria-invalid={nameField.error ? 'true' : 'false'}
            aria-describedby={nameField.error ? 'sf-name-error' : undefined}
            disabled={form.isSubmitting}
            required
          />
          {nameField.error && <div id="sf-name-error" className="error" role="alert">{nameField.error}</div>}
        </div>
        <div>
          <label htmlFor="sf-email">Email *</label>
          <input
            id="sf-email"
            type="email"
            name={emailField.name}
            value={(emailField.value as string) ?? ''}
            onChange={emailField.onChange}
            aria-invalid={emailField.error ? 'true' : 'false'}
            aria-describedby={emailField.error ? 'sf-email-error' : undefined}
            disabled={form.isSubmitting}
            required
          />
          {emailField.error && <div id="sf-email-error" className="error" role="alert">{emailField.error}</div>}
        </div>
        <div>
          <label htmlFor="sf-message">Message *</label>
          <textarea
            id="sf-message"
            rows={4}
            name={messageField.name}
            value={(messageField.value as string) ?? ''}
            onChange={messageField.onChange}
            aria-invalid={messageField.error ? 'true' : 'false'}
            aria-describedby={messageField.error ? 'sf-message-error' : undefined}
            disabled={form.isSubmitting}
            required
          />
          {messageField.error && <div id="sf-message-error" className="error" role="alert">{messageField.error}</div>}
        </div>
        <button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Submitting...' : 'Submit Contact Form'}
        </button>
        {message && <div style={msgStyle(!message.isError)}>{message.text}</div>}
      </form>
    </section>
  )
}

function NewsletterForm() {
  const form = useForm()
  const emailField = useField('email')
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleSubmit = useFormSubmit(subscribeNewsletter, {
    onSuccess: () => {
      setMessage({ text: 'Successfully subscribed! 🎉', isError: false })
    },
    onError: () => {
      setMessage({ text: 'Please fix the errors above.', isError: true })
    },
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>📬 Newsletter Signup</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Minimal form — single field with sir-forms hooks, server-side email validation
      </p>
      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
        <div>
          <label htmlFor="newsletter-email">Email Address *</label>
          <input
            id="newsletter-email"
            type="email"
            name={emailField.name}
            value={(emailField.value as string) ?? ''}
            onChange={emailField.onChange}
            aria-invalid={emailField.error ? 'true' : 'false'}
            aria-describedby={emailField.error ? 'newsletter-email-error' : undefined}
            disabled={form.isSubmitting}
            placeholder="your@email.com"
            required
          />
          {emailField.error && <div id="newsletter-email-error" className="error" role="alert">{emailField.error}</div>}
        </div>
        <button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
        {message && <div style={msgStyle(!message.isError)}>{message.text}</div>}
      </form>
    </section>
  )
}

function SubmissionTracker() {
  const formState = useFormState()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(139,92,246,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ color: '#f1f5f9', marginBottom: '0.3rem' }}>📊 ichchi-state Tracker</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Persistent state via <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>createStore</code> — survives page reloads via localStorage
          </p>
        </div>
        {formState.submissionCount > 0 && (
          <button
            type="button"
            onClick={resetFormState}
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}
          >
            Reset State
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>{formState.submissionCount}</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Submissions</div>
        </div>
        <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 }}>{formState.lastSubmittedName ?? '—'}</div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Submitted By</div>
        </div>
      </div>

      {formState.recentSubmissions.length > 0 && (
        <div>
          <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Recent Submissions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {formState.recentSubmissions.map((sub: any) => (
              <div key={sub.timestamp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', padding: '0.6rem 0.9rem', border: '1px solid #1e293b' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{sub.name}</span>
                <span style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'monospace' }}>{new Date(sub.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {formState.submissionCount === 0 && (
        <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.875rem', padding: '1rem' }}>
          Submit the contact form above to see state tracking in action ↑
        </div>
      )}
    </section>
  )
}

export default function SirFormsPage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
      <style>{`
        html, body { background: #0f172a !important; }
        h1, h2, h3, h4 { color: #f1f5f9; }
        p { color: #94a3b8; }
        label { color: #cbd5e1 !important; display: block; margin-bottom: 0.4rem; font-size: 0.875rem; font-weight: 500; }
        input:not([type="checkbox"]), textarea {
          background: #0a0f1e !important; border: 1px solid #1e293b !important;
          color: #e2e8f0 !important; border-radius: 8px; padding: 0.65rem 0.8rem;
          width: 100%; box-sizing: border-box; margin-bottom: 0.75rem; font-size: 0.9rem;
        }
        input:not([type="checkbox"]):focus, textarea:focus {
          outline: none; border-color: #8b5cf6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        button[type="submit"] {
          background: linear-gradient(135deg, #8b5cf6, #6366f1) !important;
          color: white !important; border: none; padding: 0.75rem 1.5rem;
          border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%;
          margin-top: 0.5rem; font-size: 0.95rem; transition: filter 0.2s;
        }
        button[type="submit"]:hover:not(:disabled) { filter: brightness(1.12); }
        button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #ef4444 !important; font-size: 0.8rem; margin-top: -0.4rem; margin-bottom: 0.75rem; display: block; }
        form { background: transparent !important; }
        code { font-family: monospace; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#8b5cf6', textDecoration: 'none', fontSize: '0.875rem' }}>← All Demos</Link>
        <span style={{ color: '#1e293b' }}>·</span>
        <a href="https://www.npmjs.com/package/@yedoma-labs/sir-forms" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.875rem' }}>npm ↗</a>
        <span style={{ color: '#1e293b' }}>·</span>
        <a href="https://github.com/yedoma-labs/sir-forms" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>GitHub ↗</a>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0221, #1e0a3c, #0d1b4b)',
        borderRadius: '24px', padding: '3rem', marginBottom: '3rem',
        border: '1px solid rgba(139,92,246,0.3)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚡</div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', lineHeight: 1.1 }}>
          sir-forms
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '580px' }}>
          Type-safe React forms with <strong style={{ color: '#a78bfa' }}>FormProvider</strong>, field-level hooks, and server action validation — fully <strong style={{ color: '#6366f1' }}>React 19 compatible</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🔗', label: 'FormProvider', desc: 'Shared form context with initial values', color: '#a78bfa' },
            { icon: '🎯', label: 'useField()', desc: 'Field value, error, onChange per field', color: '#6366f1' },
            { icon: '✅', label: 'useFormSubmit()', desc: 'Submit handler with success/error callbacks', color: '#34d399' },
            { icon: '⚡', label: 'React 19 ready', desc: 'Compatible with latest concurrent features', color: '#f59e0b' },
            { icon: '🔒', label: 'TypeScript first', desc: 'Full type inference, zero runtime surprises', color: '#06b6d4' },
          ].map(({ icon, label, desc, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem', border: `1px solid ${color}25` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{label}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <FormProvider initialValues={{ name: '', email: '', message: '' }}>
        <ContactForm />
      </FormProvider>

      <FormProvider initialValues={{ email: '' }}>
        <NewsletterForm />
      </FormProvider>

      <SubmissionTracker />

      {/* Code Examples */}
      <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '2rem', border: '1px solid #1e293b' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'linear-gradient(135deg,#1e0a3c,#4c1d95)',padding:'0.4rem 1.1rem',borderRadius:'2rem',marginBottom:'1.75rem' }}>
          <span style={{ fontSize:'1.1rem' }}>📖</span>
          <h2 style={{ color:'white',fontSize:'1.1rem',fontWeight:800,margin:0 }}>API Code Examples</h2>
        </div>

        {[
          {
            title: '1. Setup — wrap your page with FormProvider',
            code: `import { FormProvider } from '@yedoma-labs/sir-forms'

// FormProvider holds all field state for children
// initialValues defines field names + starting values
export default function MyPage() {
  return (
    <FormProvider initialValues={{ name: '', email: '', message: '' }}>
      <MyForm />
    </FormProvider>
  )
}`,
          },
          {
            title: '2. useForm + useField — field-level hooks',
            code: `import { useForm, useField } from '@yedoma-labs/sir-forms'

function MyForm() {
  const form       = useForm()       // form.isSubmitting, form.errors
  const nameField  = useField('name')  // name, value, onChange, error
  const emailField = useField('email')

  return (
    <form onSubmit={/* see below */}>
      <input
        name={nameField.name}
        value={(nameField.value as string) ?? ''}
        onChange={nameField.onChange}
        disabled={form.isSubmitting}
      />
      {nameField.error && <div role="alert">{nameField.error}</div>}

      <input
        name={emailField.name}
        value={(emailField.value as string) ?? ''}
        onChange={emailField.onChange}
        disabled={form.isSubmitting}
      />
      {emailField.error && <div role="alert">{emailField.error}</div>}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}`,
          },
          {
            title: '3. useFormSubmit — connect to a Server Action',
            code: `import { useFormSubmit } from '@yedoma-labs/sir-forms'
import { myServerAction } from './actions'

function MyForm() {
  const form = useForm()
  const nameField = useField('name')

  const handleSubmit = useFormSubmit(myServerAction, {
    onSuccess: (data) => {
      console.log('Submitted!', data)
      // data is whatever your server action returns
    },
    onError: (errors) => {
      // errors: Record<string, string> — one message per field
      console.error('Validation failed', errors)
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      {/* fields here */}
    </form>
  )
}`,
          },
          {
            title: '4. Server Action — validate + return errors or data',
            code: `'use server'

export async function myServerAction(prevState: unknown, formData: FormData) {
  const name  = formData.get('name') as string
  const email = formData.get('email') as string

  // Return errors — sir-forms maps them to the matching field hooks
  if (!name?.trim())        return { errors: { name: 'Name is required' } }
  if (!email?.includes('@')) return { errors: { email: 'Invalid email format' } }

  // Do your work (DB call, API call, etc.)
  const result = await db.users.create({ name, email })

  // Return data — onSuccess receives this
  return { data: { id: result.id, name } }
}`,
          },
          {
            title: '5. useServerAction — wrap any server action with loading state',
            code: `import { useServerAction } from '@yedoma-labs/sir-forms'
import { incrementLikes } from './actions'

function LikeButton() {
  const [likes, setLikes] = useState(0)
  const executeAction = useServerAction(incrementLikes)

  const handleClick = async () => {
    const result = await executeAction({ count: likes })
    if (result.success && result.data) setLikes(result.data.count)
    if (result.error) console.error(result.error)
  }

  return <button onClick={handleClick}>👍 {likes}</button>
}

// The server action (not a form action, just a plain async function)
'use server'
export async function incrementLikes({ count }: { count: number }) {
  return { count: count + 1 }
}`,
          },
        ].map(({ title, code }) => (
          <div key={title} style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ color:'#94a3b8',fontSize:'0.8rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem' }}>{title}</h3>
            <pre style={{ background:'#020817',color:'#e2e8f0',padding:'1.25rem',borderRadius:'10px',fontSize:'0.775rem',overflowX:'auto',fontFamily:"'Fira Code','Cascadia Code','Consolas',monospace",lineHeight:1.7,border:'1px solid #1e293b',margin:0 }}>
              <code>{code}</code>
            </pre>
          </div>
        ))}
      </section>

      {/* Links to related demos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
        {[
          { href: '/comparison', icon: '⚖️', title: 'Compare with suruy-form-actions', desc: 'See feature comparison and side-by-side code', color: '#f59e0b' },
          { href: '/hybrid', icon: '🔄', title: 'Hybrid Demo', desc: 'Combine sir-forms with suruy-form-actions server validation', color: '#34d399' },
          { href: '/features', icon: '🚀', title: 'ichchi-state Features', desc: 'Time-travel debug, computed values, cross-tab sync', color: '#a78bfa' },
        ].map(({ href, icon, title, desc, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${color}25`, transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{title}</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.4 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
