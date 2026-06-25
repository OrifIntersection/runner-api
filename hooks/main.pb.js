onRecordDelete((e) => {
	if ($os.getenv("ENVIRONMENT") !== "dev") {
		const repo = e.record.get("repo");
		const name = e.record.get("name");
		const webUrl = $os.getenv("RUNNER_URL");

		$os.exec("sudo", "a2dissite", repo, `${repo}-le-ssl`).run();
		$os
			.exec(
				"sudo",
				"rm",
				`/etc/apache2/sites-available/${repo}.conf`,
				`/etc/apache2/sites-available/${repo}-le-ssl.conf`,
			)
			.run();
		$os.exec("docker", "stop", `${name}-container`).run();
		$os.exec("docker", "rm", `${name}-container`).run();
		$os.exec("docker", "rmi", `${name}-image`).run();
		$os
			.exec(
				"certbot",
				"delete",
				"--cert-name",
				`${name}.${webUrl}`,
				"--non-interactive",
			)
			.run();
		$os.exec("apache2ctl", "restart").run();
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
