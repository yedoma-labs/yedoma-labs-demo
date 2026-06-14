# Changelog

## [Unreleased]

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
