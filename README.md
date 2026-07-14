# ShopEase Web

ShopEase is a small outdoor-gear storefront: catalog and search, cart, checkout with promotions and US sales tax, payment authorization through the PayGate gateway, order history and cancellation, customer profile and a back-office admin API.

It is the reference application for the **Intelligent Test Suite Selection** agents (Change Intelligence, Test Discovery, Risk & Coverage, Suite Selection & Optimization).

## Run it

```bash
npm install
npm start                    # http://localhost:3000  (APP_ENV=local|st|sit|uat)
npm test                     # Jest unit + API tests
npm run test:e2e             # Playwright E2E (set PW_CHROMIUM_PATH to use a pre-installed Chromium)
```

Demo users: `alice@shopease.example` / `Passw0rd!` (customer, US-CA), `bob@…` (US-NY), `olga@…` (US-OR), `admin@shopease.example` / `Adm1nPass!`.
Test card tokens: `tok_success`, `tok_decline`, `tok_insufficient`, `tok_timeout` (gateway down), `tok_timeout_once` (one transient timeout).

## Layout

| Path | Contents |
| --- | --- |
| `src/services/` | Business logic: auth, catalog, inventory, cart, promo, tax, checkout, orders, notifications, profile |
| `src/services/payments/` | PayGate client, retry policy, payment service |
| `src/routes/` | Express REST API (`/api/...`) |
| `src/utils/money.js` | Shared rounding / formatting used by cart, pricing, checkout and notifications |
| `public/` | Storefront pages (vanilla HTML/JS) |
| `config/` | `default.json`, per-environment overrides (`st`, `sit`, `uat`), `feature-flags.json` |
| `api/openapi.yaml` | Public API contract (consumers: web frontend, mobile app, Fulfilment Service) |
| `db/migrations/` | PostgreSQL schema (the demo runs on an in-memory store that mirrors it) |
| `.github/CODEOWNERS` | Team ownership |
| `.qe/component-map.yaml` | Path → component → business journey → tier |
| `.qe/service-dependencies.yaml` | Internal, shared, external and API-consumer dependencies |
| `tests/unit`, `tests/api`, `tests/e2e` | Jest unit, Supertest API and Playwright E2E tests; every test title starts with a stable ID such as `[UT-CART-004]` |

## Branching and environments

```
feature/*, bugfix/*  ──►  develop (ST)  ──►  sit (SIT)  ──►  uat (UAT)  ──►  release/x.y  ──►  main (production)
                                                                                hotfix/* ───────────┘
```

| Cycle | Candidate | Baseline to compare against |
| --- | --- | --- |
| ST | feature/bugfix branch | `develop` |
| SIT | `sit` | last approved SIT tag `sit-approved-YYYY-MM-DD` |
| UAT | `uat` | last approved UAT tag `uat-approved-YYYY-MM-DD` |
| Regression | `release/1.1` | previous release tag `v1.0.0` |
| Hotfix | `hotfix/*` | `main` |

Commit messages reference Jira keys (`SHOP-123`).
