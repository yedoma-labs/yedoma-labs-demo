'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DateTime,
  Duration,
  LocalDate,
  LocalTime,
  Timezone,
  setDefaultLocale,
  getDefaultLocale,
  TIMEZONE_COUNT,
  TZDATA_VERSION,
  TIMEZONE_LINKS,
  en,
  es, fr, de, ja, zh, ru, ar, ko, pt, it,
  hi, bn, id, tr, vi, pl, nl, th, fa, ur, uk,
  da, sv, nb, fi, is as isl, hu, ro, bg, el, cs, sk, hr, sr,
} from '@yedoma-labs/tuuru-chrono-tz'
import { ms }     from '@yedoma-labs/tuuru-chrono-tz/locales/ms'
import { sw }     from '@yedoma-labs/tuuru-chrono-tz/locales/sw'
import { he }     from '@yedoma-labs/tuuru-chrono-tz/locales/he'
import { ca }     from '@yedoma-labs/tuuru-chrono-tz/locales/ca'
import { fil }    from '@yedoma-labs/tuuru-chrono-tz/locales/fil'
import { gu }     from '@yedoma-labs/tuuru-chrono-tz/locales/gu'
import { mr }     from '@yedoma-labs/tuuru-chrono-tz/locales/mr'
import { ta }     from '@yedoma-labs/tuuru-chrono-tz/locales/ta'
import { kk }     from '@yedoma-labs/tuuru-chrono-tz/locales/kk'
import { uz }     from '@yedoma-labs/tuuru-chrono-tz/locales/uz'
import { ka }     from '@yedoma-labs/tuuru-chrono-tz/locales/ka'
import { zh_Hans } from '@yedoma-labs/tuuru-chrono-tz/locales/zh_Hans'
import { zh_Hant } from '@yedoma-labs/tuuru-chrono-tz/locales/zh_Hant'
import { tl }     from '@yedoma-labs/tuuru-chrono-tz/locales/tl'
import { yue }    from '@yedoma-labs/tuuru-chrono-tz/locales/yue'
import { af }     from '@yedoma-labs/tuuru-chrono-tz/locales/af'
import { mn }     from '@yedoma-labs/tuuru-chrono-tz/locales/mn'
import { am }     from '@yedoma-labs/tuuru-chrono-tz/locales/am'
import { as as assamese } from '@yedoma-labs/tuuru-chrono-tz/locales/as'
import { az }     from '@yedoma-labs/tuuru-chrono-tz/locales/az'
import { be }     from '@yedoma-labs/tuuru-chrono-tz/locales/be'
import { bs }     from '@yedoma-labs/tuuru-chrono-tz/locales/bs'
import { cy }     from '@yedoma-labs/tuuru-chrono-tz/locales/cy'
import { et }     from '@yedoma-labs/tuuru-chrono-tz/locales/et'
import { eu }     from '@yedoma-labs/tuuru-chrono-tz/locales/eu'
import { ga }     from '@yedoma-labs/tuuru-chrono-tz/locales/ga'
import { gl }     from '@yedoma-labs/tuuru-chrono-tz/locales/gl'
import { hy }     from '@yedoma-labs/tuuru-chrono-tz/locales/hy'
import { jv }     from '@yedoma-labs/tuuru-chrono-tz/locales/jv'
import { km }     from '@yedoma-labs/tuuru-chrono-tz/locales/km'
import { kn }     from '@yedoma-labs/tuuru-chrono-tz/locales/kn'
import { ky }     from '@yedoma-labs/tuuru-chrono-tz/locales/ky'
import { lo }     from '@yedoma-labs/tuuru-chrono-tz/locales/lo'
import { lt }     from '@yedoma-labs/tuuru-chrono-tz/locales/lt'
import { lv }     from '@yedoma-labs/tuuru-chrono-tz/locales/lv'
import { mk }     from '@yedoma-labs/tuuru-chrono-tz/locales/mk'
import { ml }     from '@yedoma-labs/tuuru-chrono-tz/locales/ml'
import { my }     from '@yedoma-labs/tuuru-chrono-tz/locales/my'
import { ne }     from '@yedoma-labs/tuuru-chrono-tz/locales/ne'
import { or }     from '@yedoma-labs/tuuru-chrono-tz/locales/or'
import { pa }     from '@yedoma-labs/tuuru-chrono-tz/locales/pa'
import { ps }     from '@yedoma-labs/tuuru-chrono-tz/locales/ps'
import { sd }     from '@yedoma-labs/tuuru-chrono-tz/locales/sd'
import { si }     from '@yedoma-labs/tuuru-chrono-tz/locales/si'
import { sl }     from '@yedoma-labs/tuuru-chrono-tz/locales/sl'
import { so }     from '@yedoma-labs/tuuru-chrono-tz/locales/so'
import { sq }     from '@yedoma-labs/tuuru-chrono-tz/locales/sq'
import { sr_Latn } from '@yedoma-labs/tuuru-chrono-tz/locales/sr_Latn'
import { te }     from '@yedoma-labs/tuuru-chrono-tz/locales/te'
import { tk }     from '@yedoma-labs/tuuru-chrono-tz/locales/tk'
import { zu }     from '@yedoma-labs/tuuru-chrono-tz/locales/zu'

// ─── Config ───────────────────────────────────────────────────────────────────

const WORLD_CITIES = [
  { city: 'New York',     tz: 'America/New_York',     flag: '🇺🇸', gradient: 'linear-gradient(135deg,#1e3a8a,#3b82f6)' },
  { city: 'London',       tz: 'Europe/London',         flag: '🇬🇧', gradient: 'linear-gradient(135deg,#4c1d95,#8b5cf6)' },
  { city: 'Paris',        tz: 'Europe/Paris',          flag: '🇫🇷', gradient: 'linear-gradient(135deg,#831843,#ec4899)' },
  { city: 'Dubai',        tz: 'Asia/Dubai',            flag: '🇦🇪', gradient: 'linear-gradient(135deg,#78350f,#f59e0b)' },
  { city: 'Mumbai',       tz: 'Asia/Kolkata',          flag: '🇮🇳', gradient: 'linear-gradient(135deg,#7f1d1d,#ef4444)' },
  { city: 'Tokyo',        tz: 'Asia/Tokyo',            flag: '🇯🇵', gradient: 'linear-gradient(135deg,#064e3b,#10b981)' },
  { city: 'Sydney',       tz: 'Australia/Sydney',      flag: '🇦🇺', gradient: 'linear-gradient(135deg,#0e7490,#06b6d4)' },
  { city: 'Los Angeles',  tz: 'America/Los_Angeles',   flag: '🇺🇸', gradient: 'linear-gradient(135deg,#312e81,#6366f1)' },
]

const ACCENT_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b','#ef4444','#10b981',
  '#06b6d4','#6366f1','#fb923c','#34d399','#60a5fa','#a78bfa','#f472b6',
]

const ALL_LOCALES = [
  { locale: es,  name: 'Español',    flag: '🇪🇸', code: 'es' },
  { locale: fr,  name: 'Français',   flag: '🇫🇷', code: 'fr' },
  { locale: de,  name: 'Deutsch',    flag: '🇩🇪', code: 'de' },
  { locale: ja,  name: '日本語',      flag: '🇯🇵', code: 'ja' },
  { locale: zh,  name: '中文',        flag: '🇨🇳', code: 'zh' },
  { locale: ru,  name: 'Русский',    flag: '🇷🇺', code: 'ru' },
  { locale: ar,  name: 'العربية',    flag: '🇸🇦', code: 'ar' },
  { locale: ko,  name: '한국어',      flag: '🇰🇷', code: 'ko' },
  { locale: pt,  name: 'Português',  flag: '🇧🇷', code: 'pt' },
  { locale: it,  name: 'Italiano',   flag: '🇮🇹', code: 'it' },
  { locale: hi,  name: 'हिन्दी',       flag: '🇮🇳', code: 'hi' },
  { locale: bn,  name: 'বাংলা',       flag: '🇧🇩', code: 'bn' },
  { locale: id,  name: 'Bahasa',     flag: '🇮🇩', code: 'id' },
  { locale: tr,  name: 'Türkçe',     flag: '🇹🇷', code: 'tr' },
  { locale: vi,  name: 'Tiếng Việt', flag: '🇻🇳', code: 'vi' },
  { locale: pl,  name: 'Polski',     flag: '🇵🇱', code: 'pl' },
  { locale: nl,  name: 'Nederlands', flag: '🇳🇱', code: 'nl' },
  { locale: th,  name: 'ภาษาไทย',    flag: '🇹🇭', code: 'th' },
  { locale: fa,  name: 'فارسی',      flag: '🇮🇷', code: 'fa' },
  { locale: ur,  name: 'اردو',       flag: '🇵🇰', code: 'ur' },
  { locale: uk,  name: 'Українська', flag: '🇺🇦', code: 'uk' },
  { locale: da,  name: 'Dansk',      flag: '🇩🇰', code: 'da' },
  { locale: sv,  name: 'Svenska',    flag: '🇸🇪', code: 'sv' },
  { locale: nb,  name: 'Norsk',      flag: '🇳🇴', code: 'nb' },
  { locale: fi,  name: 'Suomi',      flag: '🇫🇮', code: 'fi' },
  { locale: isl, name: 'Íslenska',   flag: '🇮🇸', code: 'is' },
  { locale: hu,  name: 'Magyar',     flag: '🇭🇺', code: 'hu' },
  { locale: ro,  name: 'Română',     flag: '🇷🇴', code: 'ro' },
  { locale: bg,  name: 'Български',  flag: '🇧🇬', code: 'bg' },
  { locale: el,  name: 'Ελληνικά',   flag: '🇬🇷', code: 'el' },
  { locale: cs,  name: 'Čeština',    flag: '🇨🇿', code: 'cs' },
  { locale: sk,  name: 'Slovenčina', flag: '🇸🇰', code: 'sk' },
  { locale: hr,  name: 'Hrvatski',       flag: '🇭🇷', code: 'hr' },
  { locale: sr,  name: 'Српски',         flag: '🇷🇸', code: 'sr' },
  // ── v0.2.0 — hand-crafted ──────────────────────────────────────────────────
  { locale: ms,  name: 'Bahasa Melayu', flag: '🇲🇾', code: 'ms' },
  { locale: sw,  name: 'Kiswahili',     flag: '🇰🇪', code: 'sw' },
  { locale: he,  name: 'עברית',         flag: '🇮🇱', code: 'he' },
  { locale: ca,  name: 'Català',        flag: '🇦🇩', code: 'ca' },
  { locale: tl,  name: 'Filipino',      flag: '🇵🇭', code: 'tl' },
  { locale: fil, name: 'Tagalog',       flag: '🇵🇭', code: 'fil' },
  { locale: gu,  name: 'ગુજરાતી',       flag: '🇮🇳', code: 'gu' },
  { locale: mr,  name: 'मराठी',          flag: '🇮🇳', code: 'mr' },
  { locale: ta,  name: 'தமிழ்',          flag: '🇱🇰', code: 'ta' },
  // ── v0.2.0 — CLDR-generated ────────────────────────────────────────────────
  { locale: kk,     name: 'Қазақша',       flag: '🇰🇿', code: 'kk' },
  { locale: uz,     name: "O'zbekcha",     flag: '🇺🇿', code: 'uz' },
  { locale: ka,     name: 'ქართული',       flag: '🇬🇪', code: 'ka' },
  { locale: mn,     name: 'Монгол',        flag: '🇲🇳', code: 'mn' },
  { locale: af,     name: 'Afrikaans',     flag: '🇿🇦', code: 'af' },
  { locale: zh_Hans,  name: '简体中文',          flag: '🇨🇳', code: 'zh_Hans' },
  { locale: zh_Hant,  name: '繁體中文',          flag: '🇹🇼', code: 'zh_Hant' },
  { locale: yue,      name: '粵語',              flag: '🇭🇰', code: 'yue' },
  // ── v0.2.0 — extended ──────────────────────────────────────────────────────
  { locale: am,       name: 'አማርኛ',             flag: '🇪🇹', code: 'am' },
  { locale: assamese, name: 'অসমীয়া',           flag: '🇮🇳', code: 'as' },
  { locale: az,       name: 'Azərbaycanca',     flag: '🇦🇿', code: 'az' },
  { locale: be,       name: 'Беларуская',       flag: '🇧🇾', code: 'be' },
  { locale: bs,       name: 'Bosanski',         flag: '🇧🇦', code: 'bs' },
  { locale: cy,       name: 'Cymraeg',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', code: 'cy' },
  { locale: et,       name: 'Eesti',            flag: '🇪🇪', code: 'et' },
  { locale: eu,       name: 'Euskara',          flag: '🇪🇸', code: 'eu' },
  { locale: ga,       name: 'Gaeilge',          flag: '🇮🇪', code: 'ga' },
  { locale: gl,       name: 'Galego',           flag: '🇪🇸', code: 'gl' },
  { locale: hy,       name: 'Հայերեն',          flag: '🇦🇲', code: 'hy' },
  { locale: jv,       name: 'Basa Jawa',        flag: '🇮🇩', code: 'jv' },
  { locale: km,       name: 'ខ្មែរ',              flag: '🇰🇭', code: 'km' },
  { locale: kn,       name: 'ಕನ್ನಡ',             flag: '🇮🇳', code: 'kn' },
  { locale: ky,       name: 'Кыргызча',         flag: '🇰🇬', code: 'ky' },
  { locale: lo,       name: 'ລາວ',              flag: '🇱🇦', code: 'lo' },
  { locale: lt,       name: 'Lietuvių',         flag: '🇱🇹', code: 'lt' },
  { locale: lv,       name: 'Latviešu',         flag: '🇱🇻', code: 'lv' },
  { locale: mk,       name: 'Македонски',       flag: '🇲🇰', code: 'mk' },
  { locale: ml,       name: 'മലയാളം',           flag: '🇮🇳', code: 'ml' },
  { locale: my,       name: 'မြန်မာ',            flag: '🇲🇲', code: 'my' },
  { locale: ne,       name: 'नेपाली',            flag: '🇳🇵', code: 'ne' },
  { locale: or,       name: 'ଓଡ଼ିଆ',             flag: '🇮🇳', code: 'or' },
  { locale: pa,       name: 'ਪੰਜਾਬੀ',           flag: '🇮🇳', code: 'pa' },
  { locale: ps,       name: 'پښتو',             flag: '🇦🇫', code: 'ps' },
  { locale: sd,       name: 'سنڌي',             flag: '🇵🇰', code: 'sd' },
  { locale: si,       name: 'සිංහල',            flag: '🇱🇰', code: 'si' },
  { locale: sl,       name: 'Slovenščina',      flag: '🇸🇮', code: 'sl' },
  { locale: so,       name: 'Soomaali',         flag: '🇸🇴', code: 'so' },
  { locale: sq,       name: 'Shqip',            flag: '🇦🇱', code: 'sq' },
  { locale: sr_Latn,  name: 'Srpski (Lat)',     flag: '🇷🇸', code: 'sr_Latn' },
  { locale: te,       name: 'తెలుగు',           flag: '🇮🇳', code: 'te' },
  { locale: tk,       name: 'Türkmençe',        flag: '🇹🇲', code: 'tk' },
  { locale: zu,       name: 'IsiZulu',          flag: '🇿🇦', code: 'zu' },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmtOffset(mins: number): string {
  const sign = mins >= 0 ? '+' : '-'
  const abs  = Math.abs(mins)
  const h    = Math.floor(abs / 60).toString().padStart(2, '0')
  const m    = (abs % 60).toString().padStart(2, '0')
  return `UTC${sign}${h}:${m}`
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{
      background: '#020817', color: '#e2e8f0', padding: '1.25rem',
      borderRadius: '10px', fontSize: '0.775rem', overflowX: 'auto',
      fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace", lineHeight: 1.7,
      border: '1px solid #1e293b',
    }}>
      <code>{code}</code>
    </pre>
  )
}

