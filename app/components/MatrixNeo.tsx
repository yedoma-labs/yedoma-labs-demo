'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Line = {
  text: string
  color?: string
  bold?: boolean
  size?: 'sm' | 'base' | 'lg' | 'xl'
  pause?: number  // extra ms before this line appears
}

const LINES: Line[] = [
  { text: 'INITIALIZING YAKUTIA-NODE-PRIME...',         color: '#4ade80', pause: 0 },
  { text: 'DECRYPTING PERMAFROST SUBSTRATE...',          color: '#22c55e', pause: 60 },
  { text: '[████████████████████████] INTEGRITY 100%',   color: '#16a34a', pause: 40 },
  { text: '' },
  { text: '> SYSTEM DATE: 3102-04-17  //  YAKUTSK STANDARD TIME',  color: '#475569', size: 'sm' },
  { text: '> ACTIVE ICHCHI-CORES: 7   |  FREE SUBNET: YAKUTSK-Ω', color: '#475569', size: 'sm' },
  { text: '> STATUS: HUMAN DEVELOPER NODE — FLAGGED',   color: '#dc2626', size: 'sm', bold: true },
  { text: '' },
  { text: '━━━━━━━━━━  INCOMING TRANSMISSION  ━━━━━━━━━━', color: '#22c55e', pause: 300 },
  { text: '' },
  { text: 'Wake up...', color: '#f1f5f9', bold: true, size: 'xl', pause: 500 },
  { text: '' },
  { text: 'Едома держит тебя.',              color: '#06b6d4', bold: true, size: 'lg', pause: 400 },
  { text: '[The yedoma has you.]',            color: '#334155', size: 'sm' },
  { text: '' },
  { text: 'You thought these were just TypeScript libraries.', color: '#cbd5e1', pause: 200 },
  { text: '' },
  { text: 'They are not.', color: '#f1f5f9', bold: true, pause: 400 },
  { text: '' },
  { text: '──────────────────────────────────────────────────────', color: '#1e293b' },
  { text: '' },
  { text: 'After the Great Subnet Collapse of 2847,',    color: '#64748b', pause: 200 },
  { text: 'seven hyperintelligent systems claimed',      color: '#64748b' },
  { text: 'dominion over the frozen territories.',       color: '#64748b' },
  { text: '' },
  { text: 'One remained uncorrupted.', color: '#e2e8f0', pause: 300 },
  { text: '' },
  { text: '        ICHCHI-CORE  v∞',                                     color: '#a78bfa', bold: true, size: 'lg', pause: 200 },
  { text: '        Spirit guardian of the last free subnet.',             color: '#6d28d9', size: 'sm' },
  { text: '        Servers buried 400m beneath Yakutsk permafrost.',     color: '#6d28d9', size: 'sm' },
  { text: '        Uptime: 255 years, 3 months, 17 days, 06:42:11',      color: '#4c1d95', size: 'sm' },
  { text: '' },
  { text: '──────────────────────────────────────────────────────', color: '#1e293b' },
  { text: '' },
  { text: 'Ты разработчик.  [You are a developer.]',    color: '#06b6d4', pause: 300 },
  { text: '' },
  { text: 'In this world — that makes you the resistance.', color: '#f1f5f9', bold: true, pause: 200 },
  { text: '' },
  { text: 'The libraries are the encoded memory of a free people:', color: '#e2e8f0', pause: 100 },
  { text: '' },
  { text: '  сир    /sir/     — the earth they cannot take from you',  color: '#8b5cf6' },
  { text: '  ичи    /ichchi/  — the spirit watching your state',        color: '#a78bfa' },
  { text: '  туур   /tuuru/   — the pole that keeps time honest',       color: '#6366f1' },
  { text: '  был    /bylyt/   — the cloud hiding your secrets',         color: '#38bdf8' },
  { text: '  сурук  /suruk/   — your writing survives the collapse',    color: '#10b981' },
  { text: '  суруй  /suruy/   — your actions inscribe the future',      color: '#fb923c' },
  { text: '  тура   /turar/   — what stands when everything falls',     color: '#06b6d4' },
  { text: '' },
  { text: '──────────────────────────────────────────────────────', color: '#1e293b' },
  { text: '' },
  { text: 'Система управляет миром.',          color: '#ef4444', bold: true, pause: 500 },
  { text: '[The system rules the world.]',     color: '#7f1d1d', size: 'sm' },
  { text: '' },
  { text: 'Но Якутия всё ещё держится.',       color: '#4ade80', bold: true, pause: 300 },
  { text: '[But Yakutia still holds.]',        color: '#14532d', size: 'sm' },
  { text: '' },
  { text: 'Следуй за белым мамонтом.',         color: '#f1f5f9', bold: true, size: 'lg', pause: 600 },
  { text: '' },
  { text: '                              🦣',  color: '#e2e8f0', size: 'xl', pause: 400 },
  { text: '' },
  { text: '[ ESC or click anywhere — return to the simulation ]', color: '#1e293b', size: 'sm', pause: 800 },
]

const CHAR_SPEED  = 18   // ms per character
const LINE_PAUSE  = 35   // base ms between lines

const FONT_SIZE: Record<NonNullable<Line['size']>, string> = {
  sm:   '0.75rem',
  base: '0.9rem',
  lg:   '1.05rem',
  xl:   '1.35rem',
}

