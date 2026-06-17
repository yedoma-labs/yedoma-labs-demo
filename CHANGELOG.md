# Changelog

## [Unreleased]

### Added - tierde-mail v0.4.0 Integration

- Upgraded `@yedoma-labs/tierde-mail` from v0.2.0 to v0.4.0
- Showcase page fully rewritten with 18 sections covering all v0.4.0 features
- Added `sendBatch` section — chunk-based fan-out with `concurrency`, `delayMs`, `maxPerSecond` token-bucket rate limiter; interactive `BatchDemo` component with per-item status animation (pending → sending → sent/failed)
- Added webhooks section — Resend (`createResendWebhookHandler`, Svix HMAC) + Postmark (`createPostmarkWebhookHandler`, HMAC-SHA256) with tabbed demo; normalized `WebhookEvent { type, provider, email, raw }`
- Added mailpit section — zero-config `mailpit()` provider for localhost:1025 SMTP dev capture; added as 6th provider tab
- Added `unsubscribeHeaders` section — RFC 8058 List-Unsubscribe header generation with `url`, `email?`, `oneClick?` options
- Added `createMailerFromEnv` section — bylyt-env-guard integration for zero-config env-based mailer bootstrap
- Added React integration section — `<EmailPreview html>` component + `renderEmailHtml(template, props)`
- Template preview expanded to 12 mockups with full-catalog filter (41 templates, 7 categories)
- Theme Customizer section with live `createTheme()` demo (18-token Theme interface)
- Updated hub card desc and LIBRARIES footer to 6 providers + sendBatch + webhooks

### Added - tierde-mail v0.3.0 Integration

- Upgraded `@yedoma-labs/tierde-mail` from v0.2.0 to v0.3.0
- Added CLI section — `tierde dev`, `tierde send`, `tierde render`, `tierde eject --list`, `tierde eject --all`
- Added `mailpit()` provider (zero-config localhost dev email capture)

### Added - tierde-mail v0.2.0 Integration

- Upgraded `@yedoma-labs/tierde-mail` from v0.1.0 to v0.2.0
- Showcase fully rewritten to cover 41 templates across 7 categories (Auth, Account Management, Security, Commerce, Engagement, Productivity, Billing)
- Interactive preview expanded from 7 → 12 templates; new mockups: SecurityAlert (AlertBox danger + KeyValueTable), WeeklyDigest (stats grid + highlights), OnboardingProgress (step badges), AbandonedCart (cart table), ShippingUpdate
- Added full template catalog section with category filter — all 41 templates shown with props
- Added AlertBox (4 variants: danger/warning/success/info) visual section + code
- Added KeyValueTable auto-filter demo + code
- Added BaseTemplateProps + SecurityDetails/ChangeRecord/LoginEvent shared types section
- Added createMailerFromEnv() section (zero-config env-based mailer via bylyt-env-guard)
- Added Security section documenting v0.2.0 fixes (null byte bypass, empty recipient, Link XSS, KeyValueTable false values)
- Updated theme customizer to expose `buttonBorderRadius` (separate from card radius)
- Architecture section updated: juice → @css-inline/css-inline (Rust/NAPI) + dark mode @media preservation
- Updated version badge, hub card desc, and library footer to v0.2.0

### Added - tierde-mail v0.1.0 Integration

- Added `@yedoma-labs/tierde-mail` v0.1.0 showcase at `/tierde-mail`
- Added tierde-mail card to hub page demo grid and library footer
- Added `tierde` entry to hub page Yakut Lexicon section (тиэрдэ — "to deliver · to convey")
- Showcase covers: `defineEmail`, `createMailer`, 5 providers (resend/SMTP/SES/SendGrid/Postmark), 7 built-in templates, failover/round-robin multi-provider strategies, `captureEmails` testing helper, `createTheme` customization, i18n/string overrides, CSS inlining, `tierde eject` CLI, and yedoma-labs ecosystem integration
- Interactive: live email preview with template selector + theme color pickers (primary, accentBar, borderRadius)
- Visual email mockups for all 7 template types including Invoice table and TwoFactorAuth code display

### Fixed - tuuru-chrono-tz v0.3.1 Integration

