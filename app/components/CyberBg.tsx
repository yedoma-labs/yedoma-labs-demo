'use client'

import { useEffect, useRef } from 'react'

const CHARS = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ абвгдежзийклмнопрстуфхцчшщъыьэюя0123456789ΨΩΦΔΛΞΠΣΥΧψωφδλξπσ⊕⊗∞∂∇∫≠≈≡∀∃∅⌬⌘⌥⎋⏎░▒▓█▄▀■□▪▫◆◇✦✧⬡⬢'

export default function CyberBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    const FONT_SIZE = 14
    const GAP = 15

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    resize()
    window.addEventListener('resize', resize)

    const cols = Math.ceil(W / GAP)
    const drops = Array.from({ length: cols }, () => Math.random() * -(H / FONT_SIZE))
    const speeds = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.6)
    const hues  = Array.from({ length: cols }, () =>
      Math.random() > 0.65
        ? 190 + Math.random() * 30   // cyan family
        : 130 + Math.random() * 20,  // green family
    )

    let animId: number

    const draw = () => {
      ctx.fillStyle = 'rgba(15,23,42,0.055)'
      ctx.fillRect(0, 0, W, H)
      ctx.font = `${FONT_SIZE}px monospace`
      ctx.textBaseline = 'top'

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FONT_SIZE
        const x = i * GAP

        const char = CHARS[Math.floor(Math.random() * CHARS.length)]

        // Head glyph — bright
        ctx.fillStyle = `hsl(${hues[i]}, 90%, 82%)`
        ctx.fillText(char, x, y)

        // Occasional second bright glyph above
        if (Math.random() > 0.94) {
          ctx.fillStyle = `hsla(${hues[i]}, 70%, 60%, 0.55)`
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FONT_SIZE)
        }

        drops[i] += speeds[i]
        if (drops[i] * FONT_SIZE > H && Math.random() > 0.972) {
          drops[i] = -Math.random() * 25
          hues[i] = Math.random() > 0.65
            ? 190 + Math.random() * 30
            : 130 + Math.random() * 20
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.055,
      }}
    />
  )
}