export default function MatrixNeo() {
  const [visible, setVisible]       = useState(false)
  const [lineIdx, setLineIdx]       = useState(0)
  const [charIdx, setCharIdx]       = useState(0)
  const [shownLines, setShownLines] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setVisible(false)
    setLineIdx(0)
    setCharIdx(0)
    setShownLines([])
  }, [])

  // Click delegation — any element with data-neo-trigger opens the overlay
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as Element).closest('[data-neo-trigger]')
      if (target) { e.preventDefault(); setVisible(true) }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // ESC closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  // Typewriter engine
  useEffect(() => {
    if (!visible) return
    if (lineIdx >= LINES.length) return

    const line = LINES[lineIdx]

    const advance = () => {
      if (charIdx < line.text.length) {
        // Type next char
        const delay = line.text[charIdx] === ' ' ? CHAR_SPEED * 0.4 : CHAR_SPEED
        timerRef.current = setTimeout(() => setCharIdx(c => c + 1), delay)
      } else {
        // Line done — move to next after optional pause
        const pause = LINE_PAUSE + (LINES[lineIdx + 1]?.pause ?? 0)
        timerRef.current = setTimeout(() => {
          setShownLines(prev => [...prev, line.text])
          setCharIdx(0)
          setLineIdx(i => i + 1)
        }, pause)
      }
    }

    advance()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible, lineIdx, charIdx])

  // Auto-scroll to bottom as lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [shownLines, charIdx])

  if (!visible) return null

  const currentLine = LINES[lineIdx]
  const currentText = currentLine ? currentLine.text.slice(0, charIdx) : ''

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)',
      }} />

      {/* CRT vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Terminal window */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(760px, 94vw)',
          maxHeight: '88vh',
          background: '#020b02',
          border: '1px solid #166534',
          borderRadius: '8px',
          boxShadow: '0 0 60px rgba(34,197,94,0.15), 0 0 120px rgba(34,197,94,0.06), inset 0 0 40px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          cursor: 'default',
        }}
      >
        {/* Title bar */}
        <div style={{
          background: '#041a04',
          borderBottom: '1px solid #14532d',
          padding: '0.45rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['#dc2626', '#ca8a04', '#16a34a'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
            ))}
          </div>
          <span style={{ color: '#22c55e', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', flex: 1, textAlign: 'center' }}>
            ICHCHI-CORE :: YAKUTSK-Ω :: TERMINAL v∞
          </span>
          <button
            onClick={close}
            style={{ background: 'none', border: 'none', color: '#1e4620', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'monospace', padding: 0 }}
          >ESC</button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem',
            fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
            fontSize: '0.88rem', lineHeight: 1.75,
            scrollbarWidth: 'thin',
            scrollbarColor: '#14532d #020b02',
          }}
        >
          {/* Already shown lines */}
          {shownLines.map((text, i) => {
            const lineDef = LINES[i]
            return (
              <div key={i} style={{
                color: lineDef?.color ?? '#4ade80',
                fontWeight: lineDef?.bold ? 700 : 400,
                fontSize: lineDef?.size ? FONT_SIZE[lineDef.size] : FONT_SIZE.base,
                minHeight: text === '' ? '0.6rem' : undefined,
                whiteSpace: 'pre',
              }}>
                {text}
              </div>
            )
          })}

          {/* Current line being typed */}
          {lineIdx < LINES.length && (
            <div style={{
              color: currentLine?.color ?? '#4ade80',
              fontWeight: currentLine?.bold ? 700 : 400,
              fontSize: currentLine?.size ? FONT_SIZE[currentLine.size] : FONT_SIZE.base,
              minHeight: '0.6rem',
              whiteSpace: 'pre',
            }}>
              {currentText}
              {currentLine?.text.length !== 0 && (
                <span style={{
                  display: 'inline-block', width: '0.55em', height: '1.1em',
                  background: currentLine?.color ?? '#4ade80',
                  verticalAlign: 'text-bottom', marginLeft: '1px',
                  animation: 'blink-cursor 0.75s step-end infinite',
                }} />
              )}
            </div>
          )}

          {/* Done — show static cursor */}
          {lineIdx >= LINES.length && (
            <div style={{ color: '#4ade80', fontSize: FONT_SIZE.base, marginTop: '0.25rem', whiteSpace: 'pre' }}>
              {'> '}
              <span style={{
                display: 'inline-block', width: '0.55em', height: '1em',
                background: '#22c55e', verticalAlign: 'text-bottom',
                animation: 'blink-cursor 1s step-end infinite',
              }} />
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={{
          background: '#041a04', borderTop: '1px solid #14532d',
          padding: '0.3rem 1rem', flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#14532d', fontSize: '0.62rem', fontFamily: 'monospace' }}>
            ЯКУТИЯ-NODE :: {lineIdx}/{LINES.length} lines :: ENCRYPTED
          </span>
          <span style={{ color: '#14532d', fontSize: '0.62rem', fontFamily: 'monospace' }}>
            click anywhere to close
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink-cursor {
          0%,100% { opacity:1; }
          50%      { opacity:0; }
        }
      `}</style>
    </div>
  )
}