- Upgraded `@yedoma-labs/tuuru-chrono-tz` from v0.3.0 to v0.3.1
- All 85 locale objects now ship `dateFormats` (`short`, `medium`, `long`, `full`) — date structure is locale-correct without relying on `Intl`
- Locale grid now uses `dt.formatLocalized('long')` + `dt.format('dddd')` unconditionally — no `Intl.DateTimeFormat.supportedLocalesOf()` guard needed
- Removed `lib` badge (fallback indicator) from locale cards — all locales now render correctly
- Updated locale grid subtitle and code example to show `formatLocalized` as the primary API
- Updated version badge to v0.3.1

### Added - tuuru-chrono-tz v0.3.0 Integration

- Upgraded `@yedoma-labs/tuuru-chrono-tz` from v0.2.0 to v0.3.0
- Added `DateTime.toLocaleString(options?)`, `toLocaleDateString(options?)`, `toLocaleTimeString(options?)` — thin `Intl.DateTimeFormat` wrappers using the instance's locale tag
- Added `DateTime.formatLocalized(style)` — uses `locale.dateFormats[style]` if present, else `Intl` fallback
- Added `LocalDate.toLocaleString(options?, locale?)` and `LocalTime.toLocaleString(options?, locale?)`
- Locale grid updated from `dt.format('D MMMM YYYY')` to `dt.toLocaleDateString()` / `toLocaleString({ weekday: 'long' })` for Intl-supported locales
- Added `toLocaleDateString` and `formatLocalized('long')` chips to **GlobalLocaleDemo** — update live on locale switch
- Added new **v0.3.0 subsection** in DateTimeConvenienceDemo with 11 live output chips across de/ja/ar/fr/hi/zh_Hans
- Updated all code example blocks to feature new locale-formatting API
- Updated `LocalDate & LocalTime` code block with `toLocaleString` examples

### Added - tuuru-chrono-tz v0.2.0 Integration

- Upgraded `@yedoma-labs/tuuru-chrono-tz` from v0.1.0 to v0.2.0
- Added 18 new locale imports via tree-shakeable `./locales/<code>` subpaths:
  `ms`, `sw`, `he`, `ca`, `tl`, `fil`, `gu`, `mr`, `ta`, `kk`, `uz`, `ka`, `mn`, `af`, `zh_Hans`, `zh_Hant`, `yue`
- Updated locale grid to show 52 of 87 available locales (up from 34)
- Added new demo card **v0.2.0 — Convenience Methods** showcasing:
  - `DateTime.compareTo()`, `isBetween()`, `clamp()`, `weeksInYear`
  - `DateTime.isToday()`, `isTomorrow()`, `isYesterday()`, `isWeekend()`, `isWeekday()`
  - `LocalDate.compareTo()`, `isToday(tz?)`, `isWeekend()`, `isWeekday()`
  - `LocalTime.compareTo()`, `isBetween()`
- Replaced `LocalTime` workaround (`isAfter && isBefore`) with direct `isBetween()` call
- Added `LocalDate.compareTo/isToday/isWeekend/isWeekday` chips to existing extended demo
- Added `LocalTime.compareTo` chips to existing extended demo
- Updated version badge from v0.1.0 to v0.2.0 and feature chip from "34 Locales" to "87 Locales"

### Added - turar-config v0.2.0 Integration

- Upgraded `@yedoma-labs/turar-config` from v0.1.0 to v0.2.0
- Added YAML configuration file support (`config/default.yaml`)
- Added TOML configuration file support (`config/default.toml`)
- Added hot reload demo page at `/config/hotreload`
  - Interactive file watching with change tracking
  - Real-time configuration updates without restart
  - Debounced change detection
- Enhanced Vault integration documentation (token + AppRole auth)

### Changed

- Updated all turar-config documentation to reflect v0.2.0 API
- Improved server-side configuration loading with `server-only` package
- Added `serverExternalPackages` config for chokidar/fsevents bundling
- Enhanced configuration examples with multi-format support

### Fixed

- Configured Next.js to properly externalize file watching dependencies
- Prevented fsevents bundling errors in Turbopack builds

## [0.3.0] - Previous

- Initial turar-config v0.1.0 integration
- bylyt-env-guard environment validation
- sir-forms and suruy-form-actions demos
- ichchi-state persistence examples
- suruk-logger structured logging
