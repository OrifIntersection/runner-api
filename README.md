# runner-api

Scripts and admin UI used by OrifIntersection's self-hosted GitHub Actions runners to automatically deploy projects. Backed by [PocketBase](https://pocketbase.io/).

There are two runners — **dev** and **prod** — each with their own build output and `WEB_URL`.

## Project structure

```
scripts/           # Node scripts executed as steps in the deployment pipeline
  generate-host.js   # Allocates a subdomain + port for a project being deployed
  delete-host.js     # Tears down a deployed project

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

The `scripts` field in `package.json` defines:

| Script | What it does |
| --- | --- |
| `npm run build` | Runs `build.js` (esbuild) and writes the dev/prod bundles to `build/`. |
| `npm run serve` | Bundles `webpage/index.js` with `WEB_URL` pointed at `127.0.0.1:8090` and `PROTOCOL` set to `http`, then serves `webpage/` so you can view the admin UI against a local PocketBase instance. |
| `npm run generate-host -- <repo>` | Bundles `scripts/generate-host.js` with esbuild and pipes the result into `node --input-type=module -`, then runs it against a local PocketBase instance. |
| `npm run delete-host -- <repo>` | Same, but for `scripts/delete-host.js`. |

**`generate-host.js <repo>`** — Called during deployment. Checks PocketBase for an existing entry for the repo; if none exists, generates a unique `adjective+animal` subdomain, finds a free port, writes an Apache virtual host config, and stores the record. Outputs `domain-name`, `port`, and `cert` to `$GITHUB_OUTPUT`.

**`delete-host.js <repo>`** — Tears down a deployment: disables Apache site, removes the SSL certificate, stops/removes the Docker container and image, and deletes the PocketBase record.

Both scripts read the repo name from `process.argv[2]`, not stdin. The `-` in `node --input-type=module -` is only there because esbuild's bundled *code* is piped into Node that way — the repo name itself is a normal trailing CLI argument, passed through npm's `--` separator:

```bash
npm run generate-host -- my-repo-name
npm run delete-host -- my-repo-name
```

## Admin UI

The bundled webpage is deployed to PocketBase's `pb_public` directory and lists all projects currently deployed by the runner (URL, port, repo, cert date).

## Build

```bash
npm install
npm run build
```

Outputs dev and prod bundles to `build/dev/` and `build/prod/`, each containing `scripts/` and `pb/pb_public/`. Two constants are injected at build time:
- `WEB_URL` — `is-dev.applications.ws` or `is-prod.applications.ws`.
- `PROTOCOL` — `https` for both dev and prod builds.

The webpage connects to PocketBase at `${PROTOCOL}://${WEB_URL}` with no runtime fallback — `npm run serve` overrides `PROTOCOL` to `http` so the same code works against a local, non-TLS PocketBase instance.

## Local development

The scripts and webpage can be run against a local PocketBase instance for testing, without needing a real Apache/Docker/certbot host.

**You must install and run PocketBase yourself** — it is not bundled or managed by this repo. Download it from [pocketbase.io](https://pocketbase.io/) and start it so it's listening on `127.0.0.1:8090`. You'll also need to:
- Create a superuser account (via the PocketBase admin UI at `http://127.0.0.1:8090/_/`) — `generate-host.js` and `delete-host.js` authenticate as this superuser.
- Create the `hosts`, `animals`, and `adjectives` collections that the scripts read from and write to.
- Allow public List/View API access on the `hosts` collection, since the admin webpage queries it without authenticating.

`ENVIRONMENT=dev` (set via `scripts/.env`, see below) skips steps that only make sense on the real server: `delete-host.js` will skip removing the Apache site/SSL cert/Docker container, and `generateApacheDirective` will log the virtual host config to the console instead of writing it to `/etc/apache2/sites-available/`.

```bash
npm run generate-host -- <repo>
npm run delete-host -- <repo>
npm run serve   # serves the admin webpage against the local PocketBase instance
```

### `.env` setup

`generate-host.js` and `delete-host.js` need a PocketBase superuser email and password, plus `ENVIRONMENT=dev` for local testing. They look for `/root/scripts/.env` first (the production server path), falling back to `./scripts/.env` for local development. Create `scripts/.env`:

```
EMAIL=your-superuser-email
PASSWORD=your-superuser-password
ENVIRONMENT=dev
```

This file is gitignored and never committed.
