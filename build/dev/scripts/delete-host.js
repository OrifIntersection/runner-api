// script_modules/DBHandler.js
import PocketBase from "pocketbase";
import { execSync } from "child_process";
var DBHandler = class extends PocketBase {
  constructor(url) {
    super(url);
  }
  async initAuth(email, pass) {
    await this.collection("_superusers").authWithPassword(email, pass);
  }
  async getAll(collection) {
    if (!collection)
      throw new Error("A collection must be specified for getAll");
    return await this.collection(collection).getFullList();
  }
  async getOne(collection, filter) {
    if (!collection)
      throw new Error("A collection must be specified for getOne");
    if (!filter) throw new Error("A filter must be specified for getOne");
    const list = await this.collection(collection).getList(1, 1, { filter });
    if (list.items.length === 0) return null;
    else return list.items[0];
  }
  async postOne(collection, data) {
    if (!collection)
      throw new Error("A collection must be specified for postOne");
    if (!data) throw new Error("Data must be specified for postOne");
    await this.collection(collection).create(data);
  }
  async deleteOne(collection, id) {
    await this.collection(collection).delete(id);
  }
  async deleteHostMetadata(host) {
    execSync(`sudo a2dissite ${host.repo} ${host.repo}-le-ssl`);
    execSync(
      `sudo rm /etc/apache2/sites-available/${host.repo}.conf /etc/apache2/sites-available/${host.repo}-le-ssl.conf`
    );
    execSync(`docker stop ${host.name}-container`);
    execSync(`docker rm ${host.name}-container`);
    execSync(`docker rmi ${host.name}-image`);
    execSync(`certbot delete --cert-name ${host.name}.${"is-dev.applications.ws"}`, {
      stdio: ["pipe", "inherit", "inherit"],
      input: "y\n"
    });
    execSync("apache2ctl restart");
  }
};

// scripts/delete-host.js
import dotenv from "dotenv";
var result = dotenv.config({ path: "/root/scripts/.env" });
if (result.error) result = dotenv.config({ path: "./scripts/.env" });
if (result.error) throw new Error("No .env file found.");
if (!process.env.PASSWORD)
  throw new Error("No PASSWORD set for pocketbase in .env");
if (!process.env.EMAIL) throw new Error("No EMAIL set for pocketbase in .env");
var repo = process.argv[2];
if (!repo)
  throw new Error(
    "A repo name must be provided to the script in order to delete a host."
  );
var db = new DBHandler("http://127.0.0.1:8090");
try {
  await db.health.check();
} catch (err) {
  throw new Error(
    "No connection to PocketBase on localhost:8090, are you running an instance of PocketBase locally?"
  );
}
await db.initAuth(process.env.EMAIL, process.env.PASSWORD);
var existingHost = await db.getOne("hosts", `repo="${repo}"`);
if (!existingHost) throw new Error(`Repo name ${repo} was not found!`);
if (process.env.ENVIRONMENT === "dev") {
  console.log(
    "Deleting host metadata is not possible in a local dev environment."
  );
} else {
  await db.deleteHostMetadata(existingHost);
}
await db.deleteOne("hosts", existingHost.id);
process.exit(0);
