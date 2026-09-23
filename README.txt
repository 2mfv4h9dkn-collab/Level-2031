LEVEL 2031 — PWA prototype

Files:
- index.html: app
- manifest.json: Home Screen/PWA metadata
- sw.js: offline cache

This first prototype stores all data locally in the browser. It includes:
- daily SMART-style missions linked to the 2031 goals
- green/yellow/red day scoring
- XP and levels
- financial tracking
- long-term goal progress
- 14-day history
- mobile-first Apple-like UI

To run locally:
1. Serve this folder over HTTPS or localhost (PWA service workers require a secure context).
2. Open the URL on iPhone Safari.
3. Tap Share -> Add to Home Screen.

For a production app, add a hosted domain, real icons, cloud backup/login, push reminders, richer analytics, and a more advanced mission engine.
