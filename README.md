Вот обновлённый README.md:

```markdown
# 🌾 Wheat Farm Simulator

A browser-based wheat microgreens farm simulator with spatial workflow zones, resource management, and real-time progression.

## 🚀 How to Run

**Requires a local web server** (ES modules don't work via `file://`).

Pick one:
```bash
# Node.js (recommended)
npx live-server

# Python
python -m http.server

# PHP
php -S localhost:8000
```

Then open `http://localhost:8080` (or the port shown in terminal).

## 🌱 Gameplay

Manage a microgreens farm through five growth stages across four spatial zones:

| Zone | Stage | Capacity |
|------|-------|----------|
| 🪣 Buckets (2×2) | Soak → Air | 4 seeds each |
| 🌱 Sowing Table | Sow | 8 containers |
| 📦 Press Shelves (3×4) | Press | 12 containers |
| 💡 Light Pallets (2×8) | Light | 16 containers |

**Full cycle:** Soak (1 day) → Air (1 day) → Sow (instant) → Press (2 days) → Light (5 days) → Harvest

## 🎮 Controls

- **Click** — select a single container or bucket
- **Ctrl+Click** — multi-select
- **Click zone headers** — select all items in a zone
- **Sidebar buttons** — perform actions on selected items
- **Hotkeys:** `Ctrl+1` add 1 seed, `Ctrl+4` add 4 seeds, `Ctrl+S` soak, `Ctrl+A` air, `Ctrl+P` plant

## 📦 Resources

- **Water** — used for soaking, spraying, watering, and making solution
- **Solution** — required for sowing
- **Seeds** — placed in buckets before soaking

## 🏆 Achievements

8 achievements tracking harvest count, zone utilization, speed, and water efficiency.

## ⏱️ Time

1 game day = 60 real seconds. Progress bars show stage completion. Timer can be paused.

## 💾 Persistence

Game state auto-saves to `localStorage` on every change. Includes save migration for backward compatibility.

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
├── constants.js            # Game constants (exported)
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
| `store.addLog is not a function` | Clear browser cache and reload |
| Old save breaks UI | Click "СБРОСИТЬ ИГРУ" in sidebar to reset |
| Buttons don't work | Select a container/bucket first, then click action button |

## 📝 License

MIT — see [LICENSE](LICENSE)
```

