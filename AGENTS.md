# Kite — local / Base44 development notes

Kite is a Discord bot builder: a Go API (`kite-service`, Fiber-free `net/http`, pgx, migrations via golang-migrate),
a Next.js 14 pages-router frontend (`kite-web`), a Docusaurus docs site (`kite-docs`, not run by Base44), and a root
Go workspace (`go.work`) linking `kite-service` and `kite-web` (the API imports the `kite-web` module for its
optional embedded build).

## Run it

```sh
docker compose -f docker-compose.base44.yml up -d --build
```

- UI: http://localhost:3000 (Next dev server, live reload)
- API: http://localhost:8000 (`/v1/health`, live reload via `air`, config in `.base44/air.toml`)

Services: `postgres` (16), `s3` (SeaweedFS, S3-compatible, buckets auto-created by the app), one-shot `migrate`
(`kite-service database migrate postgres up`, API waits for it), `api`, `web`.

## Non-obvious things

- Config is TOML + env (`KITE_...`, `__` maps to a nested key), see `kite-service/internal/config/default.toml`.
  Required values: Postgres, S3, `KITE_DISCORD__CLIENT_ID`, `KITE_DISCORD__CLIENT_SECRET`,
  `KITE_ENCRYPTION__TOKEN_ENCRYPTION_KEY` (hex AES key, must decode — a random string fails startup).
- The frontend has **no SSR data fetching**; it calls the API from the browser with `credentials: "include"`.
  In preview mode the API base URL is empty and `kite-web/next.config.mjs` rewrites `/v1/*` to `http://api:8080`,
  so session cookies stay first-party (`KITE_API__STRICT_COOKIES` is true). This rewrite only exists when
  `BASE44_PREVIEW_MODE=1`; without the flag `next.config.mjs` behaves as before.
- Sign-in is email + password: `POST /v1/auth/login` and `POST /v1/auth/register` (bcrypt hash in
  `users.password_hash`, migration 026), then the usual session cookie. The Discord OAuth handlers still exist in
  `internal/api/handler/auth` but are no longer routed, so the Discord login page is `kite-web/src/pages/login.tsx`.
- The product is branded "MaNor Hosing"; the logo is `kite-web/src/assets/logo/manor-hosing.png` (also
  `kite-web/public/logo.png` for the OG image).
- `KITE_DISCORD__BOT_TOKEN` / `KITE_DISCORD__GUILD_ID` are optional (role handout); `KITE_OPENAI__API_KEY` and the
  Lemon Squeezy billing keys are optional — AI nodes / checkout stay non-functional without them.
- `go build` in `kite-service` needs the `kite-web` module: it is resolved from the bind-mounted repo via `go.work`
  and the `replace` in `kite-service/go.mod`. `go mod download` for both modules happens in the image build.
- `kite-web` dependencies live in a named volume (`kite-web-node-modules`), installed with `npm ci` on container
  start — restart `web` after changing `package.json`/`package-lock.json`.
- Migrations are embedded; adding a file under `kite-service/internal/db/postgres/migrations` requires rebuilding
  and re-running the `migrate` service.
- Per-app limits and the custom status perk come from the app's plan, not the global `[user_limits]` config:
  `PlanManager.AppFeatures` merges the default plan with the app's entitlements, and the command / message /
  event listener handlers read their limit from it (the global value is only a fallback when a plan sets 0).
- Premium and Investor are unlocked per app with a purchase code (`POST /v1/apps/{appID}/billing/redeem`,
  store method `RedeemCode`): the code lists live in `kite-service/internal/core/plan/codes.go`, each code is
  single-use via the `redeemed_codes` table (migration 027) and grants a `type = "code"` entitlement. The plans
  themselves are `hidden` in `default.toml` so they never show up in the Lemon Squeezy pricing grid; the premium
  page renders its own tier cards in `kite-web/src/components/app/AppPremiumRedeem.tsx`.

## Verify

- `curl -fsS http://localhost:8000/v1/health` → `OK`
- `curl -fsS http://localhost:3000/v1/health` → `OK` (same-origin rewrite working)
- `curl -fsS http://localhost:3000/` → the marketing home page
- Tests: `docker compose -f docker-compose.base44.yml exec -T api go test ./...`
