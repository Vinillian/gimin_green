Вот обновлённый README.md для версии с реальным временем:

```markdown
# 🌾 Wheat Farm Simulator

A browser-based wheat microgreens farm simulator with spatial workflow zones, resource management, and **real-time progression** (actual hours/days, not game time).

## 🚀 How to Run

**Requires a local web server** (ES modules don't work via `file://`).

### Option 1: PowerShell (Windows, no install)
```powershell
powershell -ExecutionPolicy ByPass -File server.ps1
```

### Option 2: Any OS with Node.js / Python / PHP
```bash
npx live-server
# or
python -m http.server
# or
php -S localhost:8000
```

Then open `http://localhost:8000`.

## 🌱 Gameplay

Manage a microgreens farm through five growth stages across four spatial zones:

| Zone | Stage | Real Duration |
|------|-------|---------------|
| 🪣 Buckets (2×2) | Soak → Air | 24h + 24h |
| 🌱 Sowing Table (2×4) | Sow | Instant |
| 📦 Press Shelves (3×4) | Press | 48 hours |
| 💡 Light Pallets (2×8) | Light | **7 days** |

**Full cycle:** ~10 days real time (Soak 1d → Air 1d → Sow instant → Press 2d → Light 7d → Harvest)

**Care schedule:**
- 💦 Spraying: every 24 hours (air/press/light stages)
- 🚰 Watering: every 24 hours (light stage only)

## 🎮 Controls

| Action | How |
|--------|-----|
| Select single | Click container or bucket |
| Multi-select | Ctrl+Click |
| Select all in zone | Click zone header (💡 СВЕТ, 📦 ПРИЖИМ, etc.) |
| All containers | 🔲 ВЫБРАТЬ ВСЕ in sidebar |
| Actions on selected | Zone buttons or sidebar buttons |
| Hotkeys | `Ctrl+1` add seed, `Ctrl+4` add 4 seeds |

## ⏱️ Real-Time System

- **No game days** — everything runs on actual Unix timestamps
- Clock shows current 📅 date and 🕒 time (updates every second)
- Progress bars reflect real elapsed time vs stage duration
- Timer can be paused ⏸️ (freezes progress)
- UI refreshes every 60 seconds automatically
- Page refresh recalculates all progress instantly

## 📦 Resources

- **Water** — used for soaking, spraying, watering, and making solution
- **Solution** — required for sowing
- **Seeds** — placed in buckets before soaking

## 💾 Persistence

Game state auto-saves to `localStorage` on every change. Timestamps are preserved — if you close the browser for 3 days and reopen, the plants will have progressed 3 days.

## 🏆 Achievements

8 achievements tracking harvest count, zone utilization, speed, and water efficiency.

## 🛠️ Tech Stack

- **Vanilla JavaScript** (ES modules)
- **CSS** with custom gradients and animations
- **Event-driven architecture** with pub/sub store
- **No frameworks, no build step**

## 📁 Project Structure

```
gimin_green/
├── index.html              # Entry point
├── style.css               # All styles
├── constants.js            # Game constants (durations, costs, capacities)
├── server.ps1             # Windows PowerShell server (no install needed)
├── src/
│   ├── main.js             # App initialization
│   ├── store/index.js      # Central state (pub/sub)
│   ├── models/             # Data classes
│   │   ├── Bucket.js
│   │   ├── Container.js
│   │   ├── Shelf.js
│   │   ├── Pallet.js
│   │   └── ResourceStock.js
│   ├── controllers/        # Business logic
│   │   ├── bucketController.js
│   │   ├── containerController.js
│   │   ├── harvestController.js
│   │   └── careController.js
│   ├── views/              # Rendering functions
│   │   ├── containerCard.js
│   │   ├── renderBuckets.js
│   │   ├── renderTable.js
│   │   ├── renderShelves.js
│   │   ├── renderPallets.js
│   │   ├── renderResources.js
│   │   ├── renderSelectedInfo.js
│   │   └── renderLog.js
│   ├── handlers/           # Event handlers
│   │   ├── buttonHandlers.js
│   │   ├── keyboardHandlers.js
│   │   └── zoneClickHandlers.js
│   └── services/           # Cross-cutting
│       ├── timeService.js
│       ├── persistenceService.js
│       ├── achievementService.js
│       └── eventBus.js
├── README.md
└── LICENSE
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page / CORS errors | Run a local server, don't open `index.html` directly |
| Progress not updating | Click ⏸️ to resume if paused, or refresh page |
| Old save breaks UI | Click 🔄 СБРОСИТЬ ИГРУ in sidebar to reset |
| Buttons don't work | Select a container/bucket first, then click action button |

## 📝 License

MIT — see [LICENSE](LICENSE)
```

