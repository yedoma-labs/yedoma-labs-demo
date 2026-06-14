'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'
import { useFormAction } from '@yedoma-labs/suruy-form-actions'
import { submitContactForm } from '@/app/actions'
import { suruySendContactMessage } from '@/app/suruy/actions'
import { useState } from 'react'
import Link from 'next/link'

// ─── Sub-components (logic unchanged) ────────────────────────────────────────

function SirFormsExample() {
  const form = useForm()
  const nameField = useField('name')
  const emailField = useField('email')
  const messageField = useField('message')
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = useFormSubmit(submitContactForm, {
    onSuccess: (data: any) => setResult(`✅ sir-forms: Success! ${data?.name || 'Form submitted'}`),
    onError: () => setResult('❌ sir-forms: Validation failed'),
  })

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem' }}>
        <div style={{ width:12,height:12,borderRadius:'50%',background:'#6366f1',boxShadow:'0 0 8px #6366f1' }} />
        <h3 style={{ color:'#a78bfa',fontSize:'1rem',fontWeight:700,margin:0 }}>@yedoma-labs/sir-forms</h3>
      </div>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1rem',lineHeight:1.5 }}>
        FormProvider + useField hooks. Client-side state management built-in.
      </p>
      <form onSubmit={handleSubmit}>
        {[
          { id:'sir-name',  field: nameField,    type:'text',  label:'Name' },
          { id:'sir-email', field: emailField,   type:'email', label:'Email' },
        ].map(({ id, field, type, label }) => (
          <div key={id}>
            <label htmlFor={id} style={{ color:'#94a3b8',fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem' }}>{label}</label>
            <input
              id={id} type={type}
              name={field.name}
              value={(field.value as string) ?? ''}
              onChange={field.onChange}
              disabled={form.isSubmitting}
              style={{ background:'#0a0f1e',border:'1px solid #334155',borderRadius:'7px',color:'#e2e8f0',padding:'0.55rem 0.75rem',width:'100%',fontSize:'0.85rem',marginBottom:'0.75rem' }}
            />
            {field.error && <div style={{ color:'#f87171',fontSize:'0.72rem',marginTop:'-0.5rem',marginBottom:'0.5rem' }}>{field.error}</div>}
          </div>
        ))}
        <div>
          <label htmlFor="sir-message" style={{ color:'#94a3b8',fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem' }}>Message</label>
          <textarea
            id="sir-message" rows={3}
            name={messageField.name}
            value={(messageField.value as string) ?? ''}
            onChange={messageField.onChange}
            disabled={form.isSubmitting}
            style={{ background:'#0a0f1e',border:'1px solid #334155',borderRadius:'7px',color:'#e2e8f0',padding:'0.55rem 0.75rem',width:'100%',fontSize:'0.85rem',resize:'vertical',marginBottom:'0.75rem' }}
          />
          {messageField.error && <div style={{ color:'#f87171',fontSize:'0.72rem',marginTop:'-0.5rem',marginBottom:'0.5rem' }}>{messageField.error}</div>}
        </div>
        <button type="submit" disabled={form.isSubmitting} style={{ background:'linear-gradient(135deg,#4c1d95,#8b5cf6)',color:'white',border:'none',borderRadius:'8px',padding:'0.55rem 1.1rem',fontSize:'0.82rem',fontWeight:700,cursor:form.isSubmitting?'not-allowed':'pointer',opacity:form.isSubmitting?0.6:1,width:'100%' }}>
          {form.isSubmitting ? 'Submitting…' : 'Submit (sir-forms)'}
        </button>
        {result && (
          <div style={{ marginTop:'0.75rem',padding:'0.75rem',background:result.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',color:result.startsWith('✅')?'#10b981':'#ef4444',borderRadius:'7px',fontSize:'0.8rem',border:`1px solid ${result.startsWith('✅')?'#10b981':'#ef4444'}` }}>
            {result}
          </div>
        )}
      </form>
      <div style={{ marginTop:'1rem',background:'#020817',borderRadius:'8px',padding:'0.75rem',border:'1px solid #1e293b' }}>
        <div style={{ color:'#475569',fontSize:'0.65rem',marginBottom:'0.4rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Usage</div>
        <pre style={{ color:'#a78bfa',fontSize:'0.7rem',fontFamily:'monospace',margin:0,overflow:'auto' }}>
{`const nameField = useField('name')

<input
  name={nameField.name}
  value={nameField.value ?? ''}
  onChange={nameField.onChange}
/>`}
        </pre>
      </div>
    </div>
  )
}

function SuruyFormActionsExample() {
  const { state, action, pending, formRef } = useFormAction(suruySendContactMessage, {
    onSuccess: () => {},
    resetOnSuccess: true,
  })

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem' }}>
        <div style={{ width:12,height:12,borderRadius:'50%',background:'#f5576c',boxShadow:'0 0 8px #f5576c' }} />
        <h3 style={{ color:'#fb7185',fontSize:'1rem',fontWeight:700,margin:0 }}>@yedoma-labs/suruy-form-actions</h3>
      </div>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1rem',lineHeight:1.5 }}>
        Native form action. Progressive enhancement. Lighter weight (~3KB).
      </p>
      <form ref={formRef} action={action}>
        {[
          { id:'suruy-name',    name:'name',    type:'text',  label:'Name',    error: state.errors?.name?.[0] },
          { id:'suruy-email',   name:'email',   type:'email', label:'Email',   error: state.errors?.email?.[0] },
          { id:'suruy-message', name:'message', type:'text',  label:'Message', error: state.errors?.message?.[0] },
        ].map(({ id, name, type, label, error }) => (
          <div key={id}>
            <label htmlFor={id} style={{ color:'#94a3b8',fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem' }}>{label}</label>
            {type === 'text' && id === 'suruy-message' ? (
              <textarea id={id} name={name} rows={3} disabled={pending} style={{ background:'#0a0f1e',border:'1px solid #334155',borderRadius:'7px',color:'#e2e8f0',padding:'0.55rem 0.75rem',width:'100%',fontSize:'0.85rem',resize:'vertical',marginBottom:'0.75rem' }} />
            ) : (
              <input id={id} name={name} type={type} disabled={pending} style={{ background:'#0a0f1e',border:'1px solid #334155',borderRadius:'7px',color:'#e2e8f0',padding:'0.55rem 0.75rem',width:'100%',fontSize:'0.85rem',marginBottom:'0.75rem' }} />
            )}
            {error && <div style={{ color:'#f87171',fontSize:'0.72rem',marginTop:'-0.5rem',marginBottom:'0.5rem' }}>{error}</div>}
          </div>
        ))}
        <input type="hidden" name="priority" value="medium" />
        <button type="submit" disabled={pending} style={{ background:'linear-gradient(135deg,#831843,#f5576c)',color:'white',border:'none',borderRadius:'8px',padding:'0.55rem 1.1rem',fontSize:'0.82rem',fontWeight:700,cursor:pending?'not-allowed':'pointer',opacity:pending?0.6:1,width:'100%' }}>
          {pending ? 'Submitting…' : 'Submit (suruy)'}
        </button>
        {state.success && state.data && (
          <div style={{ marginTop:'0.75rem',padding:'0.75rem',background:'rgba(16,185,129,0.1)',color:'#10b981',borderRadius:'7px',fontSize:'0.8rem',border:'1px solid #10b981' }}>
            ✅ Success! Message ID: {state.data.messageId}
          </div>
        )}
      </form>
      <div style={{ marginTop:'1rem',background:'#020817',borderRadius:'8px',padding:'0.75rem',border:'1px solid #1e293b' }}>
        <div style={{ color:'#475569',fontSize:'0.65rem',marginBottom:'0.4rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Usage</div>
        <pre style={{ color:'#fb7185',fontSize:'0.7rem',fontFamily:'monospace',margin:0,overflow:'auto' }}>
{`const { state, action, pending, formRef } =
  useFormAction(myAction)

<form ref={formRef} action={action}>
  <input name="name" />
  {state.errors?.name &&
    <span>{state.errors.name[0]}</span>}
</form>`}
        </pre>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  ['Bundle Size',            '~8KB',          '~3KB'],
  ['Runtime Dependencies',   'None',          'None'],
  ['React Version',          '19+',           '19+'],
  ['Progressive Enhancement','⚠️ Partial',    '✅ Full'],
  ['Built-in Validator',     '❌ No',         '✅ Yes'],
  ['Zod Support',            '✅ Yes',        '✅ Yes'],
  ['Field-level State',      '✅ Yes',        '❌ No'],
  ['Form State Management',  '✅ Built-in',   '⚠️ Basic'],
  ['Auto-reset on Success',  '❌ No',         '✅ Yes'],
  ['Best For',               'Complex forms, controlled inputs, rich UX', 'Simple forms, server-first, progressive enhancement'],
]

export default function ComparisonPage() {
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
            background:'linear-gradient(135deg,#1f0036,#3b0764,#0f172a)',
            borderRadius:'24px',padding:'3rem',marginBottom:'1.5rem',
            border:'1px solid rgba(249,115,22,0.2)',position:'relative',overflow:'hidden',
          }}>
            <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(ellipse at 70% 50%,rgba(139,92,246,0.12) 0%,transparent 60%)',pointerEvents:'none' }} />
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'1.5rem',position:'relative' }}>
              <div>
                <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',padding:'0.3rem 0.8rem',borderRadius:'2rem',marginBottom:'1rem' }}>
                  <span style={{ color:'#a78bfa',fontSize:'0.75rem',fontWeight:700 }}>sir-forms</span>
                  <span style={{ color:'#475569' }}>vs</span>
                  <span style={{ color:'#fb7185',fontSize:'0.75rem',fontWeight:700 }}>suruy-form-actions</span>
                </div>
                <h1 style={{ fontSize:'clamp(1.75rem,4vw,3rem)',fontWeight:900,margin:'0 0 0.5rem',background:'linear-gradient(135deg,#e2e8f0,#a78bfa,#fb7185)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1.05 }}>
                  Library Comparison
                </h1>
                <p style={{ color:'#94a3b8',fontSize:'1rem',margin:'0 0 1.5rem',maxWidth:500 }}>
                  Side-by-side feature matrix and live form demos — see the same form built two different ways.
                </p>
              </div>
              <div style={{ fontSize:'5rem',lineHeight:1,animation:'float 4s ease-in-out infinite',flexShrink:0 }}>⚖️</div>
            </div>
          </div>

          <div style={{ marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap' }}>
            <Link href="/" style={{ color:'#a78bfa',textDecoration:'none',fontSize:'0.85rem' }}>← All Demos</Link>
            <span style={{ color:'#1e293b' }}>·</span>
            <a href="https://www.npmjs.com/package/@yedoma-labs/sir-forms" target="_blank" rel="noopener noreferrer" style={{ color:'#8b5cf6',textDecoration:'none',fontSize:'0.85rem' }}>sir-forms npm ↗</a>
            <span style={{ color:'#1e293b' }}>·</span>
            <a href="https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions" target="_blank" rel="noopener noreferrer" style={{ color:'#fb923c',textDecoration:'none',fontSize:'0.85rem' }}>suruy npm ↗</a>
          </div>

          {/* Comparison Table */}
          <div style={{ background:'#1e293b',borderRadius:'16px',padding:'2rem',marginBottom:'1.5rem',border:'1px solid #334155' }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'linear-gradient(135deg,#312e81,#6366f1)',padding:'0.4rem 1.1rem',borderRadius:'2rem',marginBottom:'1.75rem' }}>
              <span style={{ fontSize:'1.1rem' }}>📊</span>
              <h2 style={{ color:'white',fontSize:'1.1rem',fontWeight:800,margin:0 }}>Feature Comparison</h2>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #334155' }}>
                    <th style={{ textAlign:'left',padding:'0.65rem 0.75rem',color:'#64748b',fontWeight:600 }}>Feature</th>
                    <th style={{ textAlign:'center',padding:'0.65rem 0.75rem',color:'#a78bfa',fontWeight:700 }}>sir-forms</th>
                    <th style={{ textAlign:'center',padding:'0.65rem 0.75rem',color:'#fb7185',fontWeight:700 }}>suruy-form-actions</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map(([feature, left, right], i) => {
                    const color = (v: string) => v.startsWith('✅') ? '#10b981' : v.startsWith('❌') ? '#ef4444' : v.startsWith('⚠️') ? '#f59e0b' : '#94a3b8'
                    return (
                      <tr key={feature} style={{ borderBottom:'1px solid #1e293b',background:i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding:'0.65rem 0.75rem',color:'#94a3b8' }}>{feature}</td>
                        <td style={{ textAlign:'center',padding:'0.65rem 0.75rem',color:color(left),fontSize:i===COMPARISON_ROWS.length-1?'0.72rem':'0.82rem' }}>{left}</td>
                        <td style={{ textAlign:'center',padding:'0.65rem 0.75rem',color:color(right),fontSize:i===COMPARISON_ROWS.length-1?'0.72rem':'0.82rem' }}>{right}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side-by-side forms */}
          <div style={{ background:'#1e293b',borderRadius:'16px',padding:'2rem',marginBottom:'1.5rem',border:'1px solid #334155' }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'linear-gradient(135deg,#1e3a5f,#06b6d4)',padding:'0.4rem 1.1rem',borderRadius:'2rem',marginBottom:'1.75rem' }}>
              <span style={{ fontSize:'1.1rem' }}>🔬</span>
              <h2 style={{ color:'white',fontSize:'1.1rem',fontWeight:800,margin:0 }}>Live Side-by-Side</h2>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem' }}>
              <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid rgba(99,102,241,0.25)' }}>
                <FormProvider initialValues={{ name:'',email:'',message:'' }}>
                  <SirFormsExample />
                </FormProvider>
              </div>
              <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid rgba(245,87,108,0.25)' }}>
                <SuruyFormActionsExample />
              </div>
            </div>
          </div>

          {/* Which to use */}
          <div style={{ background:'#1e293b',borderRadius:'16px',padding:'2rem',marginBottom:'1.5rem',border:'1px solid #334155' }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'linear-gradient(135deg,#064e3b,#10b981)',padding:'0.4rem 1.1rem',borderRadius:'2rem',marginBottom:'1.75rem' }}>
              <span style={{ fontSize:'1.1rem' }}>🤔</span>
              <h2 style={{ color:'white',fontSize:'1.1rem',fontWeight:800,margin:0 }}>Which One Should I Use?</h2>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.5rem' }}>
              <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.25rem',border:'1px solid rgba(99,102,241,0.2)' }}>
                <h3 style={{ color:'#a78bfa',marginBottom:'0.75rem',fontSize:'0.9rem',fontWeight:700 }}>Choose sir-forms when:</h3>
                <ul style={{ listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'0.35rem' }}>
                  {['Fine-grained control over field state','Complex, multi-step forms','Client-side validation is key','Controlled components required','Rich React-heavy UX','Custom field hooks needed'].map(t => (
                    <li key={t} style={{ color:'#64748b',fontSize:'0.78rem',display:'flex',gap:'0.5rem' }}><span style={{ color:'#a78bfa',flexShrink:0 }}>›</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.25rem',border:'1px solid rgba(245,87,108,0.2)' }}>
                <h3 style={{ color:'#fb7185',marginBottom:'0.75rem',fontSize:'0.9rem',fontWeight:700 }}>Choose suruy-form-actions when:</h3>
                <ul style={{ listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'0.35rem' }}>
                  {['Bundle size matters (~3KB)','Progressive enhancement required','Server-first validation preferred','Simple to medium complexity forms','Zero-config built-in validator','SEO and no-JS scenarios matter'].map(t => (
                    <li key={t} style={{ color:'#64748b',fontSize:'0.78rem',display:'flex',gap:'0.5rem' }}><span style={{ color:'#fb7185',flexShrink:0 }}>›</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'10px',padding:'1rem' }}>
              <strong style={{ color:'#fbbf24' }}>💡 Pro Tip:</strong>{' '}
              <span style={{ color:'#94a3b8',fontSize:'0.85rem' }}>
                You can use <strong style={{ color:'#fb7185' }}>suruy-form-actions</strong> for simple forms (login, newsletter, contact) and <strong style={{ color:'#a78bfa' }}>sir-forms</strong> for complex ones (checkout, profile editor, admin panels) — see the <Link href="/hybrid" style={{ color:'#f59e0b',textDecoration:'none',fontWeight:700 }}>Hybrid Demo →</Link>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center',padding:'2rem 1rem',borderTop:'1px solid #1e293b',color:'#334155' }}>
            <p style={{ fontSize:'0.8rem' }}>
              <Link href="/" style={{ color:'#a78bfa',textDecoration:'none' }}>← Yedoma Labs Demo Hub</Link>
              <span style={{ color:'#1e293b',margin:'0 0.75rem' }}>·</span>
              <Link href="/hybrid" style={{ color:'#fb7185',textDecoration:'none' }}>Hybrid Demo →</Link>
              <span style={{ color:'#1e293b',margin:'0 0.75rem' }}>·</span>
              <Link href="/suruy" style={{ color:'#f59e0b',textDecoration:'none' }}>suruy Demo →</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
