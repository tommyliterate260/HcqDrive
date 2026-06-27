# Changelog

All notable changes to HcqDrive are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- HTTPS support (self-signed cert in the APK, paired with the pairing code)
- Background uploads (start upload from browser, switch off the screen, get notified on completion)
- Selective sync — pin folders that should auto-upload when on Wi-Fi
- Web UI: file preview for more types (PDF, text, code with syntax highlighting)

## [0.5.1] - 2026-06-27

First public release. M1 complete.

### Added
- Foreground service: persistent notification shows the 6-digit pairing code, the access URL, and the live connection count
- 6-digit pairing code with 5-minute expiry, per-device session tokens
- File manager: browse, search, sort (name / size / date), rename, move, copy, delete (with recycle bin), new folder
- HTTP Range download resume
- Single-file and chunked upload
- ZIP bulk download
- Auto-generated thumbnails for photos and videos
- EXIF metadata extraction for JPEGs
- Vue 3 web UI: responsive across phone / tablet / desktop, full dark mode
- One-tap start / stop, paired with permission request flow

### Security
- Pairing code is short-lived and never leaves the LAN
- No cloud, no account, no telemetry
