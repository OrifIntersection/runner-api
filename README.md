# runner-api

Scripts and admin UI used by OrifIntersection's self-hosted GitHub Actions runners to automatically deploy projects. Backed by [PocketBase](https://pocketbase.io/).

There are two runners — **dev** and **prod** — each with their own build output and `WEB_URL`.

## Project structure

```
scripts/           # Node scripts executed as steps in the deployment pipeline
  generate-host.js   # Allocates a subdomain + port for a project being deployed
  delete-host.js     # Tears down a deployed project
  PASSWORD.js        # Manual password shim (see note below)

script_modules/    # Shared logic for scripts
  DBHandler.js       # PocketBase client wrapper + shell operations
  hostHandler.js     # Port detection, name generation, Apache config writer

webpage/           # Admin UI source (HTML/CSS/JS)
webpage_modules/   # UI components (host list, auth form)

build/             # esbuild output
  dev/               # Dev runner build
  prod/              # Prod runner build
build.js           # esbuild config
```

## Scripts

**`generate-host.js <repo>`** — Called during deployment. Checks PocketBase for an existing entry for the repo; if none exists, generates a unique `adjective+animal` subdomain, finds a free port, writes an Apache virtual host config, and stores the record. Outputs `domain-name`, `port`, and `cert` to `$GITHUB_OUTPUT`.

**`delete-host.js <repo>`** — Tears down a deployment: disables Apache site, removes the SSL certificate, stops/removes the Docker container and image, and deletes the PocketBase record.

## Admin UI

The bundled webpage is deployed to PocketBase's `pb_public` directory and lists all projects currently deployed by the runner (URL, port, repo, cert date).

## Build

```bash
npm install
npm run build
```

Outputs dev and prod bundles to `build/dev/` and `build/prod/`, each containing `scripts/` and `pb/pb_public/`. The `WEB_URL` constant is injected at build time.

## Password setup

GitHub Actions secrets require a paid plan for private repos. As a workaround, the PocketBase superuser password is set directly in `scripts/PASSWORD.js` on the server after deploying:

```js
// scripts/PASSWORD.js
const password = "your-password-here";
export default password;
```
