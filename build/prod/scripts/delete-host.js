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
    if (list.length === 0) return null;
    else return list[0];
  }
  async postOne(collection, data) {
    if (!collection)
      throw new Error("A collection must be specified for postOne");
    if (!data) throw new Error("Data must be specified for postOne");
    await this.collection(collection).create(data);
  }
  async deleteOne(collection, id) {
    this.collection(collection).delete(id);
  }
  async deleteHostMetadata(host) {
    execSync(`sudo a2dissite ${host.repo} ${host.repo}-le-ssl`);
    execSync(
      `sudo rm /etc/apache2/sites-available/${host.repo}.conf /etc/apache2/sites-available/${host.repo}-le-ssl.conf`
    );
    execSync(`docker stop ${host.name}-container`);
    execSync(`docker rm ${host.name}-container`);
    execSync(`docker rmi ${host.name}-image`);
    execSync(`certbot delete --cert-name ${host.name}.is-dev.applications.ws`, {
      stdio: ["pipe", "inherit", "inherit"],
      input: "y\n"
    });
    execSync("apache2ctl restart");
  }
};

// scripts/delete-host.js
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "/root/scripts/.env" });
var repo = process.argv[2];
var db = new DBHandler("http://127.0.0.1:8090");
await db.initAuth("ljhaesler@protonmail.com", process.env.PASSWORD);
var existingHost = await db.getOne("hosts", `repo="${repo}"`);
if (!existingHost) throw new Error(`Repo name ${repo} was not found!`);
await db.deleteHostMetadata(existingHost);
await db.deleteOne("host", existingHost.id);
process.exit(0);
