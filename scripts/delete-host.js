import DBHandler from "../script_modules/DBHandler.js";
import dotenv from "dotenv";
let result = dotenv.config({ path: "/root/scripts/.env" });
if (result.error) result = dotenv.config({ path: "./scripts/.env" });
if (result.error) throw new Error("No .env file found.");
if (!process.env.PASSWORD)
	throw new Error("No PASSWORD set for pocketbase in .env");
if (!process.env.EMAIL) throw new Error("No EMAIL set for pocketbase in .env");

const repo = process.argv[2];
if (!repo)
	throw new Error(
		"A repo name must be provided to the script in order to delete a host.",
	);

const db = new DBHandler("http://127.0.0.1:8090");
try {
	await db.health.check();
} catch (err) {
	throw new Error(
		"No connection to PocketBase on localhost:8090, are you running an instance of PocketBase locally?",
	);
}

await db.initAuth(process.env.EMAIL, process.env.PASSWORD);
const existingHost = await db.getOne("hosts", `repo="${repo}"`);

if (!existingHost) throw new Error(`Repo name ${repo} was not found!`);

if (process.env.ENVIRONMENT === "dev") {
	console.log(
		"Deleting host metadata is not possible in a local dev environment.",
	);
} else {
	await db.deleteHostMetadata(existingHost);
}

await db.deleteOne("hosts", existingHost.id);

process.exit(0);
