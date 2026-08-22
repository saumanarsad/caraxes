# ReplayLab

## What this is

A NestJS package that captures inbound HTTP requests (especially failures), stores them as "cases,"
and lets a developer reproduce and diff them later. Positioned as a backend debugging/reliability
developer tool — not a webhook inspector, not an observability platform.

## Stack

- Node.js + TypeScript
- NestJS (interceptors, modules, controllers)
- Storage: local Postgres (or SQLite/JSON for simplicity in v1) — NOT a shared hosted DB
- Package manager: npm
- Testing: Jest (unit) + supertest (integration/e2e against a test Nest app)

## v1 scope (locked — do not expand without asking)

- Capture inbound HTTP request: method, URL, headers, body, query params, response, status, duration, error/stack
- Capture triggers: on error (5xx) by default, plus a config option for "capture all"
- Store cases locally (same app's DB or a simple local store) — no shared/hosted DB assumption
- Dashboard: mounted directly on the host app (e.g. `/replaylab`), served from the package itself, small static frontend hitting the package's own API routes
- "Replay": exports the case as a ready-to-run `curl` command (NOT automatic re-firing of the request from the package itself)
- Diff: user runs the curl command locally, pastes/submits the new response back into the dashboard, ReplayLab diffs it against the original captured response
- Diff engine must support volatile-field exclusion (timestamps, generated IDs, etc.) via config, including dot-path nested fields

## Explicitly OUT of scope for v1 (do not build unless asked)

- Outbound/external call recording or mocking (VCR/nock-style) — deferred to v2
- Automatic one-click replay fired by the package itself — deferred (curl export only for now)
- Database state snapshotting or restoration
- Failure/chaos injection
- Deterministic timestamp/randomness replay
- Distributed worker support
- Multi-framework support (NestJS only for v1)
- Hosted/multi-tenant SaaS version, billing, SSO, team management

## Package structure

```
@replaylab/nestjs
├── src/
│   ├── replaylab.module.ts        # ReplayLabModule.forRoot()
│   ├── interceptor/capture.interceptor.ts
│   ├── storage/                   # storage interface + implementation
│   ├── diff/diff.engine.ts
│   ├── api/replaylab.controller.ts  # /replaylab/api/*
│   └── dashboard/static/          # pre-built frontend bundle
```

## Working conventions

- Make small, scoped changes — one feature/piece per session, so commits stay atomic and readable.
- I (the user) handle all `git add`, `commit`, `push` manually — do not commit or push on your own.
- Always show a plan before writing code for anything non-trivial.
- Peer dependencies: `@nestjs/common` and `@nestjs/core` should be peerDependencies, not bundled.
- Prefer explicit, readable code over cleverness — this is a portfolio project meant to be read by others (recruiters, HN readers).
- If a request would expand scope beyond what's listed above, flag it and ask before building it.
