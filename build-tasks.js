import * as esbuild from "esbuild";
import { spawn } from "child_process";

const [, , target, repo] = process.argv;

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
const webLoader = { ".html": "copy", ".css": "copy" };
const scriptEntryPoints = [
	"scripts/delete-host.js",
	"scripts/generate-host.js",
];

async function buildRemote() {
	const builds = [
		{
			entryPoints: scriptEntryPoints,
			format: "esm",
			bundle: true,
			minify: true,
			platform: "node",
			outdir: "build/dev/scripts",
			define: defines.dev,
		},
		{
			entryPoints: scriptEntryPoints,
			format: "esm",
			bundle: true,
			minify: true,
			platform: "node",
			outdir: "build/prod/scripts",
			define: defines.prod,
		},
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
	];
	const results = await Promise.all(builds.map((b) => esbuild.build(b)));
	console.log(`Built ${results.length} bundles.`);
}

async function buildPbPublic() {
	const options = {
		entryPoints: webEntryPoints,
		format: "esm",
		bundle: true,
		outdir: "pocketbase/pb_public",
		define: defines.local,
		loader: webLoader,
	};

	esbuild.build(options);
}

async function runNodeScript(entryPoint) {
	const result = await esbuild.build({
		entryPoints: [entryPoint],
		format: "esm",
		bundle: true,
		platform: "node",
		packages: "external",
		define: { WEB_URL: defines.local.WEB_URL },
		write: false,
	});
	const nodeProc = spawn("node", ["--input-type=module", "-", repo], {
		stdio: ["pipe", "inherit", "inherit"],
	});
	nodeProc.stdin.write(result.outputFiles[0].text);
	nodeProc.stdin.end();
	nodeProc.on("exit", (code) => process.exit(code ?? 0));
}

switch (target) {
	case "remote":
		await buildRemote();
		break;
	case "build-pb-public":
		await buildPbPublic();
		break;
	case "generate-host":
		await runNodeScript("scripts/generate-host.js");
		break;
	case "delete-host":
		await runNodeScript("scripts/delete-host.js");
		break;
	default:
		console.error(
			`Unknown target "${target}". Expected one of: remote, build-pb-public, generate-host, delete-host`,
		);
		process.exit(1);
}
