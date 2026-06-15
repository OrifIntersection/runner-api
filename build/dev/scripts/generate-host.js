// scripts/generate-host.js
import fs2 from "fs";

// script_modules/hostHandler.js
import { execSync } from "child_process";
import fs from "fs";
function generateApacheDirective(name, port, repo2) {
  const directive = `<VirtualHost *:80>
	    ServerName ${name}.${"is-dev.applications.ws"}

	    ProxyPreserveHost On
	    ProxyPass / http://127.0.0.1:${port}/
	    ProxyPassReverse / http://127.0.0.1:${port}/
    </VirtualHost>`;
  fs.writeFileSync(`/etc/apache2/sites-available/${repo2}.conf`, directive);
}
function generateName(animals2, adjectives2, usedNames2) {
  let exists = true;
  let name;
  while (exists) {
    const adjI = Math.floor(Math.random() * adjectives2.length);
    const animI = Math.floor(Math.random() * animals2.length);
    name = `${adjectives2[adjI]}${animals2[animI]}`;
    exists = usedNames2.includes(name);
  }
  return name;
}
function generatePort() {
  try {
    const usedPorts = getUsedPorts();
    for (let port = 1024; port <= 65535; port++) {
      if (!usedPorts.includes(port)) {
        return port;
      }
    }
    throw new Error("No available ports found in the specified range");
  } catch (err) {
    throw new Error(err);
  }
}
function getUsedPorts() {
  try {
    const output = execSync("ss -tuln", { encoding: "utf8" });
    const ports = [];
    output.split("\n").forEach((line) => {
      const match = line.match(/:(\d+)\s/);
      if (match) {
        ports.push(parseInt(match[1]));
      }
    });
    return ports;
  } catch (err) {
    throw new Error(err);
  }
}

// script_modules/DBHandler.js
import PocketBase from "pocketbase";
import { execSync as execSync2 } from "child_process";
var DBHandler = class extends PocketBase {
  constructor(url) {
    super(url);
  }
  async initAuth(email, pass) {
    this.collection("_superusers").authWithPassword(email, pass);
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
    execSync2(`sudo a2dissite ${host.repo} ${host.repo}-le-ssl`);
    execSync2(
      `sudo rm /etc/apache2/sites-available/${host.repo}.conf /etc/apache2/sites-available/${host.repo}-le-ssl.conf`
    );
    execSync2(`docker stop ${host.name}-container`);
    execSync2(`docker rm ${host.name}-container`);
    execSync2(`docker rmi ${host.name}-image`);
    execSync2(`certbot delete --cert-name ${host.name}.is-dev.applications.ws`, {
      stdio: ["pipe", "inherit", "inherit"],
      input: "y\n"
    });
    execSync2("apache2ctl restart");
  }
};

// scripts/generate-host.js
import PASSWORD from "./PASSWORD.js";
var db = new DBHandler("http://127.0.0.1:8090");
await db.initAuth("ljhaesler@protonmail.com", PASSWORD);
var repo = process.argv[2];
var hostsList = await db.getAll("hosts");
var existingHost = await db.getOne("hosts", `repo="${repo}"`);
var animalsList = await db.collection("animals").getFullList();
var adjectivesList = await db.collection("adjectives").getFullList();
var animals = animalsList.map((el) => el.animal);
var adjectives = adjectivesList.map((el) => el.adjective);
var usedNames = hostsList.map((el) => el.name);
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
    fs2.appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
  } else {
    console.log(
      JSON.stringify({
        name,
        port,
        cert
      })
    );
  }
} catch (err) {
  console.error(err);
}
