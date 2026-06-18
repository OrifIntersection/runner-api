const { execSync } = require("child_process");
const fs = require("fs");

function generateApacheDirective(name, port, repo) {
	const directive = `<VirtualHost *:80>
	    ServerName ${name}.${WEB_URL}

	    ProxyPreserveHost On
	    ProxyPass / http://127.0.0.1:${port}/
	    ProxyPassReverse / http://127.0.0.1:${port}/
    </VirtualHost>`;
	if (process.env.ENVIRONMENT === "dev") console.log(directive);
	else fs.writeFileSync(`/etc/apache2/sites-available/${repo}.conf`, directive);
}

function generateName(animals, adjectives, usedNames) {
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

function generatePort() {
	// ss (Linux-only) isn't available on a typical dev machine, and locally
	// there's nothing real bound to any port to check against anyway — the
	// goal in dev is just exercising the generate-host.js/PocketBase flow.
	if (process.env.ENVIRONMENT === "dev") {
		return 1024 + Math.floor(Math.random() * (65535 - 1024 + 1));
	}

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

module.exports = { generateApacheDirective, generateName, generatePort };
