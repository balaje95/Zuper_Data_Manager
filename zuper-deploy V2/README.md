# ⚡ Zuper Data Manager — Deployment Guide

A browser-based tool to fetch, inspect, and bulk-delete records across all
Zuper modules. Includes a serverless proxy so the Zuper API is called
server-side — no CORS issues, API key never touches third-party servers.

---

## Project Structure

```
zuper-data-manager/
├── index.html                        ← Main tool (open this in browser)
├── netlify.toml                      ← Netlify config
├── vercel.json                       ← Vercel config
├── api/
│   └── zuper-proxy.js                ← Vercel serverless function
└── netlify/
    └── functions/
        └── zuper-proxy.js            ← Netlify serverless function
```

---

## Deploy to Netlify (recommended — free tier works)

1. Push this folder to a GitHub repo
2. Go to https://app.netlify.com → **Add new site** → **Import from GitHub**
3. Select your repo
4. Build settings — leave both **blank** (no build command, no publish dir override)
5. Click **Deploy site**
6. Done — your tool is live at `https://your-site.netlify.app`

> No environment variables needed. The API key is entered in the UI at runtime.

---

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → **Add New Project** → Import your repo
3. Framework preset: **Other**
4. Leave build settings blank
5. Click **Deploy**
6. Done — live at `https://your-project.vercel.app`

---

## How the Proxy Works

| Environment         | How requests are made                              |
|---------------------|----------------------------------------------------|
| Hosted (Vercel/Netlify) | `/api/zuper-proxy?target=...` → serverless fn → Zuper API |
| Local `file://`     | `corsproxy.io` fallback (third-party, for dev only) |

The serverless function only forwards requests to `*.zuperpro.com` — all
other targets are rejected with 403.

---

## Supported Modules

Purchase Orders · Material Orders · Customers · Properties · Assets ·
Parts & Services · Jobs · Invoices · Quotes/Estimates · Service Contracts ·
Users · Teams · Organization

---

## Features

- 📄 Fetch all records with pagination (up to 5,000)
- 🔍 Search & filter records
- ✅ Select individual or all records
- 📊 Export to JSON or CSV
- 🧪 Dry Run mode (verifies records exist without deleting)
- 🗑 Bulk delete with progress bar, pause, cancel, retry
- 📋 Download deletion log as CSV
- 💬 Optional Slack webhook audit log (`Ctrl+Shift+A` to open settings)
