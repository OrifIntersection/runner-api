import PocketBase from "pocketbase";
import { listHosts } from "../webpage_modules/listHosts";
import { authForm } from "../webpage_modules/authForm";

let protocol = "https://";

let pb = new PocketBase(`${protocol}${WEB_URL}`);
try {
	await pb.health.check();
} catch (err) {
	console.log("SSL connection to pocketbase impossible, switching to HTTP.");
	console.log(
		"Note that if you are running in a local dev environment, you will have to setup PocketBase correctly: http://127.0.0.1:8090/_",
	);
	console.log(
		"This involves allowing non-superuser access to HTTP/GET the host collection.",
	);
	let protocol = "http://";
	pb = new PocketBase(`${protocol}${WEB_URL}`);
}

const hosts = await pb.collection("hosts").getFullList({
	sort: "-created",
});

listHosts(hosts);
authForm();
