import DBHandler from "../script_modules/DBHandler.js";
import PASSWORD from "./PASSWORD.js";

const repo = process.argv[2];
const db = new DBHandler("http://127.0.0.1:8090");

await db.initAuth("ljhaesler@protonmail.com", PASSWORD);
const existingHost = await db.getOne("hosts", `repo="${repo}"`);

if (!existingHost) throw new Error(`Repo name ${repo} was not found!`);

await db.deleteHostMetadata(existingHost);
await db.deleteOne("host", existingHost.id);

process.exit(0);
