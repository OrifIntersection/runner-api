import * as esbuild from "esbuild";

const [, , target] = process.argv;

export const defines = {
	dev: { WEB_URL: '"is-dev.applications.ws"', PROTOCOL: '"https"' },
	prod: { WEB_URL: '"is-prod.applications.ws"', PROTOCOL: '"https"' }, // update as needed
	local: { WEB_URL: '"127.0.0.1:8090"', PROTOCOL: '"http"' },
};

const webEntryPoints = [
	"webpage/index.js",
	"webpage/index.html",
	"webpage/styles.css",
];

const hookEntryPoint = ["hooks/main.pb.js"];
const webLoader = { ".html": "copy", ".css": "copy" };

async function buildRemote() {
	const builds = [
		{
			entryPoints: webEntryPoints,
			format: "esm",
			bundle: true,
			minify: true,
			outdir: "build/dev/pb/pb_public",
			define: defines.dev,
			loader: webLoader,
		},
		{
			entryPoints: webEntryPoints,
			format: "esm",
			bundle: true,
			minify: true,
			outdir: "build/prod/pb/pb_public",
			define: defines.prod,
			loader: webLoader,
		},
		{
			entryPoints: hookEntryPoint,
			format: "esm",
			bundle: true,
			minify: true,
			outdir: "build/dev/pb/pb_hooks",
			define: defines.dev,
			loader: webLoader,
		},
		{
			entryPoints: hookEntryPoint,
			format: "esm",
			bundle: true,
			minify: true,
			outdir: "build/prod/pb/pb_hooks",
			define: defines.prod,
			loader: webLoader,
		},
	];
	const results = await Promise.all(builds.map((b) => esbuild.build(b)));
	console.log(`Built ${results.length} bundles.`);
}

async function buildLocal() {
	const builds = [
		{
			entryPoints: webEntryPoints,
			format: "esm",
			bundle: true,
			outdir: "pocketbase/pb_public",
			define: defines.local,
			loader: webLoader,
		},
		{
			entryPoints: hookEntryPoint,
			format: "esm",
			bundle: true,
			outdir: "pocketbase/pb_hooks",
			define: defines.local,
		},
	];
	const results = await Promise.all(builds.map((b) => esbuild.build(b)));
	console.log(`Built ${results.length} bundles.`);
}

switch (target) {
	case "build-remote":
		await buildRemote();
		break;
	case "build-local":
		await buildLocal();
		break;
	default:
		console.error(
			`Unknown target "${target}". Expected one of: build-remote, build-local`,
		);
		process.exit(1);
}
