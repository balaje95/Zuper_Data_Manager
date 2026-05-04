# ⚡ Zuper Data Manager

## How to Run

### Option A — Local (no hosting needed)
Requires Node.js (any version). No npm install.

```
node server.js
```
Then open **http://localhost:3000** in your browser.

---

### Option B — Deploy to Netlify (free)
1. Push this folder to a GitHub repo
2. [app.netlify.com](https://app.netlify.com) → Add new site → Import from GitHub
3. Leave build settings **blank**
4. Deploy — done ✅

---

### Option C — Deploy to Vercel (free)
1. Push this folder to a GitHub repo
2. [vercel.com](https://vercel.com) → Add New Project → import repo
3. Framework: **Other**, build settings: blank
4. Deploy — done ✅

---

## How Proxy Routing Works

| Where opened              | Proxy used                              |
|---------------------------|-----------------------------------------|
| http://localhost:3000     | `/api/zuper-proxy` (server.js)          |
| https://xxx.netlify.app   | `/.netlify/functions/zuper-proxy`       |
| https://xxx.vercel.app    | `/api/zuper-proxy` (Vercel function)    |
| file:// (double-click)    | corsproxy.io fallback                   |

---

## Supported Modules
Purchase Orders · Material Orders · Customers · Properties · Assets ·
Parts & Services · Jobs · Invoices · Quotes/Estimates · Service Contracts ·
Users · Teams · Organization
