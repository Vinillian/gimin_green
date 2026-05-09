# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 5.x (real-time) | ✅ |
| 4.x (modular)   | ✅ |
| < 4.0 (legacy)  | ❌ |

## Reporting a Vulnerability

This is a browser-based single-page application with no backend, no database, and no user authentication. Vulnerabilities are limited to client-side issues (XSS via localStorage manipulation, DOM injection).

To report a vulnerability:
1. Open an issue on [GitHub Issues](https://github.com/Vinillian/gimin_green/issues)
2. Or email `ber07@inbox.ru` (from commit history)
3. Include steps to reproduce and affected version

**Response time:** Within 14 days (this is a hobby project)

**If accepted:** Fix will be published in the next version with credit in release notes.

**If declined:** Explanation will be provided in the issue thread.

## Scope

| In scope | Out of scope |
|----------|--------------|
| XSS via crafted localStorage data | Social engineering |
| DOM injection through UI | Physical device access |
| Data integrity issues | Browser vulnerabilities |
| | DDoS (no server component) |

## Acknowledgments

Thank you to anyone who responsibly discloses security issues.