function SectionHeader({
  emoji, title, subtitle, gradient,
}: { emoji: string; title: string; subtitle: string; gradient: string }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        background: gradient, padding: '0.4rem 1.1rem', borderRadius: '2rem', marginBottom: '0.6rem',
      }}>
        <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{title}</h2>
      </div>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '0.25rem' }}>{subtitle}</p>
    </div>
  )
}

function Chip({
  label, value, color = '#a78bfa',
}: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px',
      padding: '0.6rem 0.8rem',
    }}>
      <div style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ color, fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: 700 }}>{value || '—'}</div>
    </div>
  )
}

// ─── World Clock ──────────────────────────────────────────────────────────────

function WorldClock() {
  type ClockData = { time: string; date: string; offset: string; abbr: string; isDST: boolean }
  const [times, setTimes] = useState<Record<string, ClockData>>({})

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const next: Record<string, ClockData> = {}
      for (const { tz } of WORLD_CITIES) {
        const dt = DateTime.now(tz)
        next[tz] = {
          time:   dt.format('HH:mm:ss'),
          date:   dt.format('ddd, MMM D'),
          offset: fmtOffset(dt.offset),
          abbr:   Timezone.getAbbreviation(tz, now),
          isDST:  Timezone.isDST(tz, now),
        }
      }
      setTimes(next)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (!Object.keys(times).length) {
    return <div style={{ color: '#475569', fontFamily: 'monospace', padding: '2rem', textAlign: 'center' }}>Initialising clocks…</div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '1rem' }}>
      {WORLD_CITIES.map(({ city, tz, flag, gradient }) => {
        const d = times[tz]
        if (!d) return null
        return (
          <div key={tz} style={{
            background: gradient, borderRadius: '16px', padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -10, fontSize: '5rem', opacity: 0.12, pointerEvents: 'none' }}>
              {flag}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {flag} {city}
            </div>
            <div style={{ color: 'white', fontSize: '2.1rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {d.time}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', marginTop: '0.35rem' }}>{d.date}</div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {[d.offset, d.abbr].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.18)', color: 'white',
                  padding: '0.1rem 0.45rem', borderRadius: '4px',
                  fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 700,
                }}>{tag}</span>
              ))}
              {d.isDST && (
                <span style={{
                  background: 'rgba(251,191,36,0.3)', color: '#fef3c7',
                  padding: '0.1rem 0.45rem', borderRadius: '4px',
                  fontSize: '0.65rem', fontWeight: 700,
                }}>DST</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Construction Lab ─────────────────────────────────────────────────────────

function ConstructionLab() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const now       = DateTime.now('America/New_York')
  const fromISO   = DateTime.fromISO('2024-07-04T09:30:00-04:00')
  const fromFmt   = DateTime.fromFormat('25/12/2024 8:00 PM', 'DD/MM/YYYY h:mm A', { timezone: 'Europe/London' })
  const fromObj   = DateTime.fromObject({ year: 2025, month: 1, day: 1, hour: 0 }, { timezone: 'Asia/Tokyo' })
  const epoch     = DateTime.fromMilliseconds(0, 'UTC')
  const fromUnix  = DateTime.fromUnix(1_700_000_000, 'America/Chicago')
  const fromDate  = DateTime.fromDate(new Date('2024-03-14T15:09:26'), 'Europe/Berlin')

  const examples = [
    { m: `DateTime.now('America/New_York')`,                        v: now.format('YYYY-MM-DD HH:mm:ss Z') },
    { m: `DateTime.nowUTC()`,                                        v: DateTime.nowUTC().toISO() },
    { m: `DateTime.fromISO('2024-07-04T09:30:00-04:00')`,           v: fromISO.format('ddd, MMMM D YYYY · HH:mm Z') },
    { m: `DateTime.fromFormat('25/12/2024 8:00 PM', 'DD/MM/YYYY h:mm A', { timezone: 'Europe/London' })`,
                                                                     v: fromFmt.toISO() },
    { m: `DateTime.fromObject({ year: 2025, month: 1, day: 1, hour: 0 }, { timezone: 'Asia/Tokyo' })`,
                                                                     v: fromObj.format('YYYY-MM-DD HH:mm:ss [JST]') },
    { m: `DateTime.fromMilliseconds(0, 'UTC')  // Unix epoch`,       v: epoch.format('ddd, MMMM D YYYY · HH:mm:ss [UTC]') },
    { m: `DateTime.fromUnix(1_700_000_000, 'America/Chicago')`,     v: fromUnix.format('YYYY-MM-DD HH:mm:ss Z') },
    { m: `DateTime.fromDate(new Date('2024-03-14T15:09:26'), 'Europe/Berlin')`,
                                                                     v: fromDate.format('YYYY-MM-DD HH:mm:ss Z') },
    { m: `DateTime.min(fromISO, fromObj)`,                           v: DateTime.min(fromISO, fromObj).format('YYYY-MM-DD') },
    { m: `DateTime.max(fromISO, fromObj)`,                           v: DateTime.max(fromISO, fromObj).format('YYYY-MM-DD') },
    { m: `now.isValid()`,                                            v: String(now.isValid()) },
    { m: `now.quarter`,                                              v: String(now.quarter) },
    { m: `now.dayOfYear`,                                            v: String(now.dayOfYear) },
    { m: `now.weekOfYear`,                                           v: String(now.weekOfYear) },
    { m: `now.daysInMonth`,                                          v: String(now.daysInMonth) },
    { m: `now.isLeapYear`,                                           v: String(now.isLeapYear) },
    { m: `now.weekday  // 1=Mon … 7=Sun`,                           v: String(now.weekday) },
    { m: `now.offset   // minutes east-positive`,                    v: String(now.offset) },
    { m: `now.toUnix()`,                                             v: String(now.toUnix()) },
    { m: `now.timezone`,                                             v: now.timezone },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {examples.map(({ m, v }, i) => (
        <div key={m} style={{
          background: '#0a0f1e', borderLeft: `3px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`,
          borderRadius: '0 8px 8px 0', padding: '0.65rem 1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        }}>
          <code style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace', flexShrink: 0, maxWidth: '55%', wordBreak: 'break-all' }}>{m}</code>
          <span style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length], fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, textAlign: 'right' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Format Playground ────────────────────────────────────────────────────────

const FORMAT_PRESETS = [
  { label: 'ISO-like',    pattern: 'YYYY-MM-DD[T]HH:mm:ssZ' },
  { label: 'Human',       pattern: 'dddd, MMMM D[,] YYYY [at] h:mm A' },
  { label: 'Quarter',     pattern: '[Q]Q YYYY · [Week] W' },
  { label: 'Day-of-Year', pattern: 'DDD[/]366 YYYY' },
  { label: 'Log stamp',   pattern: '[[]YYYY-MM-DD HH:mm:ss.SSS[]] Z' },
  { label: 'Article',     pattern: 'MMMM D, YYYY' },
  { label: 'Short',       pattern: 'ddd MMM D HH:mm' },
  { label: 'Time only',   pattern: 'h:mm:ss A [·] Z' },
]

const FORMAT_TOKENS = [
  ['YYYY','4-digit year'],['YY','2-digit year'],['Q','quarter'],
  ['MMMM','Full month'],['MMM','Short month'],['MM','Padded month'],['M','Month num'],
  ['DD','Padded day'],['D','Day'],['DDDD','Padded day-of-year'],['DDD','Day-of-year'],
  ['WW','ISO week padded'],['W','ISO week'],['dddd','Weekday full'],['ddd','Weekday short'],
  ['HH','24h padded'],['H','24h'],['hh','12h padded'],['h','12h'],
  ['mm','Minute'],['ss','Second'],['SSS','Millisecond'],
  ['A','AM/PM'],['a','am/pm'],['Z','Offset +09:00'],['ZZ','Offset +0900'],['[text]','Literal'],
]

function FormatPlayground() {
  const [pattern, setPattern] = useState('dddd, MMMM D[,] YYYY [at] h:mm A')
  const [tz, setTz] = useState('America/New_York')
  const [result, setResult] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    try {
      setResult(DateTime.now(tz).format(pattern))
      setErr('')
    } catch (e) {
      setErr(String(e))
      setResult('')
    }
  }, [pattern, tz])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Format Pattern</div>
          <input
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            style={{
              width: '100%', padding: '0.65rem 0.8rem', background: '#0a0f1e',
              border: '1px solid #1e293b', borderRadius: '8px',
              color: '#e2e8f0', fontSize: '0.88rem', fontFamily: 'monospace',
            }}
          />
        </div>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Timezone</div>
          <select
            value={tz}
            onChange={e => setTz(e.target.value)}
            style={{
              padding: '0.65rem 0.8rem', background: '#0a0f1e',
              border: '1px solid #1e293b', borderRadius: '8px',
              color: '#e2e8f0', fontSize: '0.82rem', width: '100%',
            }}
          >
            {WORLD_CITIES.map(c => (
              <option key={c.tz} value={c.tz}>{c.flag} {c.city}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {FORMAT_PRESETS.map(p => (
          <button
            key={p.label} type="button"
            onClick={() => setPattern(p.pattern)}
            style={{
              padding: '0.25rem 0.65rem', borderRadius: '5px', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 600, border: '1px solid #1e293b',
              background: pattern === p.pattern ? '#6366f1' : '#0a0f1e',
              color: pattern === p.pattern ? 'white' : '#64748b',
            }}
          >{p.label}</button>
        ))}
      </div>

      <div style={{
        background: err ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
        border: `1px solid ${err ? '#ef4444' : '#6366f1'}`,
        borderRadius: '12px', padding: '1.75rem', textAlign: 'center', marginBottom: '1.5rem',
      }}>
        {err
          ? <span style={{ color: '#ef4444', fontSize: '0.82rem', fontFamily: 'monospace' }}>{err}</span>
          : <span style={{ color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{result}</span>
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: '0.35rem' }}>
        {FORMAT_TOKENS.map(([tok, desc]) => (
          <div
            key={tok}
            onClick={() => setPattern(prev => prev + tok)}
            style={{
              background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '6px',
              padding: '0.35rem 0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <code style={{ color: '#ec4899', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{tok}</code>
            <span style={{ color: '#475569', fontSize: '0.62rem' }}>{desc}</span>
          </div>
        ))}
      </div>
      <p style={{ color: '#334155', fontSize: '0.7rem', marginTop: '0.5rem' }}>Click a token to append it to the pattern</p>
    </div>
  )
}

// ─── Date Arithmetic ──────────────────────────────────────────────────────────

function DateArithmetic() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const base = DateTime.now('Europe/Paris')

  const ops: { label: string; dt: DateTime }[] = [
    { label: 'base  (now in Paris)',                                        dt: base },
    { label: '.add({ hours: 6 })',                                          dt: base.add({ hours: 6 }) },
    { label: '.add({ days: 7 })',                                           dt: base.add({ days: 7 }) },
    { label: '.add({ weeks: 2 })',                                          dt: base.add({ weeks: 2 }) },
    { label: '.add({ months: 3 })',                                         dt: base.add({ months: 3 }) },
    { label: '.add({ years: 1 })',                                          dt: base.add({ years: 1 }) },
    { label: '.subtract({ hours: 12 })',                                    dt: base.subtract({ hours: 12 }) },
    { label: '.subtract({ days: 10 })',                                     dt: base.subtract({ days: 10 }) },
    { label: '.subtract({ months: 2 })',                                    dt: base.subtract({ months: 2 }) },
    { label: '.startOf("day")',                                             dt: base.startOf('day') },
    { label: '.endOf("day")',                                               dt: base.endOf('day') },
    { label: '.startOf("week")',                                            dt: base.startOf('week') },
    { label: '.endOf("week")',                                              dt: base.endOf('week') },
    { label: '.startOf("month")',                                           dt: base.startOf('month') },
    { label: '.endOf("month")',                                             dt: base.endOf('month') },
    { label: '.startOf("year")',                                            dt: base.startOf('year') },
    { label: '.endOf("year")',                                              dt: base.endOf('year') },
    { label: '.toUTC()',                                                    dt: base.toUTC() },
    { label: ".setTimezone('America/New_York')",                           dt: base.setTimezone('America/New_York') },
    { label: ".setTimezone('Asia/Tokyo', { keepLocalTime: true })",        dt: base.setTimezone('Asia/Tokyo', { keepLocalTime: true }) },
    { label: '.set({ hour: 0, minute: 0, second: 0 })',                    dt: base.set({ hour: 0, minute: 0, second: 0 }) },
    { label: '.set({ month: 1, day: 1 })',                                 dt: base.set({ month: 1, day: 1 }) },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {ops.map(({ label, dt }, i) => (
        <div key={label} style={{
          background: '#0a0f1e',
          borderLeft: `3px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`,
          borderRadius: '0 8px 8px 0', padding: '0.6rem 0.9rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        }}>
          <code style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace' }}>{label}</code>
          <span style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length], fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>
            {dt.format('YYYY-MM-DD HH:mm:ss Z')}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Timezone Explorer ────────────────────────────────────────────────────────

function TimezoneExplorer() {
  const [query, setQuery] = useState('New York')
  const [results, setResults] = useState<string[]>(['America/New_York'])
  const [selected, setSelected] = useState<string>('America/New_York')
  const [info, setInfo] = useState<{ valid: boolean; canon: string; offset: number; abbr: string; isDST: boolean; local: string; time: string } | null>(null)

  useEffect(() => {
    setResults(query.trim() ? Timezone.search(query).slice(0, 10) : [])
  }, [query])

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      setInfo({
        valid:  Timezone.isValid(selected),
        canon:  Timezone.getCanonical(selected),
        offset: Timezone.getOffset(selected, now),
        abbr:   Timezone.getAbbreviation(selected, now),
        isDST:  Timezone.isDST(selected, now),
        local:  Timezone.guessLocal(),
        time:   DateTime.now(selected).format('HH:mm:ss'),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [selected])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Search Timezones (568 IANA zones)</div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pacific, America, Asia/T…"
            style={{
              width: '100%', padding: '0.65rem 0.8rem', background: '#0a0f1e',
              border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.9rem',
            }}
          />
        </div>
        <div style={{
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '8px', padding: '0.65rem 0.9rem',
          color: '#a78bfa', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap',
        }}>
          🌍 Local: {info?.local ?? '—'}
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {results.map(tz => (
            <button
              key={tz} type="button" onClick={() => setSelected(tz)}
              style={{
                padding: '0.3rem 0.65rem', borderRadius: '5px', cursor: 'pointer',
                fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid #1e293b',
                background: selected === tz ? '#6366f1' : '#0a0f1e',
                color: selected === tz ? 'white' : '#64748b',
                fontWeight: 600,
              }}
            >{tz}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: '0.75rem' }}>
        {[
          { l: 'Timezone',      v: selected,                   c: '#e2e8f0' },
          { l: 'Valid',         v: info ? (info.valid ? '✅ Yes' : '❌ No') : '—', c: info?.valid ? '#10b981' : '#ef4444' },
          { l: 'Canonical',     v: info?.canon ?? '—',                 c: '#f59e0b' },
          { l: 'UTC Offset',    v: info ? fmtOffset(info.offset) : '—', c: '#06b6d4' },
          { l: 'Abbreviation',  v: info?.abbr ?? '—',                  c: '#a78bfa' },
          { l: 'DST Active',    v: info ? (info.isDST ? '🌞 Yes' : '❄️  No') : '—', c: info?.isDST ? '#fbbf24' : '#94a3b8' },
          { l: 'Current Time',  v: info?.time ?? '—',                  c: '#34d399' },
          { l: 'Offset (mins)', v: info ? String(info.offset) : '—',  c: '#fb923c' },
        ].map(({ l, v, c }) => (
          <Chip key={l} label={l} value={v} color={c} />
        ))}
      </div>
    </div>
  )
}

// ─── Duration Workshop ────────────────────────────────────────────────────────

function DurationWorkshop() {
  const [years,   setYears]   = useState(0)
  const [months,  setMonths]  = useState(0)
  const [days,    setDays]    = useState(3)
  const [hours,   setHours]   = useState(14)
  const [minutes, setMinutes] = useState(30)
  const [seconds, setSeconds] = useState(0)

  const dur  = Duration.fromObject({ years, months, days, hours, minutes, seconds })
  const neg  = dur.negate()
  const iso  = Duration.fromISO('P1DT6H30M')
  const ms   = Duration.fromMilliseconds(9_000_000)

  const numStyle: React.CSSProperties = {
    width: '100%', padding: '0.55rem', background: '#0a0f1e',
    border: '1px solid #1e293b', borderRadius: '6px', color: '#e2e8f0',
    fontSize: '0.9rem', textAlign: 'center',
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Years',   val: years,   set: setYears },
          { label: 'Months',  val: months,  set: setMonths },
          { label: 'Days',    val: days,    set: setDays },
          { label: 'Hours',   val: hours,   set: setHours },
          { label: 'Minutes', val: minutes, set: setMinutes },
          { label: 'Seconds', val: seconds, set: setSeconds },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', textAlign: 'center' }}>{label}</div>
            <input type="number" min={0} value={val} onChange={e => set(Number(e.target.value))} style={numStyle} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { l: 'humanize()',                    v: dur.humanize(),                       c: '#10b981' },
          { l: 'humanize({ short: true })',     v: dur.humanize({ short: true }),        c: '#06b6d4' },
          { l: 'humanize({ largest: 2 })',      v: dur.humanize({ largest: 2 }),         c: '#f59e0b' },
          { l: 'toISO()',                        v: dur.toISO(),                          c: '#a78bfa' },
          { l: "format('H[h] m[m] s[s]')",      v: dur.format('H[h] m[m] s[s]'),        c: '#ec4899' },
          { l: "format('HH:mm:ss')",            v: dur.format('HH:mm:ss'),              c: '#fb923c' },
          { l: 'totalHours',                    v: dur.totalHours.toFixed(4),            c: '#34d399' },
          { l: 'totalMinutes',                  v: dur.totalMinutes.toFixed(0),          c: '#60a5fa' },
          { l: 'totalSeconds',                  v: dur.totalSeconds.toFixed(0),          c: '#f472b6' },
          { l: 'totalMilliseconds',             v: dur.totalMilliseconds.toFixed(0),     c: '#fbbf24' },
          { l: 'isZero()',                       v: String(dur.isZero()),                 c: '#94a3b8' },
          { l: 'isNegative()',                   v: String(dur.isNegative()),             c: '#94a3b8' },
          { l: 'negate().humanize()',           v: neg.humanize(),                       c: '#ef4444' },
          { l: "fromISO('P1DT6H30M').humanize()", v: iso.humanize(),                    c: '#3b82f6' },
          { l: 'fromMilliseconds(9_000_000)',   v: ms.humanize(),                        c: '#8b5cf6' },
        ].map(({ l, v, c }) => (
          <Chip key={l} label={l} value={v} color={c} />
        ))}
      </div>
    </div>
  )
}

// ─── Relative Time ────────────────────────────────────────────────────────────

function RelativeTimeDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const now = DateTime.now()
  const cases = [
    { label: '30 seconds ago',  dt: now.subtract({ seconds: 30 }) },
    { label: '5 minutes ago',   dt: now.subtract({ minutes: 5 }) },
    { label: '3 hours ago',     dt: now.subtract({ hours: 3 }) },
    { label: 'Yesterday',       dt: now.subtract({ days: 1 }) },
    { label: '4 days ago',      dt: now.subtract({ days: 4 }) },
    { label: '1 week ago',      dt: now.subtract({ weeks: 1 }) },
    { label: '3 months ago',    dt: now.subtract({ months: 3 }) },
    { label: '2 years ago',     dt: now.subtract({ years: 2 }) },
    { label: 'In 45 seconds',   dt: now.add({ seconds: 45 }) },
    { label: 'In 20 minutes',   dt: now.add({ minutes: 20 }) },
    { label: 'In 5 hours',      dt: now.add({ hours: 5 }) },
    { label: 'Tomorrow',        dt: now.add({ days: 1 }) },
    { label: 'In 5 days',       dt: now.add({ days: 5 }) },
    { label: 'Next week',       dt: now.add({ weeks: 1 }) },
    { label: 'Next month',      dt: now.add({ months: 1 }) },
    { label: 'Next year',       dt: now.add({ years: 1 }) },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '0.75rem' }}>
      {cases.map(({ label, dt }) => (
        <div key={label} style={{
          background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '10px', padding: '0.9rem',
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>{label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {[
              { k: 'fromNow()',              v: dt.fromNow(),               c: '#10b981' },
              { k: 'fromNow({ short:true })', v: dt.fromNow({ short: true }), c: '#06b6d4' },
              { k: 'toRelative()',           v: dt.toRelative(),            c: '#a78bfa' },
            ].map(({ k, v, c }) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <code style={{ color: '#334155', fontSize: '0.65rem', fontFamily: 'monospace' }}>{k}</code>
                <span style={{ color: c, fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── LocalDate & LocalTime ────────────────────────────────────────────────────

function LocalTypes() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const today = LocalDate.today()
  const now   = LocalTime.now()

  const dateRows = [
    { c: 'LocalDate.today()',                            v: today.toISO() },
    { c: '.format("dddd, MMMM D YYYY")',                 v: today.format('dddd, MMMM D YYYY') },
    { c: '.dayOfYear',                                   v: String(today.dayOfYear) },
    { c: '.daysInMonth',                                 v: String(today.daysInMonth) },
    { c: '.isLeapYear',                                  v: String(today.isLeapYear) },
    { c: '.quarter',                                     v: String(today.quarter) },
    { c: '.weekday  // 1=Mon 7=Sun',                     v: String(today.weekday) },
    { c: 'month start: LocalDate.of(y, m, 1)',            v: LocalDate.of(today.year, today.month, 1).toISO() },
    { c: 'month end:   LocalDate.of(y, m, daysInMonth)', v: LocalDate.of(today.year, today.month, today.daysInMonth).toISO() },
    { c: 'year start:  LocalDate.of(y, 1, 1)',           v: LocalDate.of(today.year, 1, 1).toISO() },
    { c: '.add({ months: 1 })',                          v: today.add({ months: 1 }).toISO() },
    { c: '.subtract({ days: 30 })',                      v: today.subtract({ days: 30 }).toISO() },
    { c: '.isBefore(today.add({ days: 1 }))',            v: String(today.isBefore(today.add({ days: 1 }))) },
    { c: '.equals(LocalDate.today())',                   v: String(today.equals(LocalDate.today())) },
    { c: ".until(today.add({ days: 30 })) days",        v: String(today.until(today.add({ days: 30 }))) + ' days' },
    { c: "LocalDate.of(2024, 2, 29).toISO()",           v: LocalDate.of(2024, 2, 29).toISO() },
    { c: "LocalDate.fromISO('2000-01-01').isLeapYear",   v: String(LocalDate.fromISO('2000-01-01').isLeapYear) },
  ]

  const timeRows = [
    { c: 'LocalTime.now()',               v: now.toISO() },
    { c: '.format("h:mm:ss A")',          v: now.format('h:mm:ss A') },
    { c: '.format("HH:mm")',              v: now.format('HH:mm') },
    { c: '.hour / .minute / .second',    v: `${now.hour} / ${now.minute} / ${now.second}` },
    { c: '.add({ hours: 6 })',           v: now.add({ hours: 6 }).format('HH:mm:ss') },
    { c: '.subtract({ minutes: 45 })',   v: now.subtract({ minutes: 45 }).format('HH:mm:ss') },
    { c: "LocalTime.of(9, 0)",           v: LocalTime.of(9, 0).toISO() },
    { c: "LocalTime.of(23, 59, 59)",     v: LocalTime.of(23, 59, 59).format('h:mm:ss A') },
    { c: "LocalTime.fromISO('00:00')",   v: LocalTime.fromISO('00:00').format('h:mm A') },
    { c: "LocalTime.fromISO('13:30')",   v: LocalTime.fromISO('13:30').format('h:mm A') },
    { c: '.isBefore(LocalTime.of(23,59))', v: String(now.isBefore(LocalTime.of(23, 59))) },
    { c: "add wraps at midnight: LocalTime.of(22,0).add({hours:3})", v: LocalTime.of(22, 0).add({ hours: 3 }).format('HH:mm') },
  ]

  const rowStyle = (color: string) => ({
    background: '#0a0f1e', borderRadius: '7px', padding: '0.5rem 0.7rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
    borderLeft: `2px solid ${color}`,
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <h3 style={{ color: '#f59e0b', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>📅 LocalDate</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {dateRows.map(({ c, v }) => (
            <div key={c} style={rowStyle('#f59e0b')}>
              <code style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace' }}>{c}</code>
              <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{ color: '#ec4899', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>🕐 LocalTime</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {timeRows.map(({ c, v }) => (
            <div key={c} style={rowStyle('#ec4899')}>
              <code style={{ color: '#475569', fontSize: '0.65rem', fontFamily: 'monospace' }}>{c}</code>
              <span style={{ color: '#ec4899', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Multi-Locale ─────────────────────────────────────────────────────────────

function MultiLocaleShowcase() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const ref = DateTime.fromObject({ year: 2025, month: 6, day: 15, hour: 14, minute: 30 }, { timezone: 'UTC' })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: '0.75rem' }}>
      {ALL_LOCALES.map(({ locale, name, flag, code }, i) => {
        const dt = ref.setLocale(locale)
        return (
          <div key={code} style={{
            background: '#0a0f1e', borderRadius: '10px', padding: '0.9rem',
            border: `1px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}22`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{flag}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                <code style={{ color: '#334155', fontSize: '0.62rem' }}>{locale.name}</code>
              </div>
            </div>
            <div style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length], fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.2rem' }}>
              {dt.toLocaleDateString()}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.73rem', fontFamily: 'monospace', marginBottom: '0.15rem' }}>
              {dt.toLocaleString({ weekday: 'long' })}
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>
              {dt.subtract({ days: 3 }).fromNow()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Comparisons ──────────────────────────────────────────────────────────────

function ComparisonsDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const now         = DateTime.now()
  const past2h      = now.subtract({ hours: 2 })
  const future2h    = now.add({ hours: 2 })
  const rangeStart  = now.subtract({ hours: 3 })
  const rangeEnd    = now.add({ hours: 3 })
  const sameDayPast = now.subtract({ hours: now.hour })  // start of today

  const diff = future2h.diff(past2h)

  const rows: { expr: string; result: string }[] = [
    { expr: 'past2h.isBefore(now)',                      result: String(past2h.isBefore(now)) },
    { expr: 'future2h.isBefore(now)',                    result: String(future2h.isBefore(now)) },
    { expr: 'past2h.isAfter(now)',                       result: String(past2h.isAfter(now)) },
    { expr: 'future2h.isAfter(now)',                     result: String(future2h.isAfter(now)) },
    { expr: 'now.isSameOrBefore(future2h)',              result: String(now.isSameOrBefore(future2h)) },
    { expr: 'now.isSameOrAfter(past2h)',                 result: String(now.isSameOrAfter(past2h)) },
    { expr: 'now.isBetween(rangeStart, rangeEnd)',       result: String(now.isBetween(rangeStart, rangeEnd)) },
    { expr: 'future2h.isBetween(rangeStart, rangeEnd)',  result: String(future2h.isBetween(rangeStart, rangeEnd)) },
    { expr: 'now.isSame(now)',                           result: String(now.isSame(now)) },
    { expr: "now.isSame(sameDayPast, 'day')",            result: String(now.isSame(sameDayPast, 'day')) },
    { expr: "now.isSame(past2h, 'day')",                 result: String(now.isSame(past2h, 'day')) },
    { expr: 'future2h.diff(past2h).humanize()',          result: diff.humanize() },
    { expr: 'future2h.diff(past2h).totalHours + "h"',   result: diff.totalHours.toFixed(2) + 'h' },
    { expr: 'DateTime.min(past2h, now, future2h).toISO()',   result: DateTime.min(past2h, now, future2h).format('HH:mm:ss') },
    { expr: 'DateTime.max(past2h, now, future2h).toISO()',   result: DateTime.max(past2h, now, future2h).format('HH:mm:ss') },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '0.6rem' }}>
      {rows.map(({ expr, result }) => {
        const isBool = result === 'true' || result === 'false'
        const color  = isBool
          ? (result === 'true' ? '#10b981' : '#ef4444')
          : '#f59e0b'
        return (
          <div key={expr} style={{
            background: '#0a0f1e',
            border: `1px solid ${isBool ? (result === 'true' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(245,158,11,0.15)'}`,
            borderRadius: '8px', padding: '0.8rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
          }}>
            <code style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace' }}>{expr}</code>
            <span style={{ color, fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 800, flexShrink: 0 }}>{result}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Duration Arithmetic ──────────────────────────────────────────────────────

function DurationArithmeticDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const a   = Duration.fromObject({ hours: 3, minutes: 30 })
  const b   = Duration.fromObject({ hours: 1, minutes: 45 })
  const c   = Duration.fromObject({ days: 2, hours: 4 })
  const neg = Duration.fromISO('-PT2H30M')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '0.75rem' }}>
      {([
        { l: 'a  = fromObject({ hours:3, minutes:30 })',   v: a.humanize(),                     c: '#a78bfa' },
        { l: 'b  = fromObject({ hours:1, minutes:45 })',   v: b.humanize(),                     c: '#a78bfa' },
        { l: 'c  = fromObject({ days:2, hours:4 })',       v: c.humanize(),                     c: '#a78bfa' },
        { l: 'a.add(b).humanize()',                        v: a.add(b).humanize(),              c: '#10b981' },
        { l: 'a.add(b).toISO()',                           v: a.add(b).toISO(),                 c: '#06b6d4' },
        { l: 'a.add(c).humanize()',                        v: a.add(c).humanize(),              c: '#10b981' },
        { l: 'c.subtract(b).humanize()',                   v: c.subtract(b).humanize(),         c: '#f59e0b' },
        { l: 'a.subtract(b).humanize()',                   v: a.subtract(b).humanize(),         c: '#f59e0b' },
        { l: 'a.subtract(b).toISO()',                      v: a.subtract(b).toISO(),            c: '#f59e0b' },
        { l: 'a.add(b).totalDays',                         v: a.add(b).totalDays.toFixed(6),    c: '#ec4899' },
        { l: 'c.totalDays',                                v: c.totalDays.toFixed(4),           c: '#ec4899' },
        { l: "Duration.fromISO('-PT2H30M').isNegative()", v: String(neg.isNegative()),          c: '#ef4444' },
        { l: 'neg.abs().humanize()',                       v: neg.abs().humanize(),             c: '#34d399' },
        { l: 'neg.abs().toISO()',                          v: neg.abs().toISO(),                c: '#34d399' },
        { l: 'neg.abs().totalHours',                       v: neg.abs().totalHours.toFixed(4),  c: '#60a5fa' },
        { l: 'a.add(b).add(c).humanize()',                 v: a.add(b).add(c).humanize(),       c: '#fb923c' },
      ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
        <Chip key={l} label={l} value={v} color={c} />
      ))}
    </div>
  )
}

// ─── Relative Between ─────────────────────────────────────────────────────────

function RelativeBetweenDemo() {
  const [mounted, setMounted] = useState(false)
  const [dtAStr, setDtAStr]   = useState('')
  const [dtBStr, setDtBStr]   = useState('')

  useEffect(() => {
    setMounted(true)
    const n = DateTime.now()
    setDtAStr(n.subtract({ days: 3 }).format('YYYY-MM-DDTHH:mm'))
    setDtBStr(n.add({ days: 7 }).format('YYYY-MM-DDTHH:mm'))
  }, [])

  if (!mounted || !dtAStr || !dtBStr) return null

  const dtA = DateTime.fromISO(dtAStr + ':00')
  const dtB = DateTime.fromISO(dtBStr + ':00')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.55rem 0.75rem', background: '#0a0f1e',
    border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.85rem',
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Date A</div>
          <input type="datetime-local" value={dtAStr} onChange={e => setDtAStr(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Date B</div>
          <input type="datetime-local" value={dtBStr} onChange={e => setDtBStr(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '0.75rem' }}>
        {([
          { l: 'a.fromNow()',                 v: dtA.fromNow(),                c: '#10b981' },
          { l: 'a.fromNow({ short: true })',  v: dtA.fromNow({ short: true }), c: '#06b6d4' },
          { l: 'b.fromNow()',                 v: dtB.fromNow(),                c: '#10b981' },
          { l: 'b.fromNow({ short: true })',  v: dtB.fromNow({ short: true }), c: '#06b6d4' },
          { l: 'a.toNow()',                   v: dtA.toNow(),                  c: '#f59e0b' },
          { l: 'a.toNow({ short: true })',    v: dtA.toNow({ short: true }),   c: '#fb923c' },
          { l: 'b.toNow()',                   v: dtB.toNow(),                  c: '#f59e0b' },
          { l: 'b.toNow({ short: true })',    v: dtB.toNow({ short: true }),   c: '#fb923c' },
          { l: 'a.to(b)',                     v: dtA.to(dtB),                  c: '#a78bfa' },
          { l: 'a.to(b, { short: true })',    v: dtA.to(dtB, { short: true }), c: '#8b5cf6' },
          { l: 'b.to(a)',                     v: dtB.to(dtA),                  c: '#a78bfa' },
          { l: 'b.to(a, { short: true })',    v: dtB.to(dtA, { short: true }), c: '#8b5cf6' },
        ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
          <Chip key={l} label={l} value={v} color={c} />
        ))}
      </div>
    </div>
  )
}

// ─── DateTime Conversions ─────────────────────────────────────────────────────

function DateTimeConversionsDemo() {
  const [mounted, setMounted] = useState(false)
  const [yr, setYr] = useState(2025)
  const [mo, setMo] = useState(6)
  const [dy, setDy] = useState(15)
  const [hr, setHr] = useState(14)
  const [mn, setMn] = useState(30)

  useEffect(() => {
    setMounted(true)
    const n = DateTime.now('America/New_York')
    setYr(n.year); setMo(n.month); setDy(n.day); setHr(n.hour); setMn(n.minute)
  }, [])

  if (!mounted) return null

  const base    = DateTime.fromObject({ year: yr, month: mo, day: dy, hour: hr, minute: mn, second: 0 }, { timezone: 'America/New_York' })
  const asJSDate = base.toDate()
  const asLocal  = base.toLocal()
  const asUTC    = base.toUTC()

  const numStyle: React.CSSProperties = {
    width: '100%', padding: '0.45rem', background: '#0a0f1e',
    border: '1px solid #1e293b', borderRadius: '6px', color: '#e2e8f0',
    fontSize: '0.85rem', textAlign: 'center',
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {([
          { l: 'Year',   v: yr, set: setYr, min: 1900, max: 2099 },
          { l: 'Month',  v: mo, set: setMo, min: 1,    max: 12   },
          { l: 'Day',    v: dy, set: setDy, min: 1,    max: 31   },
          { l: 'Hour',   v: hr, set: setHr, min: 0,    max: 23   },
          { l: 'Minute', v: mn, set: setMn, min: 0,    max: 59   },
        ] as { l: string; v: number; set: (n: number) => void; min: number; max: number }[]).map(({ l, v, set, min, max }) => (
          <div key={l}>
            <div style={{ color: '#64748b', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', textAlign: 'center' }}>{l}</div>
            <input type="number" min={min} max={max} value={v} onChange={e => set(Number(e.target.value))} style={numStyle} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '0.75rem' }}>
        {([
          { l: 'base.toISO()',                               v: base.toISO(),                                         c: '#a78bfa' },
          { l: 'base.toUTC().toISO()',                       v: asUTC.toISO(),                                        c: '#06b6d4' },
          { l: 'base.toLocal().timezone',                    v: asLocal.timezone,                                     c: '#10b981' },
          { l: 'base.toLocal().toISO()',                     v: asLocal.toISO(),                                      c: '#34d399' },
          { l: 'base.toDate().toISOString()',                v: asJSDate.toISOString(),                               c: '#f59e0b' },
          { l: 'base.valueOf()',                             v: base.valueOf().toString(),                            c: '#fb923c' },
          { l: 'base.locale',                               v: JSON.stringify(base.locale),                         c: '#ec4899' },
          { l: 'base.setYear(2030).year',                   v: String(base.setYear(2030).year),                     c: '#60a5fa' },
          { l: 'base.setMonth(1).toISO().slice(0,10)',       v: base.setMonth(1).toISO().slice(0, 10),               c: '#818cf8' },
          { l: 'base.setDay(1).toISO().slice(0,10)',         v: base.setDay(1).toISO().slice(0, 10),                 c: '#818cf8' },
          { l: 'base.setTime(9, 0).format("HH:mm")',                v: base.setTime(9, 0).format('HH:mm'),                  c: '#f472b6' },
          { l: 'base.setYear(2000).setMonth(1).setDay(1)',  v: base.setYear(2000).setMonth(1).setDay(1).toISO().slice(0, 10), c: '#fbbf24' },
        ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
          <Chip key={l} label={l} value={v} color={c} />
        ))}
      </div>
    </div>
  )
}

// ─── LocalDate & LocalTime Extended ───────────────────────────────────────────

function LocalExtendedDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const today   = LocalDate.today()
  const dt      = DateTime.now('America/New_York')
  const fromObj = LocalDate.fromObject({ year: 2025, month: 3, day: 14 })
  const fromDt  = LocalDate.fromDateTime(dt)
  const dateA   = LocalDate.of(today.year, 1, 15)
  const dateB   = LocalDate.of(today.year, 6, 1)
  const dateC   = LocalDate.of(today.year, 12, 31)

  const nowTime     = LocalTime.now()
  const timeFromObj = LocalTime.fromObject({ hour: 14, minute: 30, second: 45 })
  const timeFromDt  = LocalTime.fromDateTime(dt)
  const midnight    = LocalTime.of(0, 0, 0)
  const noon        = LocalTime.of(12, 0, 0)

  const subHead = (label: string) => (
    <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>{label}</div>
  )

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        {subHead('LocalDate — fromObject, fromDateTime, min, max, extended comparisons')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '0.65rem' }}>
          {([
            { l: "LocalDate.fromObject({ year:2025, month:3, day:14 }).toISO()",    v: fromObj.toISO(),                              c: '#f59e0b' },
            { l: 'LocalDate.fromDateTime(DateTime.now()).toISO()',                   v: fromDt.toISO(),                               c: '#fb923c' },
            { l: 'LocalDate.min(dateA, dateB, dateC).toISO()',                      v: LocalDate.min(dateA, dateB, dateC).toISO(),   c: '#10b981' },
            { l: 'LocalDate.max(dateA, dateB, dateC).toISO()',                      v: LocalDate.max(dateA, dateB, dateC).toISO(),   c: '#34d399' },
            { l: 'dateA.isAfter(today)',                                             v: String(dateA.isAfter(today)),                 c: '#a78bfa' },
            { l: 'dateC.isAfter(today)',                                             v: String(dateC.isAfter(today)),                 c: '#a78bfa' },
            { l: 'dateA.isSameOrBefore(today)',                                      v: String(dateA.isSameOrBefore(today)),          c: '#8b5cf6' },
            { l: 'dateC.isSameOrAfter(today)',                                       v: String(dateC.isSameOrAfter(today)),           c: '#8b5cf6' },
            { l: 'today.isBetween(dateA, dateC)',                                    v: String(today.isBetween(dateA, dateC)),        c: '#ec4899' },
            { l: "today.toDateTime('UTC', { hour:9 }).format('YYYY-MM-DD HH:mm')",  v: today.toDateTime('UTC', { hour: 9 }).format('YYYY-MM-DD HH:mm'), c: '#06b6d4' },
            { l: 'dateA.compareTo(dateB)',                                           v: String(dateA.compareTo(dateB)),               c: '#f59e0b' },
            { l: 'dateC.compareTo(dateA)',                                           v: String(dateC.compareTo(dateA)),               c: '#fb923c' },
            { l: 'today.isToday()',                                                  v: String(today.isToday()),                      c: '#10b981' },
            { l: 'today.isToday("UTC")',                                             v: String(today.isToday('UTC')),                 c: '#34d399' },
            { l: 'today.isWeekend()',                                                v: String(today.isWeekend()),                    c: '#f472b6' },
            { l: 'today.isWeekday()',                                                v: String(today.isWeekday()),                    c: '#ec4899' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
      <div>
        {subHead('LocalTime — fromObject, fromDateTime, millisecondOfDay, extended comparisons')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '0.65rem' }}>
          {([
            { l: "LocalTime.fromObject({ hour:14, minute:30, second:45 }).toISO()",   v: timeFromObj.toISO(),                                          c: '#f59e0b' },
            { l: 'LocalTime.fromDateTime(DateTime.now()).toISO()',                     v: timeFromDt.toISO(),                                           c: '#fb923c' },
            { l: 'LocalTime.of(0,0,0).millisecondOfDay',                              v: String(midnight.millisecondOfDay),                            c: '#10b981' },
            { l: 'LocalTime.of(12,0,0).millisecondOfDay',                             v: String(noon.millisecondOfDay),                                c: '#34d399' },
            { l: 'LocalTime.now().millisecondOfDay',                                  v: String(nowTime.millisecondOfDay),                             c: '#06b6d4' },
            { l: 'timeFromObj.equals(LocalTime.of(14,30,45))',                        v: String(timeFromObj.equals(LocalTime.of(14, 30, 45))),         c: '#a78bfa' },
            { l: 'timeFromObj.isAfter(midnight)',                                      v: String(timeFromObj.isAfter(midnight)),                        c: '#8b5cf6' },
            { l: 'midnight.isSameOrBefore(noon)',                                      v: String(midnight.isSameOrBefore(noon)),               c: '#ec4899' },
            { l: 'noon.isSameOrAfter(midnight)',                                       v: String(noon.isSameOrAfter(midnight)),                c: '#f472b6' },
            { l: 'nowTime.isBetween(midnight, noon)',                                  v: String(nowTime.isBetween(midnight, noon)),           c: '#fb923c' },
            { l: 'nowTime.compareTo(midnight)',                                         v: String(nowTime.compareTo(midnight)),                 c: '#a78bfa' },
            { l: 'midnight.compareTo(noon)',                                            v: String(midnight.compareTo(noon)),                    c: '#8b5cf6' },
            { l: 'noon.compareTo(noon)',                                                v: String(noon.compareTo(noon)),                        c: '#6366f1' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── v0.3.0 — Convenience Methods + Locale-Aware Formatting ─────────────────

function DateTimeConvenienceDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const now       = DateTime.now('America/New_York')
  const tomorrow  = now.add({ days: 1 })
  const yesterday = now.subtract({ days: 1 })
  const future    = DateTime.fromISO('2030-06-15T12:00:00Z', { timezone: 'UTC' })
  const minDt     = DateTime.fromISO('2025-01-01T00:00:00Z', { timezone: 'UTC' })
  const maxDt     = DateTime.fromISO('2027-12-31T23:59:59Z', { timezone: 'UTC' })
  const clamped   = future.clamp(minDt, maxDt)

  const todayLD    = LocalDate.today()
  const tomorrowLD = todayLD.add({ days: 1 })
  const pastLD     = LocalDate.of(todayLD.year - 1, 6, 15)

  const nowTime  = LocalTime.now()
  const morning  = LocalTime.of(9, 0)
  const evening  = LocalTime.of(18, 0)

  const dtDe   = now.setLocale(de)
  const dtJa   = now.setLocale(ja)
  const dtAr   = now.setLocale(ar)
  const dtFr   = now.setLocale(fr)
  const dtHi   = now.setLocale(hi)
  const dtZhHans = now.setLocale(zh_Hans)

  const subHead = (label: string) => (
    <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>{label}</div>
  )

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      <div>
        {subHead('DateTime — compareTo · isBetween · clamp · weeksInYear')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '0.65rem' }}>
          {([
            { l: 'now.compareTo(tomorrow)',              v: String(now.compareTo(tomorrow)),              c: '#f59e0b' },
            { l: 'tomorrow.compareTo(now)',              v: String(tomorrow.compareTo(now)),              c: '#fb923c' },
            { l: 'now.compareTo(now)',                   v: String(now.compareTo(DateTime.now('America/New_York'))), c: '#a78bfa' },
            { l: 'now.isBetween(yesterday, tomorrow)',   v: String(now.isBetween(yesterday, tomorrow)),   c: '#10b981' },
            { l: 'future.isBetween(yesterday, tomorrow)',v: String(future.isBetween(yesterday, tomorrow)),c: '#34d399' },
            { l: 'future.clamp(minDt, maxDt) — year',   v: clamped.toISO().slice(0, 10),                 c: '#06b6d4' },
            { l: 'now.weeksInYear',                      v: String(now.weeksInYear),                      c: '#60a5fa' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
      <div>
        {subHead('DateTime — calendar predicates (evaluated in instance timezone)')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '0.65rem' }}>
          {([
            { l: 'now.isToday()',          v: String(now.isToday()),          c: '#a78bfa' },
            { l: 'now.isTomorrow()',       v: String(now.isTomorrow()),       c: '#8b5cf6' },
            { l: 'now.isYesterday()',      v: String(now.isYesterday()),      c: '#7c3aed' },
            { l: 'now.isWeekend()',        v: String(now.isWeekend()),        c: '#ec4899' },
            { l: 'now.isWeekday()',        v: String(now.isWeekday()),        c: '#f472b6' },
            { l: 'tomorrow.isToday()',     v: String(tomorrow.isToday()),     c: '#64748b' },
            { l: 'tomorrow.isTomorrow()',  v: String(tomorrow.isTomorrow()),  c: '#10b981' },
            { l: 'yesterday.isYesterday()',v: String(yesterday.isYesterday()),c: '#34d399' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
      <div>
        {subHead('LocalDate — compareTo · isToday · isWeekend · isWeekday')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '0.65rem' }}>
          {([
            { l: 'todayLD.compareTo(tomorrowLD)',  v: String(todayLD.compareTo(tomorrowLD)),  c: '#f59e0b' },
            { l: 'tomorrowLD.compareTo(todayLD)', v: String(tomorrowLD.compareTo(todayLD)),   c: '#fb923c' },
            { l: 'todayLD.compareTo(todayLD)',     v: String(todayLD.compareTo(todayLD)),      c: '#a78bfa' },
            { l: 'todayLD.isToday()',              v: String(todayLD.isToday()),               c: '#10b981' },
            { l: 'todayLD.isToday("UTC")',         v: String(todayLD.isToday('UTC')),          c: '#34d399' },
            { l: 'pastLD.isToday()',               v: String(pastLD.isToday()),                c: '#64748b' },
            { l: 'todayLD.isWeekend()',            v: String(todayLD.isWeekend()),             c: '#ec4899' },
            { l: 'todayLD.isWeekday()',            v: String(todayLD.isWeekday()),             c: '#f472b6' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
      <div>
        {subHead('LocalTime — compareTo · isBetween')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '0.65rem' }}>
          {([
            { l: 'nowTime.compareTo(morning)',          v: String(nowTime.compareTo(morning)),          c: '#f59e0b' },
            { l: 'nowTime.compareTo(evening)',          v: String(nowTime.compareTo(evening)),          c: '#fb923c' },
            { l: 'morning.compareTo(morning)',          v: String(morning.compareTo(morning)),          c: '#a78bfa' },
            { l: 'nowTime.isBetween(morning, evening)', v: String(nowTime.isBetween(morning, evening)), c: '#10b981' },
            { l: 'morning.isBetween(morning, evening)', v: String(morning.isBetween(morning, evening)), c: '#34d399' },
            { l: 'evening.isBetween(morning, evening)', v: String(evening.isBetween(morning, evening)), c: '#06b6d4' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
      <div>
        {subHead('v0.3.0 — toLocaleDateString · toLocaleString · formatLocalized')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '0.65rem' }}>
          {([
            { l: 'dt.setLocale(de).toLocaleDateString()',               v: dtDe.toLocaleDateString(),                        c: '#a78bfa' },
            { l: "dt.setLocale(de).toLocaleDateString({ dateStyle: 'full' })", v: dtDe.toLocaleDateString({ dateStyle: 'full' }),  c: '#8b5cf6' },
            { l: 'dt.setLocale(ja).toLocaleDateString()',               v: dtJa.toLocaleDateString(),                        c: '#06b6d4' },
            { l: 'dt.setLocale(ar).toLocaleDateString()',               v: dtAr.toLocaleDateString(),                        c: '#10b981' },
            { l: "dt.setLocale(fr).toLocaleDateString({ dateStyle: 'full' })", v: dtFr.toLocaleDateString({ dateStyle: 'full' }),  c: '#34d399' },
            { l: 'dt.setLocale(hi).toLocaleDateString()',               v: dtHi.toLocaleDateString(),                        c: '#f59e0b' },
            { l: 'dt.setLocale(zh_Hans).toLocaleDateString()',          v: dtZhHans.toLocaleDateString(),                    c: '#fb923c' },
            { l: "dt.setLocale(ar).toLocaleString({ timeStyle: 'short' })", v: dtAr.toLocaleString({ timeStyle: 'short' }), c: '#ec4899' },
            { l: "dt.setLocale(de).toLocaleTimeString()",               v: dtDe.toLocaleTimeString(),                        c: '#f472b6' },
            { l: "dt.setLocale(de).formatLocalized('long')",            v: dtDe.formatLocalized('long'),                     c: '#60a5fa' },
            { l: "dt.setLocale(ja).formatLocalized('full')",            v: dtJa.formatLocalized('full'),                     c: '#38bdf8' },
          ] as { l: string; v: string; c: string }[]).map(({ l, v, c }) => (
            <Chip key={l} label={l} value={v} color={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TZDATA Constants ─────────────────────────────────────────────────────────

function TzdataInfoDemo() {
  const linkEntries = Object.entries(TIMEZONE_LINKS).slice(0, 12)

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '0.75rem' }}>
        <Chip label="TIMEZONE_COUNT"           value={String(TIMEZONE_COUNT)}                    color="#10b981" />
        <Chip label="TZDATA_VERSION"           value={TZDATA_VERSION}                            color="#a78bfa" />
        <Chip label="Timezone.listAll().length" value={String(Timezone.listAll().length)}         color="#06b6d4" />
        <Chip label="Object.keys(TIMEZONE_LINKS).length" value={String(Object.keys(TIMEZONE_LINKS).length)} color="#f59e0b" />
      </div>
      <div>
        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          TIMEZONE_LINKS sample — legacy alias → canonical IANA name
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '0.45rem' }}>
          {linkEntries.map(([alias, canonical]) => (
            <div key={alias} style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '0.77rem', flexShrink: 0 }}>{alias}</span>
              <span style={{ color: '#334155', fontSize: '0.75rem' }}>→</span>
              <span style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.77rem' }}>{canonical as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Global Locale ────────────────────────────────────────────────────────────

type LocaleKey = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ru' | 'ar' | 'ko' | 'pt' | 'it'

function GlobalLocaleDemo() {
  const [mounted, setMounted] = useState(false)
  const [active, setActive]   = useState<LocaleKey>('en')

  const LOCALE_MAP: Record<LocaleKey, Parameters<typeof setDefaultLocale>[0]> = {
    en, es, fr, de, ja, zh, ru, ar, ko, pt, it,
  }

  useEffect(() => {
    setMounted(true)
    return () => { setDefaultLocale(en) }
  }, [])

  useEffect(() => {
    if (!mounted) return
    setDefaultLocale(LOCALE_MAP[active])
  }, [active, mounted])

  if (!mounted) return null

  const now = DateTime.now('Europe/Paris')
  const currentLocaleName = getDefaultLocale()?.name ?? 'en'

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {(Object.keys(LOCALE_MAP) as LocaleKey[]).map(key => (
          <button key={key} onClick={() => setActive(key)} style={{
            padding: '0.35rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.8rem',
            background: active === key ? '#6366f1' : '#1e293b',
            color: active === key ? 'white' : '#64748b',
            transition: 'all 0.15s',
          }}>{key.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '0.75rem' }}>
        <Chip label="getDefaultLocale().name"              value={currentLocaleName}                               color="#a78bfa" />
        <Chip label="now.toLocaleDateString()"               value={now.toLocaleDateString()}                       color="#a78bfa" />
        <Chip label="now.toLocaleDateString({ dateStyle: 'full' })" value={now.toLocaleDateString({ dateStyle: 'full' })} color="#8b5cf6" />
        <Chip label="now.formatLocalized('long')"          value={now.formatLocalized('long')}                    color="#6366f1" />
        <Chip label="now.format('MMMM')"                   value={now.format('MMMM')}                             color="#10b981" />
        <Chip label="now.format('dddd')"                   value={now.format('dddd')}                             color="#06b6d4" />
        <Chip label="now.fromNow()"                        value={now.fromNow()}                                   color="#ec4899" />
        <Chip label="now.subtract({ days:7 }).fromNow()"  value={now.subtract({ days: 7 }).fromNow()}            color="#fb923c" />
        <Chip label="now.add({ months:3 }).fromNow()"     value={now.add({ months: 3 }).fromNow()}               color="#34d399" />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#1e293b', borderRadius: '16px', padding: '2rem',
      marginBottom: '1.5rem', border: '1px solid #334155',
    }}>
      {children}
    </div>
  )
}

export default function ChronoTzPage() {
  return (
    <>
      <style>{`
        html, body { background: #0f172a !important; }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(99,102,241,0.35); }
          70%  { box-shadow: 0 0 0 20px rgba(99,102,241,0);   }
          100% { box-shadow: 0 0 0 0   rgba(99,102,241,0);    }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>

      <div style={{ background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

          {/* ── Hero ── */}
          <div style={{
            background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
            borderRadius: '24px', padding: '3rem', marginBottom: '1.5rem',
            position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(99,102,241,0.25)',
            animation: 'pulse-ring 3s ease-out infinite',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(ellipse at 80% 50%,rgba(99,102,241,0.15) 0%,transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(ellipse at 20% 80%,rgba(6,182,212,0.08) 0%,transparent 50%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
                  padding: '0.3rem 0.8rem', borderRadius: '2rem', marginBottom: '1rem',
                }}>
                  <code style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700 }}>@yedoma-labs/tuuru-chrono-tz</code>
                  <span style={{ background: '#6366f1', color: 'white', padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>v0.3.0</span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, margin: '0 0 0.5rem',
                  background: 'linear-gradient(135deg,#e2e8f0 0%,#a78bfa 40%,#06b6d4 80%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', lineHeight: 1.05,
                }}>
                  tuuru-chrono-tz
                </h1>

                <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 1.5rem', maxWidth: 520 }}>
                  TypeScript-first date/time library with full IANA timezone support.
                  Immutable API. Zero dependencies. &lt;20&nbsp;KB.
                </p>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {['Zero Dependencies','Immutable API','568 IANA Zones','87 Locales','Duration Arithmetic','Relative Between','TZDATA Constants','Calendar Predicates','<20KB Bundle'].map(tag => (
                    <span key={tag} style={{
                      padding: '0.3rem 0.7rem', background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px',
                      color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '5.5rem', lineHeight: 1, animation: 'float 4s ease-in-out infinite', flexShrink: 0 }}>
                ⏰
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.85rem' }}>← All Demos</Link>
            <span style={{ color: '#1e293b' }}>·</span>
            <a href="https://www.npmjs.com/package/@yedoma-labs/tuuru-chrono-tz" target="_blank" rel="noopener noreferrer"
              style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.85rem' }}>npm ↗</a>
            <span style={{ color: '#1e293b' }}>·</span>
            <a href="https://github.com/yedoma-labs/tuuru-chrono-tz" target="_blank" rel="noopener noreferrer"
              style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem' }}>GitHub ↗</a>
          </div>

          {/* ── Sections ── */}

          <Card>
            <SectionHeader
              emoji="🌍" title="Live World Clock"
              subtitle="DateTime.now(timezone) — updates every second, timezone-aware offsets, abbreviations and DST status"
              gradient="linear-gradient(135deg,#1e3a8a,#3b82f6)"
            />
            <WorldClock />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { DateTime, Timezone } from '@yedoma-labs/tuuru-chrono-tz';

const tokyo = DateTime.now('Asia/Tokyo');
const nyc   = DateTime.now('America/New_York');

tokyo.format('HH:mm:ss');           // "19:30:00"
nyc.format('HH:mm:ss');             // "06:30:00"
nyc.offset;                         // -300 (winter) or -240 (DST)

Timezone.getAbbreviation('America/New_York');   // "EST" or "EDT"
Timezone.isDST('America/New_York', Date.now()); // true in summer
Timezone.guessLocal();                          // 'America/New_York'`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🏗️" title="DateTime Construction Lab"
              subtitle="Every factory method — fromISO, fromFormat, fromObject, fromMilliseconds, fromUnix, fromDate, min, max, plus all getters"
              gradient="linear-gradient(135deg,#4c1d95,#8b5cf6)"
            />
            <ConstructionLab />
          </Card>

          <Card>
            <SectionHeader
              emoji="🎨" title="Format Playground"
              subtitle="Type any pattern, pick a timezone, see the result live. Click tokens below to append them."
              gradient="linear-gradient(135deg,#831843,#ec4899)"
            />
            <FormatPlayground />
          </Card>

          <Card>
            <SectionHeader
              emoji="➕" title="Date Arithmetic"
              subtitle="add(), subtract(), startOf(), endOf(), set(), setTimezone() — all immutable, all calendar-aware"
              gradient="linear-gradient(135deg,#064e3b,#10b981)"
            />
            <DateArithmetic />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`const paris = DateTime.now('Europe/Paris');

paris.add({ weeks: 2 })                                  // +14 days
paris.add({ months: 3 })                                 // calendar-aware month jump
paris.subtract({ hours: 12 })                            // -12 hours (absolute)
paris.startOf('week')                                    // Monday 00:00:00.000
paris.endOf('month')                                     // last ms of the month
paris.set({ hour: 9, minute: 0, second: 0 })             // set specific fields
paris.setTimezone('Asia/Tokyo')                          // same instant, Tokyo wall clock
paris.setTimezone('Asia/Tokyo', { keepLocalTime: true }) // same wall clock, different instant
paris.toUTC()                                            // convert to UTC`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🗺️" title="Timezone Explorer"
              subtitle="Fuzzy-search all 568 IANA zones — isValid, getCanonical, getOffset, getAbbreviation, isDST, guessLocal"
              gradient="linear-gradient(135deg,#78350f,#f59e0b)"
            />
            <TimezoneExplorer />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`Timezone.search('Pacific')            // ['Pacific/Auckland', 'Pacific/Fiji', ...]
Timezone.isValid('America/New_York')   // true
Timezone.isValid('US/Eastern')         // true (alias link)
Timezone.getCanonical('US/Eastern')    // 'America/New_York'
Timezone.getOffset('Asia/Tokyo')       // 540 (minutes, east-positive)
Timezone.getOffset('America/New_York') // -300 (winter) or -240 (DST)
Timezone.getAbbreviation('Asia/Tokyo') // 'JST'
Timezone.isDST('America/New_York', Date.now()) // true in summer
Timezone.guessLocal()                  // 'America/New_York'
Timezone.listAll().length              // 568+`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="⏱️" title="Duration Workshop"
              subtitle="Adjust the fields — humanize(), format(), toISO(), totalHours, negate(), and more update live"
              gradient="linear-gradient(135deg,#0e7490,#06b6d4)"
            />
            <DurationWorkshop />
            <div style={{ marginTop: '1rem' }}>
              <CodeBlock code={`import { Duration } from '@yedoma-labs/tuuru-chrono-tz';

const dur = Duration.fromObject({ days: 3, hours: 14, minutes: 30 });
dur.humanize()                   // "3 days, 14 hours, 30 minutes"
dur.humanize({ short: true })    // "3d 14h 30m"
dur.humanize({ largest: 2 })     // "3 days, 14 hours"
dur.toISO()                      // "P3DT14H30M"
dur.format('H[h] m[m] s[s]')    // "86h 30m 0s"
dur.totalHours                   // 86.5
dur.negate().humanize()          // "-3 days, -14 hours, -30 minutes"
dur.isZero()                     // false

// Parse ISO 8601 duration strings
Duration.fromISO('P1DT6H30M').humanize()  // "1 day, 6 hours, 30 minutes"
Duration.fromISO('PT2H').toISO()          // "PT2H"

// From raw milliseconds
Duration.fromMilliseconds(9_000_000).humanize()  // "2 hours, 30 minutes"

// Diff between two DateTimes
const diff = dateB.diff(dateA);
diff.humanize()       // "5 days, 3 hours"
diff.totalHours       // 123.0`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🕐" title="Relative Time"
              subtitle="fromNow(), fromNow({ short }), toRelative() — all past & future intervals"
              gradient="linear-gradient(135deg,#312e81,#6366f1)"
            />
            <RelativeTimeDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`const past   = DateTime.now().subtract({ hours: 3 });
const future = DateTime.now().add({ days: 1 });

past.fromNow()                // "3 hours ago"
past.fromNow({ short: true }) // "3h ago"
past.toRelative()             // "today"  (same calendar day)

future.fromNow()              // "in a day"
future.toRelative()           // "tomorrow"

// Relative from one date to another
a.to(b)   // "in 3 days"
a.to(b, { short: true }) // "in 3d"`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="📅" title="LocalDate & LocalTime"
              subtitle="No timezone, no time (LocalDate) or no timezone, no date (LocalTime) — ideal for birthdays, schedules, business hours"
              gradient="linear-gradient(135deg,#78350f,#f59e0b)"
            />
            <LocalTypes />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { LocalDate, LocalTime, de, ja, ar } from '@yedoma-labs/tuuru-chrono-tz';

// LocalDate — date without time or timezone
const today = LocalDate.today();

// Locale-aware formatting (Intl — correct punctuation)
today.toLocaleString({ dateStyle: 'long' }, de)   // "15. Juni 2026"
today.toLocaleString({ dateStyle: 'full' }, de)   // "Montag, 15. Juni 2026"
today.toLocaleString({ dateStyle: 'long' }, ja)   // "2026年6月15日"
today.toLocaleString({ dateStyle: 'long' }, ar)   // "١٥ يونيو ٢٠٢٦"
today.toLocaleString()                             // system locale

// Explicit pattern (month/day names translate, structure is yours)
today.format('dddd, MMMM D, YYYY')

today.add({ months: 1 })                                  // Jan 31 + 1 month = Feb 28/29
LocalDate.of(today.year, today.month, 1).toISO()          // "2026-06-01"  (month start)
LocalDate.of(today.year, today.month, today.daysInMonth)  // month end
today.until(today.add({ days: 30 }))                      // 30 (days between)
today.toDateTime('America/New_York', { hour: 9 })         // → DateTime at 9am today in NYC

// LocalTime — time without date or timezone
const now = LocalTime.now();
now.toLocaleString({ timeStyle: 'short' }, de)   // "14:30"
now.toLocaleString({ timeStyle: 'short' }, ar)   // "٢:٣٠ م"
now.format('h:mm:ss A')                          // "2:30:45 PM"
now.add({ hours: 6 })                            // wraps past midnight

// Both support isBefore / isAfter / isBetween / isSame
today.isBefore(today.add({ days: 1 }))       // true`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🌐" title={`All ${ALL_LOCALES.length} Locales`}
              subtitle="Every shipped locale — toLocaleDateString() uses Intl for locale-correct punctuation; format() for explicit patterns; fromNow() for relative time"
              gradient="linear-gradient(135deg,#064e3b,#10b981)"
            />
            <MultiLocaleShowcase />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { DateTime, fr, ja, ar, zh, de } from '@yedoma-labs/tuuru-chrono-tz';

const dt = DateTime.now('Europe/Paris');

// ── Locale-aware formatting (Intl — correct punctuation per locale) ──────────
dt.setLocale(de).toLocaleDateString()                      // "15. Juni 2026"
dt.setLocale(de).toLocaleDateString({ dateStyle: 'full' }) // "Montag, 15. Juni 2026"
dt.setLocale(ja).toLocaleDateString()                      // "2026年6月15日"
dt.setLocale(ar).toLocaleDateString()                      // "١٥ يونيو ٢٠٢٦"
dt.setLocale(fr).toLocaleDateString({ dateStyle: 'full' }) // "lundi 15 juin 2026"

// formatLocalized — uses locale.dateFormats if defined, else Intl fallback
dt.setLocale(de).formatLocalized('long')  // "15. Juni 2026"
dt.setLocale(de).formatLocalized('full')  // "Montag, 15. Juni 2026"

// toLocaleString — full control via Intl.DateTimeFormatOptions
dt.setLocale(ar).toLocaleString({ timeStyle: 'short' })    // "١٠:٣٠ ص"
dt.setLocale(de).toLocaleString({ month: 'long', year: 'numeric' }) // "Juni 2026"

// ── Explicit pattern formatting (names are locale-aware, structure is yours) ──
dt.setLocale(fr).format('dddd D MMMM YYYY')  // "jeudi 12 juin 2025"
dt.setLocale(ja).format('MMMM D日')           // "6月12日"
dt.setLocale(de).format('dddd')              // "Donnerstag"
dt.setLocale(ar).fromNow()                   // "منذ دقائق"

// Global default (affects all instances)
DateTime.setDefaultLocale(fr);
DateTime.now().toLocaleDateString()          // "15 juin 2026"
DateTime.now().format('MMMM')               // "juin"

// Shipped: 85 locales — en zh hi es bn pt ru id ja de fr ko tr vi pl nl th it ar fa ur uk ...`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="⚖️" title="Comparisons & Diff"
              subtitle="isBefore, isAfter, isBetween, isSame, isSameOrBefore, isSameOrAfter, diff(), min(), max()"
              gradient="linear-gradient(135deg,#7f1d1d,#ef4444)"
            />
            <ComparisonsDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`const a = DateTime.now();
const b = a.add({ hours: 2 });

a.isBefore(b)                  // true
b.isAfter(a)                   // true
a.isSameOrBefore(b)            // true
a.isBetween(a.subtract({h:1}), b) // true
a.isSame(b)                    // false
a.isSame(b, 'day')             // true  (same calendar day in a's tz)

// Typed diff
const d = b.diff(a);           // Duration
d.humanize()                   // "2 hours"
d.totalMinutes                 // 120

// Static min/max
DateTime.min(a, b, c)          // earliest
DateTime.max(a, b, c)          // latest`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="➗" title="Duration Arithmetic"
              subtitle="Duration.add(), Duration.subtract(), Duration.abs(), Duration.totalDays — chain immutable duration ops"
              gradient="linear-gradient(135deg,#134e4a,#14b8a6)"
            />
            <DurationArithmeticDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { Duration } from '@yedoma-labs/tuuru-chrono-tz';

const a = Duration.fromObject({ hours: 3, minutes: 30 });
const b = Duration.fromObject({ hours: 1, minutes: 45 });
const c = Duration.fromObject({ days: 2, hours: 4 });

a.add(b).humanize()       // "5 hours, 15 minutes"
a.add(b).toISO()          // "PT5H15M"
a.add(b).totalDays        // 0.21875
c.subtract(b).humanize()  // "2 days, 2 hours, 15 minutes"
a.add(b).add(c).humanize()  // "2 days, 7 hours, 15 minutes"

// Negative durations
const neg = Duration.fromISO('-PT2H30M');
neg.isNegative()          // true
neg.abs().humanize()      // "2 hours, 30 minutes"
neg.abs().totalHours      // 2.5`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🔗" title="to() · toNow() — Relative Between Two Points"
              subtitle="a.to(b) gives time from a to b. toNow() is the inverse of fromNow(). Pick two dates and compare."
              gradient="linear-gradient(135deg,#1e1b4b,#4f46e5)"
            />
            <RelativeBetweenDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`const past   = DateTime.now().subtract({ days: 3 });
const future = DateTime.now().add({ days: 7 });

// fromNow() — time from THIS date to now
past.fromNow()               // "3 days ago"
future.fromNow()             // "in 7 days"

// toNow() — time from now to THIS date (inverse direction)
past.toNow()                 // "3 days"   ← no ago / in prefix
future.toNow()               // "7 days"

// to(other) — relative from THIS date to another DateTime
past.to(future)              // "in 10 days"
future.to(past)              // "10 days ago"
past.to(future, { short: true })  // "in 10d"`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🔄" title="DateTime Conversions & Individual Setters"
              subtitle="toDate(), toLocal(), valueOf(), locale getter — plus setYear(), setMonth(), setDay(), setTime()"
              gradient="linear-gradient(135deg,#0c4a6e,#0284c7)"
            />
            <DateTimeConversionsDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`const dt = DateTime.fromObject({ year:2025, month:6, day:15, hour:14, minute:30 }, 'America/New_York');

// Conversion
dt.toUTC().toISO()           // "2025-06-15T18:30:00.000Z"
dt.toLocal()                 // DateTime in machine's local timezone
dt.toDate()                  // JS Date object
dt.valueOf()                 // 1750007400000  (ms since epoch)
dt.locale                    // current Locale object

// Individual setters — all immutable, return new DateTime
dt.setYear(2030).year        // 2030
dt.setMonth(1).toISO()       // "2030-01-15T14:30:00..."  (Jan)
dt.setDay(1).toISO()         // first of the month
dt.setTime(9, 0)             // → 09:00 same date & tz

// Chain setters
dt.setYear(2000).setMonth(1).setDay(1).toISO()  // "2000-01-01T14:30:00..."`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="📅" title="LocalDate & LocalTime — Complete API"
              subtitle="fromObject(), fromDateTime(), min(), max(), compareTo(), isToday(), isWeekend(), isBetween(), millisecondOfDay"
              gradient="linear-gradient(135deg,#4a1942,#a21caf)"
            />
            <LocalExtendedDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { LocalDate, LocalTime, DateTime } from '@yedoma-labs/tuuru-chrono-tz';

// LocalDate factory methods
LocalDate.fromObject({ year:2025, month:3, day:14 }).toISO()  // "2025-03-14"
LocalDate.fromDateTime(DateTime.now('UTC')).toISO()            // today in UTC

// Static min / max
LocalDate.min(dateA, dateB, dateC)     // earliest LocalDate
LocalDate.max(dateA, dateB, dateC)     // latest LocalDate

// Extended comparisons
dateA.isAfter(today)                   // true / false
dateC.isSameOrAfter(today)             // true
today.isBetween(dateA, dateC)          // true

// toDateTime with time — attach a time to a LocalDate
today.toDateTime('America/New_York', { hour: 9, minute: 30 })  // DateTime at 9:30am today

// LocalTime extras
LocalTime.fromObject({ hour:14, minute:30, second:45 })
LocalTime.fromDateTime(DateTime.now())
LocalTime.of(12, 0, 0).millisecondOfDay   // 43200000
nowTime.isBetween(midnight, LocalTime.of(23,59,59))  // true
nowTime.compareTo(midnight)                // 1 (after midnight)
midnight.compareTo(noon)                   // -1 (before noon)`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🗄️" title="Timezone Database Constants"
              subtitle="TIMEZONE_COUNT, TZDATA_VERSION, TIMEZONE_LINKS — raw tzdata metadata shipped with the package"
              gradient="linear-gradient(135deg,#1c1917,#57534e)"
            />
            <TzdataInfoDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import {
  TIMEZONE_COUNT,   // total number of canonical zones
  TZDATA_VERSION,   // tzdata release string, e.g. "2026b"
  TIMEZONE_LINKS,   // Record<alias, canonical> — legacy → modern name
  TIMEZONE_NAMES,   // string[]  — all canonical IANA zone names
} from '@yedoma-labs/tuuru-chrono-tz';

TIMEZONE_COUNT          // 449 (canonical zones)
TZDATA_VERSION          // "2026b"
TIMEZONE_LINKS['EST']   // "America/New_York"
TIMEZONE_LINKS['Asia/Calcutta']  // "Asia/Kolkata"

// Also available via Timezone class
Timezone.listAll()      // string[]  (same as TIMEZONE_NAMES)
Timezone.search('New')  // zones containing "New"`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="🌍" title="Global Locale — setDefaultLocale · getDefaultLocale"
              subtitle="Switch the active locale globally — all subsequent DateTime instances use it automatically"
              gradient="linear-gradient(135deg,#0f4c35,#16a34a)"
            />
            <GlobalLocaleDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { DateTime, setDefaultLocale, getDefaultLocale, fr, ja, ar } from '@yedoma-labs/tuuru-chrono-tz';

// Set global locale — all new DateTime instances inherit it
setDefaultLocale(fr);
DateTime.now().toLocaleDateString()                       // "15 juin 2026"
DateTime.now().toLocaleDateString({ dateStyle: 'full' })  // "lundi 15 juin 2026"
DateTime.now().fromNow()                                  // "il y a quelques secondes"
DateTime.now().format('MMMM')                             // "juin"

setDefaultLocale(ja);
DateTime.now().toLocaleDateString()          // "2026年6月15日"
DateTime.now().format('MMMM D日')           // "6月15日"

setDefaultLocale(ar);
DateTime.now().toLocaleDateString()          // "١٥ يونيو ٢٠٢٦"
DateTime.now().fromNow()                     // "منذ ثانية"

// Read current default
getDefaultLocale().name    // "fr" | "ja" | "ar" ...

// Reset to English
setDefaultLocale(undefined);

// Per-instance override still works
DateTime.now().setLocale(fr).toLocaleDateString()  // "15 juin 2026"  (ignores global)
DateTime.now().setLocale(fr).formatLocalized('full')  // "lundi 15 juin 2026"`} />
            </div>
          </Card>

          <Card>
            <SectionHeader
              emoji="✨" title="v0.2.0 / v0.3.0 — Convenience Methods & Locale Formatting"
              subtitle="compareTo, isBetween, isToday/Tomorrow/Yesterday, isWeekend/isWeekday, clamp, weeksInYear (v0.2.0) · toLocaleDateString, toLocaleString, toLocaleTimeString, formatLocalized (v0.3.0)"
              gradient="linear-gradient(135deg,#1e1b4b,#3730a3)"
            />
            <DateTimeConvenienceDemo />
            <div style={{ marginTop: '1.5rem' }}>
              <CodeBlock code={`import { DateTime, LocalDate, LocalTime, de, ja, ar, fr } from '@yedoma-labs/tuuru-chrono-tz';

// ── v0.3.0 — Locale-aware formatting (Intl — correct structure per locale) ──
const now = DateTime.now('America/New_York');

now.setLocale(de).toLocaleDateString()                       // "15. Juni 2026"
now.setLocale(de).toLocaleDateString({ dateStyle: 'full' })  // "Montag, 15. Juni 2026"
now.setLocale(ja).toLocaleDateString()                       // "2026年6月15日"
now.setLocale(ar).toLocaleDateString()                       // "١٥ يونيو ٢٠٢٦"
now.setLocale(fr).toLocaleDateString({ dateStyle: 'full' })  // "lundi 15 juin 2026"

now.setLocale(de).toLocaleTimeString()                       // "10:30:45"
now.setLocale(ar).toLocaleString({ timeStyle: 'short' })     // "١٠:٣٠ ص"
now.setLocale(de).toLocaleString({ month: 'long', year: 'numeric' }) // "Juni 2026"

// formatLocalized — uses locale.dateFormats if defined, else Intl fallback
now.setLocale(de).formatLocalized('long')   // "15. Juni 2026"
now.setLocale(de).formatLocalized('full')   // "Montag, 15. Juni 2026"
now.setLocale(ja).formatLocalized('full')   // "2026年6月15日月曜日"

// LocalDate.toLocaleString(options, locale)
LocalDate.today().toLocaleString({ dateStyle: 'long' }, de)  // "15. Juni 2026"
LocalDate.today().toLocaleString({ dateStyle: 'full' }, ja)  // "2026年6月15日月曜日"

// LocalTime.toLocaleString(options, locale)
LocalTime.of(14, 30).toLocaleString({ timeStyle: 'short' }, de)  // "14:30"
LocalTime.of(14, 30).toLocaleString({ timeStyle: 'short' }, ar)  // "٢:٣٠ م"

// ── v0.2.0 — DateTime comparisons ──────────────────────────────────────────
const tomorrow = now.add({ days: 1 });
now.compareTo(tomorrow)               // -1
now.isBetween(now.subtract({ days: 30 }), tomorrow)  // true
now.clamp(DateTime.fromISO('2025-01-01T00:00:00Z'), DateTime.fromISO('2027-12-31T23:59:59Z'))
now.weeksInYear                       // 52 or 53 (ISO 8601)

// ── v0.2.0 — Calendar predicates ───────────────────────────────────────────
now.isToday() / now.isTomorrow() / now.isYesterday()
now.isWeekend() / now.isWeekday()

// ── v0.2.0 — LocalDate / LocalTime ─────────────────────────────────────────
LocalDate.today().compareTo(LocalDate.today().add({ days: 1 }))  // -1
LocalDate.today().isToday() / isWeekend() / isWeekday()
LocalTime.now().compareTo(LocalTime.of(9, 0))                    // -1 | 0 | 1
LocalTime.now().isBetween(LocalTime.of(9, 0), LocalTime.of(18, 0))`} />
            </div>
          </Card>

          {/* Footer */}
          <div style={{
            textAlign: 'center', padding: '2rem 1rem',
            borderTop: '1px solid #1e293b', color: '#334155',
          }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <span style={{
                background: 'linear-gradient(135deg,#a78bfa,#06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', fontWeight: 800, fontSize: '1rem',
              }}>
                @yedoma-labs/tuuru-chrono-tz
              </span>
              <span style={{ color: '#1e293b', margin: '0 0.75rem' }}>·</span>
              <span style={{ color: '#475569', fontSize: '0.82rem' }}>
                TypeScript-first · Zero deps · IANA 2026b · &lt;20KB
              </span>
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              <Link href="/" style={{ color: '#6366f1', textDecoration: 'none' }}>← Yedoma Labs Demo Hub</Link>
              <span style={{ color: '#1e293b', margin: '0 0.75rem' }}>·</span>
              <a href="https://www.npmjs.com/package/@yedoma-labs/tuuru-chrono-tz" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>npm ↗</a>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
