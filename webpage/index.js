import PocketBase from "pocketbase";
import { listHosts } from "../webpage_modules/listHosts";
import { authForm } from "../webpage_modules/authForm";

const pb = new PocketBase(`https://${WEB_URL}`);
const hosts = await pb.collection("hosts").getFullList({
	sort: "-created",
});

listHosts(hosts);
authForm();
