# 🌿 மளிகை உதவியாளர் — Maligai Assistant

**Tamil Voice Grocery Inventory Assistant**

A complete, real-world grocery inventory management system for small grocery shops in Tamil Nadu, India. The owner can ask questions naturally in Tamil ("சர்க்கரை இருக்கா?") and get instant spoken responses from the actual shop inventory.

---

## 🏗️ Architecture

```
maligai-assistant/
├── server/          ← Node.js + Express REST API
├── web/             ← React + Vite web dashboard (laptop)
├── mobile/          ← React Native + Expo Android app
├── database/        ← MySQL schema + seed data
└── sample-data/     ← CSV/Excel import templates
```

Both the web dashboard and mobile app share the **same backend** and **same MySQL database**.

---

## ⚙️ Requirements

- Node.js 18+
- MySQL 8.0+
- npm 9+
- Android device or emulator (for mobile)
- Expo CLI (`npm install -g expo-cli`)

---

## 🗄️ MySQL Setup

### 1. Open `server/.env` and set your MySQL password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=maligai_assistant
JWT_SECRET=maligai_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
PORT=5000
```

### 2. Run the setup script (creates DB, tables, admin user, and seed data):

```bash
cd server
npm run db:setup
```

This creates:
- Database `maligai_assistant`
- All tables (users, products, product_aliases, inventory_updates, import_history, search_history)
- Default admin: **username: `admin` | password: `admin123`**
- 40+ sample grocery products with Tamil names and aliases

---

## 🚀 Running Locally

### Backend

```bash
cd server
npm install
npm run dev
```
Server starts at: `http://localhost:5000`

### Web Dashboard

```bash
cd web
npm install
npm run dev
```
Dashboard opens at: `http://localhost:5173`

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

> **Important**: Before running on a physical Android device, update the API URL in `mobile/src/constants/index.ts`:
> ```ts
> export const API_BASE_URL = 'http://YOUR_PC_IP_ADDRESS:5000/api';
> ```
> Find your PC's local IP with `ipconfig` (Windows).  
> The Android emulator uses `10.0.2.2` (already set as default).

---

## 🔑 Default Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | List products (search, filter, page) |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/price` | Update price only |
| PATCH | `/api/products/:id/status` | Update availability only |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/stats` | Dashboard statistics |
| GET | `/api/products/history` | Recent inventory changes |
| POST | `/api/assistant/query` | Tamil voice/text query |
| POST | `/api/import/preview` | Preview CSV/Excel import |
| POST | `/api/import/confirm` | Confirm import |
| GET | `/api/import/template` | Download sample template |
| GET | `/api/import/export` | Export inventory to Excel |

---

## 🎤 Tamil Voice Input

### Expo Go (Development)
Use the **keyboard microphone** on Android keyboard for voice input with Tamil locale.

### Native Build (Production — Recommended)
For full Tamil STT integration, build a native APK:

1. Install EAS CLI: `npm install -g eas-cli`
2. `cd mobile && eas build --platform android --profile preview`
3. Install the generated APK on your Android device
4. The device's native Android STT with `ta-IN` locale will handle recognition

### Text Input (Always Available)
Type Tamil text directly in the search box — works identically to voice.

---

## 📤 Excel/CSV Import

1. Go to web dashboard → **Import / Export**
2. Click **"Template பதிவிறக்கம்"** to get the sample template
3. Fill in your products with columns:
   - `Product Name` (required)
   - `Tamil Name`
   - `Brand`
   - `Size` (number)
   - `Unit` (kg, g, L, ml, piece, packet)
   - `Price` (required, number)
   - `Status` (AVAILABLE or OUT_OF_STOCK)
   - `Aliases` (pipe-separated: `சுகர்|Sugar|Sakkarai`)
   - `Notes`
4. Upload → Preview validation → Confirm import

---

## 🗣️ Voice Query Examples

| Query | Response |
|-------|----------|
| "சர்க்கரை இருக்கா?" | "ஆம், சர்க்கரை இருக்கு. ஒரு கிலோ விலை 48 ரூபாய்." |
| "ஆவின் பால் என்ன விலை?" | "500 மில்லி ஆவின் பால் விலை 24 ரூபாய்." |
| "ஓரியோ இருக்கா?" | "ஓரியோ பிஸ்கட் தற்போது இல்லை." |
| "பால் இருக்கா?" | Shows all milk products (multiple match) |
| "சுகர் விலை என்ன?" | Uses alias → finds Sugar → returns price |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| MySQL access denied | Check `DB_PASSWORD` in `server/.env` |
| Mobile can't connect | Set `API_BASE_URL` to your PC's LAN IP |
| Tamil TTS not speaking | Ensure device has Tamil language pack installed |
| Import fails | Check CSV encoding is UTF-8; use template |
| CORS error | Add frontend URL to `CORS_ORIGIN` in `.env` |

---

## 🔒 Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT authentication on all protected routes
- SQL injection protection via parameterized queries
- Rate limiting (500 req/15 min per IP)
- Helmet.js security headers
- File upload validation (type + size)
- `.env` never committed to git

---

## 🚀 Production Deployment

### Backend + Database
1. Deploy MySQL on server (or use PlanetScale/Railway)
2. Deploy Node.js backend (Railway, Render, VPS)
3. Set all env variables on server
4. Enable HTTPS

### Web Dashboard
```bash
cd web
npm run build
# Deploy dist/ to Netlify / Vercel / Nginx
```

### Mobile APK
```bash
cd mobile
npx eas build --platform android
# Install generated APK or publish to Play Store
```

Update `API_BASE_URL` in `mobile/src/constants/index.ts` to your production server URL before building.

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Shop owner login credentials |
| `products` | All grocery inventory |
| `product_aliases` | Tamil/English alternate names for search |
| `inventory_updates` | Audit log of all changes |
| `import_history` | CSV/Excel import records |
| `search_history` | Voice/text query log |

---

*Built for Tamil Nadu grocery shop owners — Tamil first, simple, reliable.*
