const fs = require("fs");
const {
	generatePort,
	generateName,
	generateApacheDirective,
} = require("./modules/hostHandler.cjs");
const DBHandler = require("./modules/DBHandler.cjs");
const dotenv = require("dotenv");

let result = dotenv.config({ path: "/root/scripts/.env" });
if (result.error) result = dotenv.config({ path: "./scripts/.env" });
if (result.error) throw new Error("No .env file found.");
if (!process.env.PASSWORD)
	throw new Error("No PASSWORD set for pocketbase in .env");
if (!process.env.EMAIL) throw new Error("No EMAIL set for pocketbase in .env");

const repo = process.argv[2];
if (!repo)
	throw new Error(
		"A repo name must be provided to the script in order to generate a host.",
	);

(async () => {
	const db = new DBHandler("http://127.0.0.1:8090");
	try {
		await db.health.check();
	} catch (err) {
		throw new Error(
			"No connection to PocketBase on localhost:8090, are you running an instance of PocketBase locally?",
		);
	}

	await db.initAuth(process.env.EMAIL, process.env.PASSWORD);

	const hostsList = await db.getAll("hosts");
	const existingHost = await db.getOne("hosts", `repo="${repo}"`);

	const animalsList = await db.collection("animals").getFullList();
	const adjectivesList = await db.collection("adjectives").getFullList();

	const animals = animalsList.map((el) => el.animal);
	const adjectives = adjectivesList.map((el) => el.adjective);
	const usedNames = hostsList.map((el) => el.name);

	try {
		let name;
		let port;
		let cert = "false";

		if (existingHost) {
			name = existingHost.name;
			port = existingHost.port;
		} else {
			name = generateName(animals, adjectives, usedNames);
			port = generatePort();
			await db.postOne("hosts", { name, port, repo });
			generateApacheDirective(name, port, repo);
			cert = "true";
		}

		if (process.env.GITHUB_OUTPUT) {
			const lines = [`domain-name=${name}`, `port=${port}`, `cert=${cert}`];
			fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
		} else {
			console.log(
				JSON.stringify({
					name,
					port,
					cert,
				}),
			);
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
})().catch((err) => {
	console.error(err);
	process.exit(1);
});
