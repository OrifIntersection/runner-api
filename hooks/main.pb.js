onRecordDelete((e) => {
	if ($os.getenv("ENVIRONMENT") !== "dev") {
		const repo = e.record.get("repo");
		const name = e.record.get("name");
		const webUrl = $os.getenv("RUNNER_URL");

		try {
			$os.exec("sudo", "a2dissite", repo, `${repo}-le-ssl`).run();
		} catch {
			console.warn(`${repo}-le-ssl could not be disabled`);
		}

		try {
			$os.exec("sudo", "rm", `/etc/apache2/sites-available/${repo}.conf`).run();
		} catch {
			console.warn(`${repo} site config file could not be removed`);
		}

		try {
			$os
				.exec("sudo", "rm", `/etc/apache2/sites-available/${repo}-le-ssl.conf`)
				.run();
		} catch {
			console.warn(`${repo} site config file could not be removed`);
		}

		try {
			$os.exec("docker", "stop", `${name}-container`).run();
		} catch {
			console.warn(`${name}-container could not be stopped`);
		}

		try {
			$os.exec("docker", "rm", `${name}-container`).run();
		} catch {
			console.warn(`${name}-container could not be removed`);
		}

		try {
			$os.exec("docker", "rmi", `${name}-image`).run();
		} catch {
			console.warn(`${name}-image could not be removed`);
		}

		try {
			$os
				.exec(
					"certbot",
					"delete",
					"--cert-name",
					`${name}.${webUrl}`,
					"--non-interactive",
				)
				.run();
		} catch {
			console.warn(`Certificate for ${name}.${webUrl} could not be deleted`);
		}

		try {
			$os.exec("apache2ctl", "restart").run();
		} catch {
			console.warn("apache2ctl could not be restarted");
		}
	} else {
		console.log("Host metadata cannot be deleted in a dev environment.");
	}
	e.next();
}, "hosts");

// these hooks will be built into a pb_hooks/ directory, that pocketbase will run
// this allows to extend pocketbase logic via javascript
// this is essentially the same logic as express middleware
// see the docs here: https://pocketbase.io/docs/js-overview/

// onRecordCreate((e) => {
// 	// if ($os.getenv("ENVIRONMENT") !== "dev") {
// 	// 	const repo = e.record.get("repo"); // already unique
// 	// 	const name = e.record.get("name"); // ^
// 	// 	const port = e.record.get("port"); // ^
// 	// 	const template = e.record.get("template");
// 	// 	let cert = "false";
// 	// 	if (e.record.get("certDate") === null) cert = "true";

// 	// 	$http.send({
// 	// 		method: "POST",
// 	// 		url: `https://api.github.com/repos/OrifIntersection/actions/workflows/deploy-site-dispatch.yml/dispatches`,
// 	// 		headers: {
// 	// 			Authorization: `Bearer ${$os.getenv("RUNNER_TOKEN")}`,
// 	// 			Accept: "application/vnd.github+json",
// 	// 		},
// 	// 		body: JSON.stringify({
// 	// 			ref: "main",
// 	// 			inputs: { name, repo, template, cert, port: String(port) },
// 	// 		}),
// 	// 	});
// 	// } else {
// 	// 	console.log("A real host website cannot be deployed in a dev environment.");
// 	// }
// 	//

// 	e.next();
// }, "hosts");
