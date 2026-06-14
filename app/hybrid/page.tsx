'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'
import {
  hybridUpdateProfile,
  hybridProcessCheckout,
  hybridSubmitStep1,
  hybridSubmitStep2,
  hybridFinalSubmit,
} from './actions'
import { adaptSuruyActionForSirForms } from '@/lib/formAdapter'
import { formLogger } from '@/lib/clientLogger'
import { useState } from 'react'
import Link from 'next/link'

const msgStyle = (ok: boolean) => ({
  marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
  background: ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
  color: ok ? '#10b981' : '#ef4444',
  border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
})

// Example 1: Using suruy action with sir-forms hooks
function HybridProfileForm() {
  const form = useForm()
  const firstNameField = useField('firstName')
  const lastNameField = useField('lastName')
  const emailField = useField('email')
  const bioField = useField('bio')
  const ageField = useField('age')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = useFormSubmit(adaptSuruyActionForSirForms(hybridUpdateProfile), {
    onSuccess: (data: any) => {
      setMessage(`✅ Profile updated! User ID: ${data.userId}`)
    },
    onError: () => {
      setMessage('❌ Please fix the errors above')
    },
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>👤 Hybrid Profile Form</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <strong style={{ color: '#a78bfa' }}>Server:</strong> suruy schema validation &nbsp;|&nbsp;{' '}
        <strong style={{ color: '#6366f1' }}>Client:</strong> sir-forms state management
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="hybrid-firstName">First Name *</label>
            <input
              id="hybrid-firstName"
              name={firstNameField.name}
              value={(firstNameField.value as string) ?? ''}
              onChange={firstNameField.onChange}
              disabled={form.isSubmitting}
            />
            {firstNameField.error && <div className="error">{firstNameField.error}</div>}
          </div>
          <div>
            <label htmlFor="hybrid-lastName">Last Name *</label>
            <input
              id="hybrid-lastName"
              name={lastNameField.name}
              value={(lastNameField.value as string) ?? ''}
              onChange={lastNameField.onChange}
              disabled={form.isSubmitting}
            />
            {lastNameField.error && <div className="error">{lastNameField.error}</div>}
          </div>
        </div>

        <div>
          <label htmlFor="hybrid-email">Email *</label>
          <input
            id="hybrid-email"
            type="email"
            name={emailField.name}
            value={(emailField.value as string) ?? ''}
            onChange={emailField.onChange}
            disabled={form.isSubmitting}
          />
          {emailField.error && <div className="error">{emailField.error}</div>}
        </div>

        <div>
          <label htmlFor="hybrid-age">Age *</label>
          <input
            id="hybrid-age"
            type="number"
            name={ageField.name}
            value={(ageField.value as string) ?? ''}
            onChange={ageField.onChange}
            disabled={form.isSubmitting}
          />
          {ageField.error && <div className="error">{ageField.error}</div>}
        </div>

        <div>
          <label htmlFor="hybrid-bio">Bio (optional)</label>
          <textarea
            id="hybrid-bio"
            rows={4}
            name={bioField.name}
            value={(bioField.value as string) ?? ''}
            onChange={bioField.onChange}
            disabled={form.isSubmitting}
          />
          {bioField.error && <div className="error">{bioField.error}</div>}
        </div>

        <button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>

        {message && <div style={msgStyle(message.startsWith('✅'))}>{message}</div>}
      </form>
    </section>
  )
}

// Example 2: Checkout form with Zod + suruy action + sir-forms
function HybridCheckoutForm() {
  const form = useForm()
  const cardNumberField = useField('cardNumber')
  const expiryMonthField = useField('expiryMonth')
  const expiryYearField = useField('expiryYear')
  const cvvField = useField('cvv')
  const amountField = useField('amount')
  const saveCardField = useField('saveCard')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = useFormSubmit(adaptSuruyActionForSirForms(hybridProcessCheckout), {
    onSuccess: (data: any) => {
      setMessage(`✅ Payment processed! Transaction ID: ${data.transactionId} | Amount: $${data.amount}`)
    },
    onError: () => {
      setMessage('❌ Payment failed. Please check your card details.')
    },
  })

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>💳 Hybrid Checkout Form</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <strong style={{ color: '#a78bfa' }}>Server:</strong> Zod + suruy validation &nbsp;|&nbsp;{' '}
        <strong style={{ color: '#6366f1' }}>Client:</strong> sir-forms controlled inputs
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="hybrid-cardNumber">Card Number *</label>
          <input
            id="hybrid-cardNumber"
            name={cardNumberField.name}
            value={(cardNumberField.value as string) ?? ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              cardNumberField.onChange({
                target: { name: cardNumberField.name, value },
              } as any)
            }}
            placeholder="1234567812345678"
            maxLength={16}
            disabled={form.isSubmitting}
          />
          {cardNumberField.error && <div className="error">{cardNumberField.error}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="hybrid-expiryMonth">Expiry Month *</label>
            <input
              id="hybrid-expiryMonth"
              name={expiryMonthField.name}
              value={(expiryMonthField.value as string) ?? ''}
              onChange={expiryMonthField.onChange}
              placeholder="MM"
              maxLength={2}
              disabled={form.isSubmitting}
            />
            {expiryMonthField.error && <div className="error">{expiryMonthField.error}</div>}
          </div>
          <div>
            <label htmlFor="hybrid-expiryYear">Year *</label>
            <input
              id="hybrid-expiryYear"
              name={expiryYearField.name}
              value={(expiryYearField.value as string) ?? ''}
              onChange={expiryYearField.onChange}
              placeholder="YYYY"
              maxLength={4}
              disabled={form.isSubmitting}
            />
            {expiryYearField.error && <div className="error">{expiryYearField.error}</div>}
          </div>
          <div>
            <label htmlFor="hybrid-cvv">CVV *</label>
            <input
              id="hybrid-cvv"
              name={cvvField.name}
              value={(cvvField.value as string) ?? ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                cvvField.onChange({
                  target: { name: cvvField.name, value },
                } as any)
              }}
              placeholder="123"
              maxLength={4}
              disabled={form.isSubmitting}
            />
            {cvvField.error && <div className="error">{cvvField.error}</div>}
          </div>
        </div>

        <div>
          <label htmlFor="hybrid-amount">Amount ($) *</label>
          <input
            id="hybrid-amount"
            type="number"
            step="0.01"
            name={amountField.name}
            value={(amountField.value as string) ?? ''}
            onChange={amountField.onChange}
            disabled={form.isSubmitting}
          />
          {amountField.error && <div className="error">{amountField.error}</div>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <input
              type="checkbox"
              name={saveCardField.name}
              checked={(saveCardField.value as boolean) ?? false}
              onChange={(e) =>
                saveCardField.onChange({
                  target: { name: saveCardField.name, value: e.target.checked ? 'on' : '' },
                } as any)
              }
              disabled={form.isSubmitting}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Save card for future purchases</span>
          </label>
        </div>

        <button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Processing...' : 'Process Payment'}
        </button>

        {message && <div style={{ ...msgStyle(message.startsWith('✅')), fontSize: '0.875rem' }}>{message}</div>}
      </form>
    </section>
  )
}

