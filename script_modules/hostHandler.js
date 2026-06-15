import { execSync } from "child_process";
import fs from "fs";

export function generateApacheDirective(name, port, repo) {
	const directive = `<VirtualHost *:80>
	    ServerName ${name}.${WEB_URL}

	    ProxyPreserveHost On
	    ProxyPass / http://127.0.0.1:${port}/
	    ProxyPassReverse / http://127.0.0.1:${port}/
    </VirtualHost>`;

	fs.writeFileSync(`/etc/apache2/sites-available/${repo}.conf`, directive);
}

export function generateName(animals, adjectives, usedNames) {
	let exists = true;
	let name;
	while (exists) {
		// a total of 1296 domains are possible with these animal-adjective combinations
		// this find algorithm gets exponentially worse once 650 of the possible names are used
		// But it remains the most efficient way to get random names
		// insofar as there are under 650 total domain names.
		const adjI = Math.floor(Math.random() * adjectives.length);
		const animI = Math.floor(Math.random() * animals.length);

		name = `${adjectives[adjI]}${animals[animI]}`;
		exists = usedNames.includes(name);
	}

	return name;
}

export function generatePort() {
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
