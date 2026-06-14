'use client'

import { useFormAction } from '@yedoma-labs/suruy-form-actions'
import {
  suruySendContactMessage,
  suruyQuickSubscribe,
  suruyUploadFile,
  suruyRegisterUser,
  suruyAddTags,
} from './actions'
import { suruyZodLogin, suruyZodAddProduct } from './zod-actions'
import { formLogger } from '@/lib/clientLogger'
import { useState } from 'react'
import Link from 'next/link'

// Example 1: Full-featured contact form
function ContactFormWithSuruy() {
  const { state, action, pending, formRef } = useFormAction(suruySendContactMessage, {
    onSuccess: (data) => {
      formLogger.info('Contact form success', { data })
    },
    onError: (errors) => {
      formLogger.error('Contact form errors', { errors })
    },
    resetOnSuccess: true,
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>📧 Full Contact Form</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Using <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>createFormAction</code> with built-in zero-dependency schema validator
      </p>

      <form ref={formRef} action={action} style={{ maxWidth: '600px' }}>
        <div>
          <label htmlFor="contact-name">Name *</label>
          <input id="contact-name" name="name" type="text" placeholder="John Doe" disabled={pending} required />
          {state.errors?.name && <div className="error" role="alert">{state.errors.name[0]}</div>}
        </div>
        <div>
          <label htmlFor="contact-email">Email *</label>
          <input id="contact-email" name="email" type="email" placeholder="john@example.com" disabled={pending} required />
          {state.errors?.email && <div className="error" role="alert">{state.errors.email[0]}</div>}
        </div>
        <div>
          <label htmlFor="contact-message">Message *</label>
          <textarea id="contact-message" name="message" rows={4} placeholder="Your message here..." disabled={pending} required />
          {state.errors?.message && <div className="error" role="alert">{state.errors.message[0]}</div>}
        </div>
        <div>
          <label htmlFor="contact-priority">Priority *</label>
          <select id="contact-priority" name="priority" disabled={pending} required>
            <option value="">Select priority...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {state.errors?.priority && <div className="error" role="alert">{state.errors.priority[0]}</div>}
        </div>
        <button type="submit" disabled={pending}>
          {pending ? 'Sending...' : 'Send Message'}
        </button>
        {state.success && state.data && (
          <div className="success">✅ Message sent successfully! (ID: {state.data.messageId})</div>
        )}
        {state.errors?._form && <div className="error" role="alert">{state.errors._form[0]}</div>}
      </form>
    </section>
  )
}

// Example 2: Simple action without schema
function QuickSubscribeForm() {
  const { state, action, pending, formRef } = useFormAction(suruyQuickSubscribe, {
    resetOnSuccess: true,
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>⚡ Quick Subscribe</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Using <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>createSimpleAction</code> — no schema needed for simple forms
      </p>
      <form ref={formRef} action={action} style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input name="email" type="email" placeholder="your@email.com" disabled={pending} required style={{ flex: 1, marginBottom: 0 }} />
          <button type="submit" disabled={pending} style={{ width: 'auto', padding: '0.65rem 1.25rem', marginTop: 0 }}>
            {pending ? '...' : 'Subscribe'}
          </button>
        </div>
        {state.errors?.email && <div className="error" role="alert">{state.errors.email[0]}</div>}
        {state.success && <div className="success" style={{ marginTop: '0.5rem' }}>✅ Subscribed: {state.data?.email}</div>}
      </form>
    </section>
  )
}

// Example 3: File upload
function FileUploadForm() {
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const { state, action, pending, formRef } = useFormAction(suruyUploadFile, {
    onSuccess: () => {
      setFilePreview(null)
    },
    resetOnSuccess: true,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>📁 File Upload with Validation</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Custom file validation in createFormAction (max 5MB, images only)
      </p>
      <form ref={formRef} action={action} style={{ maxWidth: '600px' }}>
        <div>
          <label htmlFor="upload-title">Title *</label>
          <input id="upload-title" name="title" type="text" placeholder="Image title" disabled={pending} required />
          {state.errors?.title && <div className="error" role="alert">{state.errors.title[0]}</div>}
        </div>
        <div>
          <label htmlFor="upload-description">Description</label>
          <textarea id="upload-description" name="description" rows={3} placeholder="Optional description" disabled={pending} />
          {state.errors?.description && <div className="error" role="alert">{state.errors.description[0]}</div>}
        </div>
        <div>
          <label htmlFor="upload-file">Image File *</label>
          <input id="upload-file" name="file" type="file" accept="image/*" onChange={handleFileChange} disabled={pending} required />
          {state.errors?.file && <div className="error" role="alert">{state.errors.file[0]}</div>}
          {filePreview && (
            <div style={{ marginTop: '1rem' }}>
              <img src={filePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '2px solid #1e293b' }} />
            </div>
          )}
        </div>
        <button type="submit" disabled={pending}>
          {pending ? 'Uploading...' : 'Upload File'}
        </button>
        {state.success && state.data && (
          <div className="success">✅ Uploaded: {state.data.fileName} ({(state.data.fileSize / 1024).toFixed(2)} KB)</div>
        )}
      </form>
    </section>
  )
}

// Example 4: Complex registration form
function RegistrationForm() {
  const { state, action, pending, formRef } = useFormAction(suruyRegisterUser, {
    onSuccess: (data) => {
      formLogger.info('User registered', { data })
    },
    resetOnSuccess: true,
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>👤 User Registration</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Advanced schema with custom validators and cross-field validation
      </p>
      <form ref={formRef} action={action} style={{ maxWidth: '600px' }}>
        <div>
          <label htmlFor="reg-username">Username *</label>
          <input id="reg-username" name="username" type="text" placeholder="lowercase_only" disabled={pending} required />
          {state.errors?.username && <div className="error" role="alert">{state.errors.username[0]}</div>}
          <small style={{ color: '#64748b', display: 'block', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
            Lowercase letters, numbers, and underscores only
          </small>
        </div>
        <div>
          <label htmlFor="reg-email">Email *</label>
          <input id="reg-email" name="email" type="email" placeholder="you@example.com" disabled={pending} required />
          {state.errors?.email && <div className="error" role="alert">{state.errors.email[0]}</div>}
        </div>
        <div>
          <label htmlFor="reg-password">Password *</label>
          <input id="reg-password" name="password" type="password" placeholder="Min 8 characters" disabled={pending} required />
          {state.errors?.password && <div className="error" role="alert">{state.errors.password[0]}</div>}
          <small style={{ color: '#64748b', display: 'block', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
            Must contain uppercase, lowercase, and number
          </small>
        </div>
        <div>
          <label htmlFor="reg-confirm">Confirm Password *</label>
          <input id="reg-confirm" name="confirmPassword" type="password" placeholder="Re-enter password" disabled={pending} required />
          {state.errors?.confirmPassword && <div className="error" role="alert">{state.errors.confirmPassword[0]}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <input name="acceptTerms" type="checkbox" disabled={pending} required style={{ width: 'auto', marginBottom: 0 }} />
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>I accept the terms and conditions *</span>
          </label>
          {state.errors?.acceptTerms && <div className="error" role="alert">{state.errors.acceptTerms[0]}</div>}
        </div>
        <button type="submit" disabled={pending}>
          {pending ? 'Creating Account...' : 'Register'}
        </button>
        {state.success && state.data && (
          <div className="success">✅ Account created! User ID: {state.data.userId}</div>
        )}
      </form>
    </section>
  )
}

// Example 5: Dynamic fields (array inputs)
function TagsForm() {
  const [tags, setTags] = useState([''])

  const { state, action, pending, formRef } = useFormAction(suruyAddTags, {
    onSuccess: (data) => {
      formLogger.info('Tags added', { data })
      setTags([''])
    },
  })

  const addTagField = () => setTags([...tags, ''])
  const removeTagField = (index: number) => setTags(tags.filter((_, i) => i !== index))
  const updateTag = (index: number, value: string) => {
    const newTags = [...tags]
    newTags[index] = value
    setTags(newTags)
  }

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>🏷️ Dynamic Array Fields</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Handling multiple values with <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>FormData.getAll()</code>
      </p>
      <form ref={formRef} action={action} style={{ maxWidth: '600px' }}>
        <div>
          <label htmlFor="tags-category">Category *</label>
          <select id="tags-category" name="category" disabled={pending} required>
            <option value="">Select category...</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="science">Science</option>
          </select>
          {state.errors?.category && <div className="error" role="alert">{state.errors.category[0]}</div>}
        </div>
        <div>
          <label>Tags *</label>
          {tags.map((tag, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                name="tags[]"
                type="text"
                placeholder={`Tag ${index + 1}`}
                value={tag}
                onChange={(e) => updateTag(index, e.target.value)}
                disabled={pending}
                style={{ flex: 1, marginBottom: 0 }}
              />
              {tags.length > 1 && (
                <button type="button" onClick={() => removeTagField(index)} disabled={pending}
                  style={{ width: 'auto', padding: '0 0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px' }}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTagField} disabled={pending}
            style={{ width: 'auto', marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
            + Add Tag
          </button>
          {state.errors?.tags && <div className="error" role="alert">{state.errors.tags[0]}</div>}
        </div>
        <button type="submit" disabled={pending}>
          {pending ? 'Adding...' : 'Add Tags'}
        </button>
        {state.success && state.data && (
          <div className="success">✅ Added {state.data.count} tag(s): {state.data.tags.join(', ')}</div>
        )}
      </form>
    </section>
  )
}

// Example 6: Zod integration - Login form
function ZodLoginExample() {
  const { state, action, pending, formRef } = useFormAction(suruyZodLogin, {
    resetOnSuccess: true,
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(99,102,241,0.2)' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>🔐 Zod Validator Example (Login)</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Using Zod schema with <code style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>createFormAction</code> for type-safe validation
      </p>
      <form ref={formRef} action={action} style={{ maxWidth: '600px' }}>
        <div>
          <label htmlFor="zod-email">Email</label>
          <input id="zod-email" name="email" type="email" placeholder="you@example.com" disabled={pending} required />
          {state.errors?.email && <div className="error" role="alert">{state.errors.email[0]}</div>}
        </div>
        <div>
          <label htmlFor="zod-password">Password</label>
          <input id="zod-password" name="password" type="password" placeholder="Min 8 characters" disabled={pending} required />
          {state.errors?.password && <div className="error" role="alert">{state.errors.password[0]}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <input name="rememberMe" type="checkbox" disabled={pending} style={{ width: 'auto', marginBottom: 0 }} />
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Remember me</span>
          </label>
        </div>
        <button type="submit" disabled={pending}>
          {pending ? 'Logging in...' : 'Log In'}
        </button>
        {state.success && state.data && (
          <div className="success">✅ Logged in! Token: {state.data.token.substring(0, 20)}...</div>
        )}
      </form>
    </section>
  )
}

// Example 7: Advanced Zod with refinements
function ZodProductExample() {
  const { state, action, pending, formRef } = useFormAction(suruyZodAddProduct, {
    resetOnSuccess: true,
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(99,102,241,0.2)' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>✨ Advanced Zod (Refinements & Transforms)</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Complex validation with cross-field rules and value transformations
      </p>
      <form ref={formRef} action={action} style={{ maxWidth: '600px' }}>
        <div>
          <label htmlFor="prod-name">Product Name</label>
          <input id="prod-name" name="name" type="text" placeholder="e.g., Wireless Headphones" disabled={pending} required />
          {state.errors?.name && <div className="error" role="alert">{state.errors.name[0]}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="prod-price">Price ($)</label>
            <input id="prod-price" name="price" type="number" step="0.01" placeholder="99.99" disabled={pending} required />
            {state.errors?.price && <div className="error" role="alert">{state.errors.price[0]}</div>}
          </div>
          <div>
            <label htmlFor="prod-discount">Discount (%)</label>
            <input id="prod-discount" name="discount" type="number" step="1" placeholder="0-100" disabled={pending} />
            {state.errors?.discount && <div className="error" role="alert">{state.errors.discount[0]}</div>}
          </div>
        </div>
        <div>
          <label htmlFor="prod-category">Category</label>
          <select id="prod-category" name="category" disabled={pending} required>
            <option value="">Select category...</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
          {state.errors?.category && <div className="error" role="alert">{state.errors.category[0]}</div>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <input name="inStock" type="checkbox" disabled={pending} defaultChecked style={{ width: 'auto', marginBottom: 0 }} />
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>In Stock</span>
          </label>
        </div>
        <button type="submit" disabled={pending}>
          {pending ? 'Adding...' : 'Add Product'}
        </button>
        {state.success && state.data && (
          <div className="success">
            ✅ Product added! ${state.data.price.toFixed(2)} - {state.data.discount}% = ${state.data.finalPrice.toFixed(2)}
          </div>
        )}
      </form>
    </section>
  )
}

// Main page
export default function SuruyFormActionsDemo() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
      <style>{`
        html, body { background: #0f172a !important; }
        h1, h2, h3, h4 { color: #f1f5f9; }
        p { color: #94a3b8; }
        label { color: #cbd5e1 !important; display: block; margin-bottom: 0.4rem; font-size: 0.875rem; font-weight: 500; }
        input:not([type="checkbox"]):not([type="file"]), select, textarea {
          background: #0a0f1e !important; border: 1px solid #1e293b !important;
          color: #e2e8f0 !important; border-radius: 8px; padding: 0.65rem 0.8rem;
          width: 100%; box-sizing: border-box; margin-bottom: 0.75rem; font-size: 0.9rem;
        }
        input:not([type="checkbox"]):not([type="file"]):focus, select:focus, textarea:focus {
          outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        input[type="file"] {
          color: #94a3b8; background: #0a0f1e !important; border: 1px dashed #334155 !important;
          border-radius: 8px; padding: 0.65rem; width: 100%; box-sizing: border-box; margin-bottom: 0.75rem;
        }
        select option { background: #0f172a; color: #e2e8f0; }
        input[type="checkbox"] { width: auto; accent-color: #6366f1; }
        button[type="submit"] {
          background: linear-gradient(135deg, #f97316, #ef4444) !important;
          color: white !important; border: none; padding: 0.75rem 1.5rem;
          border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%;
          margin-top: 0.5rem; font-size: 0.95rem; transition: filter 0.2s;
        }
        button[type="submit"]:hover:not(:disabled) { filter: brightness(1.12); }
        button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #ef4444 !important; font-size: 0.8rem; margin-top: -0.4rem; margin-bottom: 0.75rem; display: block; }
        .success { color: #10b981 !important; padding: 0.75rem; background: rgba(16,185,129,0.1); border-radius: 6px; margin-top: 0.75rem; border: 1px solid rgba(16,185,129,0.2); display: block; }
        form { background: transparent !important; }
        code { font-family: monospace; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#f97316', textDecoration: 'none', fontSize: '0.875rem' }}>← All Demos</Link>
        <span style={{ color: '#1e293b' }}>·</span>
        <a href="https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions" target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'none', fontSize: '0.875rem' }}>npm ↗</a>
        <span style={{ color: '#1e293b' }}>·</span>
        <a href="https://github.com/yedoma-labs/suruy-form-actions" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>GitHub ↗</a>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a00, #2d1400, #1a0a1a)',
        borderRadius: '24px', padding: '3rem', marginBottom: '3rem',
        border: '1px solid rgba(249,115,22,0.25)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '25%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✍️</div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', lineHeight: 1.1 }}>
          suruy-form-actions
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '580px' }}>
          Type-safe forms with <strong style={{ color: '#fb923c' }}>React Server Actions</strong> and progressive enhancement — validation on the server, smooth UX on the client.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🛡️', label: 'Built-in Validator', desc: 'Zero-dependency schema validation', color: '#fb923c' },
            { icon: '🔷', label: 'Zod Support', desc: 'Plug in your own schema library', color: '#6366f1' },
            { icon: '📁', label: 'File Uploads', desc: 'Custom file validation built-in', color: '#06b6d4' },
            { icon: '🔧', label: 'Progressive', desc: 'Works without JavaScript', color: '#34d399' },
            { icon: '⚡', label: '~3KB gzipped', desc: 'Tiny bundle, zero runtime deps', color: '#f59e0b' },
          ].map(({ icon, label, desc, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem', border: `1px solid ${color}25` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{label}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <ContactFormWithSuruy />
      <QuickSubscribeForm />
      <FileUploadForm />
      <RegistrationForm />
      <TagsForm />

      {/* Zod Integration header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        borderRadius: '16px', padding: '2rem', margin: '3rem 0 2rem',
        border: '1px solid rgba(99,102,241,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>🔷</span>
          <h2 style={{ color: '#f1f5f9', margin: 0 }}>Zod Integration</h2>
        </div>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          suruy-form-actions works seamlessly with Zod for advanced type-safe validation with refinements, transforms, and cross-field rules.
        </p>
      </div>

      <ZodLoginExample />
      <ZodProductExample />

      {/* Code Examples */}
      <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '2rem', border: '1px solid #1e293b' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'linear-gradient(135deg,#7c2d12,#f97316)',padding:'0.4rem 1.1rem',borderRadius:'2rem',marginBottom:'1.75rem' }}>
          <span style={{ fontSize:'1.1rem' }}>📖</span>
          <h2 style={{ color:'white',fontSize:'1.1rem',fontWeight:800,margin:0 }}>API Code Examples</h2>
        </div>
        {[
          {
            title: '1. Basic — useFormAction + server action',
            code: `// Client component
'use client'
import { useFormAction } from '@yedoma-labs/suruy-form-actions'
import { myAction } from './actions'

function MyForm() {
  const { state, action, pending, formRef } = useFormAction(myAction, {
    onSuccess: (data) => console.log('Done!', data),
    resetOnSuccess: true,   // resets form fields after success
  })

  return (
    <form ref={formRef} action={action}>
      <input name="email" type="email" disabled={pending} />
      {state.errors?.email && <span>{state.errors.email[0]}</span>}
      <button type="submit" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit'}
      </button>
      {state.success && <p>✅ {state.data?.message}</p>}
    </form>
  )
}`,
          },
          {
            title: '2. Server action — built-in zero-dep validator',
            code: `// Server action
'use server'
import { createFormAction, v } from '@yedoma-labs/suruy-form-actions'

export const myAction = createFormAction(
  // Schema — v.* helpers are built-in, no extra install
  {
    email:   v.string().email(),
    name:    v.string().min(2).max(50),
    message: v.string().min(10).optional(),
    role:    v.enum(['admin', 'user', 'guest']),
  },
  // Handler — only runs if validation passes
  async (data) => {
    await db.users.create(data)
    return { message: \`Welcome, \${data.name}!\` }
  },
)`,
          },
          {
            title: '3. File upload validation',
            code: `'use server'
import { createFormAction, v } from '@yedoma-labs/suruy-form-actions'

export const uploadAction = createFormAction(
  {
    title: v.string().min(1),
    file: v.file()
      .maxSize(5 * 1024 * 1024)   // 5 MB
      .accept(['image/jpeg', 'image/png', 'image/webp']),
  },
  async ({ title, file }) => {
    const bytes = await file.arrayBuffer()
    // write to disk / upload to S3 / etc.
    return { fileName: file.name, fileSize: file.size }
  },
)`,
          },
          {
            title: '4. Zod integration — plug in your own schema',
            code: `'use server'
import { createFormAction } from '@yedoma-labs/suruy-form-actions'
import { z } from 'zod'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
})

// Pass your Zod schema — suruy handles parsing + error formatting
export const zodLoginAction = createFormAction(loginSchema, async (data) => {
  const user = await auth.verifyCredentials(data.email, data.password)
  return { token: user.sessionToken }
})`,
          },
          {
            title: '5. createSimpleAction — no schema needed',
            code: `'use server'
import { createSimpleAction } from '@yedoma-labs/suruy-form-actions'

// For quick one-off actions where you handle validation yourself
export const subscribeAction = createSimpleAction(async (formData) => {
  const email = formData.get('email') as string

  if (!email?.includes('@')) {
    return { errors: { email: ['Invalid email address'] } }
  }

  await newsletter.subscribe(email)
  return { data: { email, message: 'Subscribed!' } }
})`,
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

      {/* Library comparison link */}
      <div style={{
        padding: '2.5rem', margin: '3rem 0 2rem',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        borderRadius: '20px', textAlign: 'center',
        border: '1px solid rgba(99,102,241,0.25)',
      }}>
        <h2 style={{ color: '#f1f5f9', marginBottom: '0.75rem' }}>⚖️ Compare with sir-forms</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.75rem' }}>See feature comparison and side-by-side code examples</p>
        <Link href="/comparison" style={{
          display: 'inline-block', padding: '0.85rem 2.5rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', fontWeight: 700, borderRadius: '10px',
          textDecoration: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
        }}>
          View Comparison →
        </Link>
      </div>

      {/* Why suruy-form-actions */}
      <section>
        <h2 style={{ color: '#f1f5f9', marginBottom: '1.5rem', fontSize: '1.75rem' }}>📊 Why suruy-form-actions?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '📦', title: '~3KB gzipped', desc: 'Tiny bundle size with maximum functionality', color: '#fb923c' },
            { icon: '🔗', title: 'Zero runtime deps', desc: 'Built-in validator included, nothing extra', color: '#f59e0b' },
            { icon: '⚛️', title: 'React 19 ready', desc: 'Uses useActionState under the hood', color: '#06b6d4' },
            { icon: '🔧', title: 'Progressive enhancement', desc: 'Forms work without JavaScript', color: '#34d399' },
            { icon: '🔒', title: 'Type-safe', desc: 'Full TypeScript support with inference', color: '#6366f1' },
            { icon: '🛡️', title: 'Server-first', desc: 'Validation runs on the server, secure by default', color: '#a78bfa' },
            { icon: '🎯', title: 'Flexible', desc: 'Use built-in validator or Zod, Valibot, etc.', color: '#ec4899' },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${color}25` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{title}</div>
              <div style={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
