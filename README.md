# runner-api

A PocketBase-backed API for managing CI/CD runner hosts. It tracks which repos have been assigned hostnames and ports, and exposes a small web UI for viewing registered hosts.

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

2. **Configure `scripts/.env`**

   The file `scripts/.env` needs to be created with the credentials you want to use for the local PocketBase superuser:

   ```env
   EMAIL=your@email.com
   PASSWORD=your-password
   ENVIRONMENT=dev
   ```

   > `ENVIRONMENT=dev` enables local-only behavior in the scripts (e.g. port selection without `ss`, Apache directive printed to stdout instead of written to disk).

3. **Start the dev server**

   ```bash
   npm run start
   ```

   This command does three things in sequence:
   - Builds the webpage source (`webpage/`) into `pocketbase/pb_public/` so PocketBase can serve it (targeting `http://127.0.0.1:8090`)
   - Builds the Docker image from `pocketbase/Dockerfile`
   - Starts a container on port `8090`, passing `scripts/.env` as environment variables

   The PocketBase UI and web dashboard are then available at [http://127.0.0.1:8090](http://127.0.0.1:8090).

---

## Other Scripts

### `npm run generate-host <repo>`

Registers a new host for a given repo name. Connects to the running PocketBase instance, generates a unique `adjective+animal` domain name and an available port, and writes the result to the `hosts` collection.

On a production server it also writes an Apache virtual host config. In dev (`ENVIRONMENT=dev`) it prints the directive to stdout instead.

Outputs to `GITHUB_OUTPUT` when run inside a GitHub Actions workflow, otherwise logs JSON to stdout:

```json
{ "name": "happyotter", "port": 42301, "cert": "true" }
```

`cert` is `"false"` when the repo already had an existing host entry (idempotent re-use).

### `npm run delete-host <repo>`

Removes a host entry by repo name. In production this also disables the Apache site, removes the SSL certificate, and stops/removes the Docker container and image. In dev it skips those steps and only deletes the database record.

### `npm run build`

Produces minified, self-contained bundles for remote deployment under `build/`:

```
build/
  dev/
    scripts/   ← generate-host.js, delete-host.js  (CommonJS, dev URLs)
    pb/pb_public/  ← index.js, index.html, styles.css  (ESM, dev URLs)
  prod/
    scripts/   ← generate-host.js, delete-host.js  (CommonJS, prod URLs)
    pb/pb_public/  ← index.js, index.html, styles.css  (ESM, prod URLs)
```

---

## Build Details

All bundling is handled by [esbuild](https://esbuild.github.io/) via `build-tasks.js`.

**Scripts** (`scripts/*.cjs`) are bundled as **CommonJS** — this is required because they run directly in Node.js on the server, and CJS is the format Node expects when executing a file or piping one via `--input-type=commonjs`.

**Webpage** (`webpage/`) is bundled as **ESM** — modern browsers natively understand ES modules, and PocketBase serves the output as static files.

**All npm dependencies are automatically inlined** into each bundle (`bundle: true`). The build outputs have zero external dependencies, so the scripts and web assets can be dropped onto a server or into a Docker image without a separate `npm install`.

The `pb:*` scripts in `package.json` (`pb:build-image`, `pb:start-container`) are internal steps broken out from `npm run start` for maintainability — they are not intended to be called directly in normal usage.
