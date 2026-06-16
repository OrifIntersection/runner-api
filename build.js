import * as esbuild from "esbuild";

const defines = {
	dev: { WEB_URL: '"is-dev.applications.ws"', PROTOCOL: "https" },
	prod: { WEB_URL: '"is-prod.applications.ws"', PROTOCOL: "https" }, // update as needed
};

const builds = [
	// Scripts
	{
		entryPoints: ["scripts/delete-host.js", "scripts/generate-host.js"],
		format: "esm",
		bundle: true,
		packages: "external",
		outdir: "build/dev/scripts",
		define: defines.dev,
	},
	{
		entryPoints: ["scripts/delete-host.js", "scripts/generate-host.js"],
		format: "esm",
		bundle: true,
		packages: "external",
		outdir: "build/prod/scripts",
		define: defines.prod,
	},
	// Web
	{
		entryPoints: [
			"webpage/index.js",
			"webpage/index.html",
			"webpage/styles.css",
		],
		format: "esm",
		bundle: true,
		minify: true,
		outdir: "build/dev/pb/pb_public",
		define: defines.dev,
		loader: {
			".html": "copy",
			".css": "copy",
		},
	},
	{
		entryPoints: [
			"webpage/index.js",
			"webpage/index.html",
			"webpage/styles.css",
		],
		format: "esm",
		bundle: true,
		minify: true,
		outdir: "build/prod/pb/pb_public",
		define: defines.prod,
		loader: {
			".html": "copy",
			".css": "copy",
		},
	},
];

const results = await Promise.all(builds.map((b) => esbuild.build(b)));
console.log(`Built ${results.length} bundles.`);
