# runner-api

A PocketBase-backed API for managing CI/CD runner hosts. When a GitHub Actions workflow needs a deployment environment, it triggers a PocketBase hook that generates a unique `adjective+animal` hostname and assigns an available port. A web UI lets admins view and delete registered hosts.

---

## Dev Environment Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://docs.docker.com/get-docker/)

### Steps

1. **Install dependencies**

   ```bash
   npm i
   ```

2. **Configure `pocketbase/.env`**

   Create `pocketbase/.env` with the credentials you want to use for the local PocketBase superuser:

   ```env
   PB_EMAIL=your@email.com
   PB_PASS=your-password
   ENVIRONMENT=dev
   ```

   > `ENVIRONMENT=dev` causes hooks to skip all server-side actions (Apache, certbot, Docker) and log to the console instead.

3. **Start the dev server**

   ```bash
   npm run start
   ```

   This command does three things in sequence:
   - Builds the webpage (`webpage/`) and hooks (`hooks/`) into `pocketbase/pb_public/` and `pocketbase/pb_hooks/`, targeting `http://127.0.0.1:8090`
   - Builds the Docker image from `pocketbase/Dockerfile`
   - Starts a container on port `8090`, passing `pocketbase/.env` as environment variables

   The PocketBase UI and web dashboard are then available at [http://127.0.0.1:8090](http://127.0.0.1:8090).

---

## How host lifecycle works

Host creation and deletion are handled by PocketBase JSVM hooks in `hooks/main.pb.js`. These fire on `hosts` record create/delete events and shell out to Apache, certbot, and Docker via `$os.exec()`.

In dev (`ENVIRONMENT=dev`) all side effects are skipped — the hook logs what it would have done instead.

The hooks are **not** Node.js: they use the PocketBase JS API (`$os`, `$app`, etc.) and run inside the PocketBase process.

---

## `npm run build`

Produces minified, self-contained bundles for remote deployment under `build/`:

```
build/
  dev/
    pb/
      pb_public/  ← index.js, index.html, styles.css  (ESM, dev URLs)
      pb_hooks/   ← main.pb.js  (ESM, dev URLs)
  prod/
    pb/
      pb_public/  ← index.js, index.html, styles.css  (ESM, prod URLs)
      pb_hooks/   ← main.pb.js  (ESM, prod URLs)
```

---

## Build Details

All bundling is handled by [esbuild](https://esbuild.github.io/) via `build-tasks.js`.

**Webpage** (`webpage/`) is bundled as **ESM** — modern browsers natively understand ES modules, and PocketBase serves the output as static files from `pb_public/`.

**Hooks** (`hooks/main.pb.js`) are bundled as **ESM** into `pb_hooks/` — this is the format PocketBase's JSVM expects.

`WEB_URL` and `PROTOCOL` are injected as esbuild `define` constants at build time. The three environments are `local` (`127.0.0.1:8090`), `dev` (`is-dev.applications.ws`), and `prod` (`is-prod.applications.ws`).

**All npm dependencies are automatically inlined** into each bundle (`bundle: true`). Build outputs have zero external dependencies.

The `pb:*` scripts in `package.json` (`pb:build-image`, `pb:start-container`) are internal steps broken out from `npm run start` — they are not intended to be called directly.
