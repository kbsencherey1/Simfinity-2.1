# Simfinity — Ghana-Rooted eSIM Platform

A full-stack eSIM purchasing app for Ghanaians and travellers. React Native (Expo) mobile frontend + Spring Boot backend + PostgreSQL, all containerised with Docker Compose.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker Desktop | latest |
| Node.js | 18+ |
| Expo Go app | installed on your phone |

---

## Quick Start (same WiFi)

### 1 — API keys

Copy the example and fill in your keys:

```sh
cp .env.example .env
```

Open `.env` and set:

```
PAYSTACK_SECRET_KEY=sk_test_...      # from dashboard.paystack.com
GEMINI_API_KEY=...                   # from aistudio.google.com (optional — for AI travel insights)
```

`ZENDIT_API_KEY` and `OPENCELLID_API_KEY` already have working sandbox defaults in `.env.example`.

### 2 — Start the backend

```sh
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Spring Boot API** on port 3000

Check it's healthy:

```sh
docker compose logs backend --tail=20
```

You should see `Started SimfinityBackendApplication`.

### 3 — Open Windows Firewall for port 3000

Mobile devices on your WiFi need to reach port 3000 on your PC. Run this once in an **Administrator** PowerShell:

```powershell
netsh advfirewall firewall add rule name="Simfinity Backend" dir=in action=allow protocol=TCP localport=3000
```

### 4 — Start the mobile app

```sh
cd mobile
npm install        # first time only
npx expo start
```

Scan the QR code with **Expo Go**. The app auto-detects your PC's LAN IP and connects to `http://<your-IP>:3000`.

---

## Project Structure

```
Simfinity-2.1/
├── backend/          Spring Boot 3 API (Java 21, Docker)
│   ├── src/
│   └── Dockerfile
├── mobile/           React Native app (Expo SDK 54)
│   ├── app/          expo-router screens
│   ├── components/
│   ├── context/      AppContext (auth, eSIMs, currency)
│   └── config.ts     API_BASE — auto-detects LAN IP in dev
├── docker-compose.yml
└── .env              your local key (gitignored)
```

---

## How LAN detection works

[mobile/config.ts](mobile/config.ts) reads `Constants.expoConfig.hostUri` which Expo sets to your machine's LAN IP when you run `expo start`. In dev mode the API base becomes `http://<LAN-IP>:3000`, so any phone on the same WiFi reaches your local backend automatically.

---

## Key API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Log in (returns JWT) |
| GET | `/api/zendit/offers?country=GH` | List eSIM plans |
| POST | `/api/paystack/initialize` | Start Paystack payment |
| POST | `/api/paystack/verify/:ref` | Verify & provision eSIM |
| GET | `/api/user/esims` | My purchased eSIMs |
| GET | `/api/user/referrals` | Referral dashboard |
| GET | `/api/local-insight` | Gemini AI travel insight |

---

## Stopping

```sh
docker compose down
```

Data persists in Docker volumes (`postgres_data`, `avatars_data`). To wipe everything:

```sh
docker compose down -v
```
