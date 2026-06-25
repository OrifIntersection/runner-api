import PocketBase from "pocketbase";
import { listHosts } from "./modules/listHosts";
import { authForm } from "./modules/authForm";

let pb = new PocketBase(`${PROTOCOL}://${WEB_URL}`);

try {
	await pb.health.check();
} catch (err) {
	console.error(
		"ERROR: if you are running in a local dev environment, you will have to setup PocketBase correctly: http://127.0.0.1:8090/_",
	);
	console.error(
		"This involves allowing non-superuser access to HTTP/GET the host collection.",
	);
	throw new Error("Connection to pocketbase failed");
}

const hosts = await pb.collection("hosts").getFullList({
	sort: "-created",
});

listHosts(hosts, pb);
authForm(pb);