// Example 3: Multi-step form
function HybridMultiStepForm() {
  const form = useForm()
  const [currentStep, setCurrentStep] = useState(1)
  const [message, setMessage] = useState<string | null>(null)
  const [step1Data, setStep1Data] = useState<Record<string, string> | null>(null)
  const [step2Data, setStep2Data] = useState<Record<string, string> | null>(null)

  // Step 1 fields
  const companyNameField = useField('companyName')
  const industryField = useField('industry')
  const employeeCountField = useField('employeeCount')

  // Step 2 fields
  const contactNameField = useField('contactName')
  const contactEmailField = useField('contactEmail')
  const contactPhoneField = useField('contactPhone')

  const handleStep1 = useFormSubmit(adaptSuruyActionForSirForms(hybridSubmitStep1), {
    onSuccess: () => {
      setStep1Data({
        companyName: companyNameField.value as string,
        industry: industryField.value as string,
        employeeCount: employeeCountField.value as string,
      })
      setCurrentStep(2)
      setMessage(null)
    },
    onError: () => {
      setMessage('❌ Please fix errors in step 1')
    },
  })

  const handleStep2 = useFormSubmit(adaptSuruyActionForSirForms(hybridSubmitStep2), {
    onSuccess: () => {
      setStep2Data({
        contactName: contactNameField.value as string,
        contactEmail: contactEmailField.value as string,
        contactPhone: contactPhoneField.value as string,
      })
      setCurrentStep(3)
      setMessage(null)
    },
    onError: () => {
      setMessage('❌ Please fix errors in step 2')
    },
  })

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!step1Data || !step2Data) {
      setMessage('❌ Missing form data')
      return
    }

    const allData = { ...step1Data, ...step2Data }
    formLogger.info('Submitting final multi-step data', { allData })

    try {
      form.setIsSubmitting(true)
      const result = await adaptSuruyActionForSirForms(hybridFinalSubmit)(allData)

      if (result.success) {
        formLogger.info('Final submit success', { data: result.data })
        setMessage(`✅ Application submitted! ID: ${result.data.applicationId}`)
        setTimeout(() => {
          setCurrentStep(1)
          setStep1Data(null)
          setStep2Data(null)
          setMessage(null)
        }, 3000)
      } else {
        formLogger.error('Final submit errors', { errors: result.errors })
        const errorList = Object.entries(result.errors || {})
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ')
        setMessage(`❌ Submission failed: ${errorList}`)
      }
    } catch (error) {
      formLogger.error('Submit error', { error: String(error) })
      setMessage('❌ Submission failed: ' + String(error))
    } finally {
      form.setIsSubmitting(false)
    }
  }

  return (
    <section style={{ marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '0.4rem' }}>📝 Hybrid Multi-Step Form</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <strong style={{ color: '#a78bfa' }}>Server:</strong> suruy validation per step &nbsp;|&nbsp;{' '}
        <strong style={{ color: '#6366f1' }}>Client:</strong> sir-forms maintains all state
      </p>

      {/* Progress indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: currentStep >= step ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e293b',
                color: currentStep >= step ? 'white' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', border: currentStep >= step ? 'none' : '1px solid #334155',
                boxShadow: currentStep >= step ? '0 0 20px rgba(99,102,241,0.4)' : 'none',
                transition: 'all 0.3s', fontSize: '1rem',
              }}>
                {currentStep > step ? '✓' : step}
              </div>
              {step < 3 && (
                <div style={{
                  width: '60px', height: '2px', margin: '0 0.25rem',
                  background: currentStep > step ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : '#1e293b',
                  transition: 'all 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
          Step {currentStep} of 3
        </div>
      </div>

      {/* Step 1: Company Info */}
      {currentStep === 1 && (
        <form onSubmit={handleStep1}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Company Information</h3>
          <div>
            <label htmlFor="ms-companyName">Company Name *</label>
            <input
              id="ms-companyName"
              name={companyNameField.name}
              value={(companyNameField.value as string) ?? ''}
              onChange={companyNameField.onChange}
              disabled={form.isSubmitting}
            />
            {companyNameField.error && <div className="error">{companyNameField.error}</div>}
          </div>
          <div>
            <label htmlFor="ms-industry">Industry *</label>
            <select
              id="ms-industry"
              name={industryField.name}
              value={(industryField.value as string) ?? ''}
              onChange={industryField.onChange}
              disabled={form.isSubmitting}
            >
              <option value="">Select industry...</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
            {industryField.error && <div className="error">{industryField.error}</div>}
          </div>
          <div>
            <label htmlFor="ms-employeeCount">Employee Count *</label>
            <select
              id="ms-employeeCount"
              name={employeeCountField.name}
              value={(employeeCountField.value as string) ?? ''}
              onChange={employeeCountField.onChange}
              disabled={form.isSubmitting}
            >
              <option value="">Select size...</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
            {employeeCountField.error && <div className="error">{employeeCountField.error}</div>}
          </div>
          <button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Validating...' : 'Next →'}
          </button>
        </form>
      )}

      {/* Step 2: Contact Info */}
      {currentStep === 2 && (
        <form onSubmit={handleStep2}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Contact Information</h3>
          <div>
            <label htmlFor="ms-contactName">Contact Name *</label>
            <input
              id="ms-contactName"
              name={contactNameField.name}
              value={(contactNameField.value as string) ?? ''}
              onChange={contactNameField.onChange}
              disabled={form.isSubmitting}
            />
            {contactNameField.error && <div className="error">{contactNameField.error}</div>}
          </div>
          <div>
            <label htmlFor="ms-contactEmail">Contact Email *</label>
            <input
              id="ms-contactEmail"
              type="email"
              name={contactEmailField.name}
              value={(contactEmailField.value as string) ?? ''}
              onChange={contactEmailField.onChange}
              disabled={form.isSubmitting}
            />
            {contactEmailField.error && <div className="error">{contactEmailField.error}</div>}
          </div>
          <div>
            <label htmlFor="ms-contactPhone">Contact Phone *</label>
            <input
              id="ms-contactPhone"
              type="tel"
              name={contactPhoneField.name}
              value={(contactPhoneField.value as string) ?? ''}
              onChange={contactPhoneField.onChange}
              placeholder="+1 234 567 8900"
              disabled={form.isSubmitting}
            />
            {contactPhoneField.error && <div className="error">{contactPhoneField.error}</div>}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={form.isSubmitting}
              style={{ background: '#334155 !important', color: '#94a3b8', border: '1px solid #475569', flex: '0 0 auto' }}
            >
              ← Back
            </button>
            <button type="submit" disabled={form.isSubmitting} style={{ flex: 1 }}>
              {form.isSubmitting ? 'Validating...' : 'Next →'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && step1Data && step2Data && (
        <form onSubmit={handleFinalSubmit}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Review & Submit</h3>
          <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h4 style={{ color: '#a78bfa', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Information</h4>
            <p style={{ color: '#cbd5e1', margin: '0.3rem 0' }}><strong style={{ color: '#94a3b8' }}>Company:</strong> {step1Data.companyName}</p>
            <p style={{ color: '#cbd5e1', margin: '0.3rem 0' }}><strong style={{ color: '#94a3b8' }}>Industry:</strong> {step1Data.industry}</p>
            <p style={{ color: '#cbd5e1', margin: '0.3rem 0' }}><strong style={{ color: '#94a3b8' }}>Employees:</strong> {step1Data.employeeCount}</p>
          </div>
          <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h4 style={{ color: '#6366f1', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Information</h4>
            <p style={{ color: '#cbd5e1', margin: '0.3rem 0' }}><strong style={{ color: '#94a3b8' }}>Name:</strong> {step2Data.contactName}</p>
            <p style={{ color: '#cbd5e1', margin: '0.3rem 0' }}><strong style={{ color: '#94a3b8' }}>Email:</strong> {step2Data.contactEmail}</p>
            <p style={{ color: '#cbd5e1', margin: '0.3rem 0' }}><strong style={{ color: '#94a3b8' }}>Phone:</strong> {step2Data.contactPhone}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={form.isSubmitting}
              style={{ background: '#334155', color: '#94a3b8', border: '1px solid #475569', flex: '0 0 auto' }}
            >
              ← Back
            </button>
            <button type="submit" disabled={form.isSubmitting} style={{ flex: 1 }}>
              {form.isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}

      {message && <div style={msgStyle(message.startsWith('✅'))}>{message}</div>}
    </section>
  )
}

// Main page
export default function HybridDemoPage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
      <style>{`
        html, body { background: #0f172a !important; }
        h1, h2, h3, h4 { color: #f1f5f9; }
        p { color: #94a3b8; }
        label { color: #cbd5e1 !important; display: block; margin-bottom: 0.4rem; font-size: 0.875rem; font-weight: 500; }
        input:not([type="checkbox"]), select, textarea {
          background: #0a0f1e !important; border: 1px solid #1e293b !important;
          color: #e2e8f0 !important; border-radius: 8px; padding: 0.65rem 0.8rem;
          width: 100%; box-sizing: border-box; margin-bottom: 0.75rem; font-size: 0.9rem;
        }
        input:not([type="checkbox"]):focus, select:focus, textarea:focus {
          outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        select option { background: #0f172a; color: #e2e8f0; }
        input[type="checkbox"] { width: auto; accent-color: #6366f1; }
        button[type="submit"] {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          color: white !important; border: none; padding: 0.75rem 1.5rem;
          border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%;
          margin-top: 0.5rem; font-size: 0.95rem; transition: filter 0.2s;
        }
        button[type="submit"]:hover:not(:disabled) { filter: brightness(1.15); }
        button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
        button[type="button"] {
          background: #1e293b; color: #94a3b8; border: 1px solid #334155;
          padding: 0.65rem 1.25rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;
          transition: background 0.2s;
        }
        button[type="button"]:hover:not(:disabled) { background: #334155; }
        .error { color: #ef4444 !important; font-size: 0.8rem; margin-top: -0.4rem; margin-bottom: 0.75rem; display: block; }
        .success { color: #10b981 !important; margin-top: 0.75rem; }
        form { background: transparent !important; }
        small { color: #64748b !important; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.875rem' }}>← All Demos</Link>
        <span style={{ color: '#1e293b' }}>·</span>
        <a href="https://www.npmjs.com/package/@yedoma-labs/sir-forms" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none', fontSize: '0.875rem' }}>sir-forms npm ↗</a>
        <span style={{ color: '#1e293b' }}>·</span>
        <a href="https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions" target="_blank" rel="noopener noreferrer" style={{ color: '#fb923c', textDecoration: 'none', fontSize: '0.875rem' }}>suruy npm ↗</a>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        borderRadius: '24px', padding: '3rem', border: '1px solid rgba(99,102,241,0.25)',
        marginBottom: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '20%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(245,87,108,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔄</div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', lineHeight: 1.1 }}>
          Hybrid Forms Demo
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '580px' }}>
          The best of both worlds — <strong style={{ color: '#a78bfa' }}>suruy-form-actions</strong> for
          server validation + <strong style={{ color: '#6366f1' }}>sir-forms</strong> for client state.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🛡️', label: 'suruy-form-actions', desc: 'Server-first validation, progressive enhancement, Zod support', color: '#a78bfa' },
            { icon: '⚡', label: 'sir-forms', desc: 'Controlled inputs, field-level state, smooth client UX', color: '#6366f1' },
            { icon: '✨', label: 'Combined Power', desc: 'Type-safe, robust validation + seamless user experience', color: '#34d399' },
          ].map(({ icon, label, desc, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${color}25` }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{label}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <FormProvider
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          bio: '',
          age: '',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          amount: '',
          saveCard: false,
          companyName: '',
          industry: '',
          employeeCount: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
        }}
      >
        <HybridProfileForm />
        <HybridCheckoutForm />
        <HybridMultiStepForm />
      </FormProvider>

      {/* Benefits section */}
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ color: '#f1f5f9', marginBottom: '1.5rem', fontSize: '1.75rem' }}>🎯 Why Combine Them?</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { icon: '🛡️', title: 'Server-first validation', desc: 'suruy handles validation on the server — security by default', color: '#a78bfa' },
            { icon: '⚡', title: 'Rich client state', desc: 'sir-forms gives you controlled components and field hooks', color: '#6366f1' },
            { icon: '🔧', title: 'Progressive enhancement', desc: 'Forms work without JS (from suruy)', color: '#06b6d4' },
            { icon: '🔒', title: 'Type safety', desc: 'Both libraries are fully typed, errors caught at compile time', color: '#f59e0b' },
            { icon: '🎯', title: 'Flexible validation', desc: "Use suruy's built-in validator OR Zod", color: '#34d399' },
            { icon: '✨', title: 'Smooth UX', desc: 'Controlled inputs, loading states, optimistic updates', color: '#fb923c' },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${color}25`, transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{title}</div>
              <div style={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #1e293b' }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '1.25rem' }}>Perfect For:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {[
              'Complex forms that need both server security and client UX',
              'Multi-step forms with validation at each step',
              'Payment/checkout flows requiring secure server validation',
              'Forms with custom input formatting (credit cards, phone numbers)',
              'Applications that need to work with AND without JavaScript',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#6366f1', flexShrink: 0, marginTop: '0.15rem', fontSize: '0.7rem' }}>◆</span>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
