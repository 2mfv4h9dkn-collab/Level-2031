# Level 2031 — V10 Visual RPG / World

Local-first PWA foundation for the Level 2031 life RPG.

## V8 systems
- Versioned/migratable state
- XP and credit ledgers
- Daily mission engine, partial completion, Core Day and Epic Day
- Universal streak milestones
- Finance: accounts, assets, liabilities, calculated net worth, history, check-ins
- Control AC & Heat: jobs, payments, verified company revenue
- Trading journal with profitable-trade XP
- Fitness: workouts, runs, body measurements
- Faith, personal development and skill tracking
- Relationships and memories
- Travel and bucket list
- Vehicle/garage collection
- Life Log
- Achievement collection
- Future-world placeholder layer
- Backup/restore and dark/light mode

Open `index.html` in a static web host or PWA-compatible environment. Data is stored locally in the browser under `level2031`.


## V9 Visual RPG / World Layer
Adds the interactive home world, room navigation, character customization foundation, garage collection, world progression, and future-world scaffolding.


## V10 Visual RPG Fix
World is now a first-class app screen with a dedicated World navigation tab; the visual world no longer depends on an injected section being appended after render.


## V10 cache/integration fix
Uses a new service-worker filename and cache namespace so an older V7/V8 PWA cache cannot silently serve the previous app shell. The World tab renders the RPG world directly.
