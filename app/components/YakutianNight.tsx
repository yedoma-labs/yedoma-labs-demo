'use client'

import { useEffect, useRef } from 'react'

// Aurora band: baseY (fraction of H), RGB, travel speed, wave freq, wave amplitude, phase
const BANDS = [
  { y: 0.13, rgb: [20,  255, 120] as const, spd: 0.30, fq: 0.0040, amp: 0.042, ph: 0.0 },
  { y: 0.18, rgb: [0,   200, 255] as const, spd: 0.50, fq: 0.0065, amp: 0.032, ph: 2.1 },
  { y: 0.09, rgb: [110,  20, 255] as const, spd: 0.18, fq: 0.0030, amp: 0.054, ph: 4.2 },
  { y: 0.22, rgb: [0,   255, 180] as const, spd: 0.42, fq: 0.0085, amp: 0.028, ph: 1.4 },
  { y: 0.06, rgb: [0,   160, 100] as const, spd: 0.57, fq: 0.0055, amp: 0.022, ph: 3.5 },
  { y: 0.16, rgb: [80,  255, 200] as const, spd: 0.35, fq: 0.0048, amp: 0.037, ph: 5.8 },
]

export default function YakutianNight() {
  const mainRef  = useRef<HTMLCanvasElement>(null)
  const frostRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const mc = mainRef.current
    const fc = frostRef.current
    if (!mc || !fc) return

    const ctx  = mc.getContext('2d')!
    const fCtx = fc.getContext('2d')!

    let W = 0, H = 0

    // ── Stars (computed once per resize) ──────────────────────────────────────
    type Star = { x: number; y: number; r: number; tw: number; spd: number }
    let stars: Star[] = []
    const buildStars = (w: number, h: number) =>
      Array.from({ length: 200 }, () => ({
        x:   Math.random() * w,
        y:   Math.random() * h * 0.48,
        r:   0.2 + Math.random() * 0.9,
        tw:  Math.random() * Math.PI * 2,
        spd: 0.5 + Math.random() * 2.5,
      }))

    // ── DLA frost ─────────────────────────────────────────────────────────────
    const SC = 3              // px per grid cell
    let GW = 0, GH = 0
    let frozen: Uint8Array
    let frozenCount = 0

    const initDLA = () => {
      GW = Math.ceil(W / SC)
      GH = Math.ceil(H / SC)
      frozen = new Uint8Array(GW * GH)
      frozenCount = 0
      // Sparse edge seeds — every 5th cell on each border
      for (let x = 0; x < GW; x += 5) {
        frozen[x] = 1
        frozen[(GH - 1) * GW + x] = 1
      }
      for (let y = 0; y < GH; y += 5) {
        frozen[y * GW] = 1
        frozen[y * GW + GW - 1] = 1
      }
    }

    const isFz = (gx: number, gy: number) =>
      gx >= 0 && gx < GW && gy >= 0 && gy < GH && frozen[gy * GW + gx] === 1

    const hasAdj = (gx: number, gy: number) =>
      isFz(gx - 1, gy) || isFz(gx + 1, gy) || isFz(gx, gy - 1) || isFz(gx, gy + 1)

    const doFreeze = (gx: number, gy: number) => {
      if (gx < 0 || gx >= GW || gy < 0 || gy >= GH || frozen[gy * GW + gx]) return
      frozen[gy * GW + gx] = 1
      frozenCount++
      // Paint ice crystal onto frost canvas
      const px = gx * SC + SC / 2, py = gy * SC + SC / 2
      const a  = 0.35 + Math.random() * 0.5
      fCtx.fillStyle = `rgba(155,210,255,${a})`
      fCtx.beginPath()
      fCtx.arc(px, py, SC * 0.78, 0, Math.PI * 2)
      fCtx.fill()
      // Rare bright sparkle — the Yakutian diamond dust
      if (Math.random() < 0.1) {
        fCtx.fillStyle = 'rgba(230,245,255,0.95)'
        fCtx.fillRect(px - 0.5, py - 0.5, 1, 1)
      }
      // Restart at 38% coverage
      if (frozenCount >= GW * GH * 0.38) {
        fCtx.clearRect(0, 0, W, H)
        initDLA()
        particles.length = 0
      }
    }

    type Pt = { x: number; y: number }
    const particles: Pt[] = []
    const MAX_P = 160

    const spawn = (): Pt => {
      const e = Math.random()
      if (e < 0.28)      return { x: Math.random() * GW,    y: 0 }
      else if (e < 0.56) return { x: Math.random() * GW,    y: GH - 1 }
      else if (e < 0.78) return { x: 0,                     y: Math.random() * GH }
      else               return { x: GW - 1,                 y: Math.random() * GH }
    }

    const stepDLA = () => {
      while (particles.length < MAX_P) particles.push(spawn())
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        for (let s = 0; s < 8; s++) {
          const d = Math.random() * 4 | 0
          if      (d === 0) p.x -= 1
          else if (d === 1) p.x += 1
          else if (d === 2) p.y -= 1
          else              p.y += 1
          const gx = p.x | 0, gy = p.y | 0
          if (gx < 0 || gx >= GW || gy < 0 || gy >= GH) { Object.assign(p, spawn()); break }
          if (hasAdj(gx, gy)) { doFreeze(gx, gy); particles.splice(i, 1); break }
        }
      }
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight
      mc.width = W; mc.height = H
      fc.width = W; fc.height = H
      stars = buildStars(W, H)
      fCtx.clearRect(0, 0, W, H)
      initDLA()
      particles.length = 0
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Aurora ────────────────────────────────────────────────────────────────
    let t = 0

    const bandY = (b: typeof BANDS[0], x: number) =>
      H * b.y
      + Math.sin(x * b.fq          + t * b.spd          + b.ph)     * H * b.amp
      + Math.sin(x * b.fq * 2.62   + t * b.spd * 1.35   + b.ph + 1) * H * b.amp * 0.42
      + Math.sin(x * b.fq * 0.37   + t * b.spd * 0.27   + b.ph + 3) * H * b.amp * 0.58

    const drawAurora = () => {
      // Dim previous frame to create comet-trail stars & slow aurora fade
      ctx.fillStyle = 'rgba(0,3,20,0.20)'
      ctx.fillRect(0, 0, W, H)

      // Stars
      for (const s of stars) {
        const a = 0.22 + 0.55 * Math.sin(t * s.spd + s.tw)
        ctx.fillStyle = `rgba(195,220,255,${a})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Aurora
      for (const b of BANDS) {
        const [r, g, bv] = b.rgb
        const pts: Pt[] = []
        for (let x = -16; x <= W + 16; x += 8) pts.push({ x, y: bandY(b, x) })

        // 4 rendering passes: wide diffuse → medium → narrow → bright core
        const passes = [
          [100, 0.010],
          [42,  0.022],
          [14,  0.048],
          [4,   0.085],
        ] as const

        for (const [lw, al] of passes) {
          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y)
          for (let i = 1; i < pts.length - 1; i++) {
            ctx.quadraticCurveTo(
              pts[i].x, pts[i].y,
              (pts[i].x + pts[i + 1].x) / 2,
              (pts[i].y + pts[i + 1].y) / 2,
            )
          }
          ctx.strokeStyle = `rgba(${r},${g},${bv},${al})`
          ctx.lineWidth   = lw
          ctx.lineCap     = 'round'
          ctx.lineJoin    = 'round'
          ctx.stroke()
        }

        // Vertical curtain drape — the signature aurora look
        for (let i = 0; i < pts.length; i += 2) {
          const { x, y } = pts[i]
          const br = 0.18 + 0.82 * Math.abs(Math.sin(i * 0.17 + t * b.spd * 1.9))
          const cH = H * 0.15 * br
          if (cH < 3) continue
          const grad = ctx.createLinearGradient(x, y, x, y + cH)
          grad.addColorStop(0, `rgba(${r},${g},${bv},${0.048 * br})`)
          grad.addColorStop(1, `rgba(${r},${g},${bv},0)`)
          ctx.fillStyle = grad
          ctx.fillRect(x - 3, y, 6, cH)
        }
      }

      // Composite accumulated frost
      ctx.save()
      ctx.globalAlpha = 0.65
      ctx.drawImage(fc, 0, 0)
      ctx.restore()
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    let raf: number
    const loop = () => {
      t += 0.007
      stepDLA()
      drawAurora()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas ref={frostRef} style={{ display: 'none' }} aria-hidden />
      <canvas
        ref={mainRef}
        aria-hidden
        style={{
          position:       'fixed',
          inset:          0,
          width:          '100%',
          height:         '100%',
          pointerEvents:  'none',
          zIndex:         9,
          mixBlendMode:   'screen',
          opacity:        0.65,
        }}
      />
    </>
  )
}
