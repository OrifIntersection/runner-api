import PocketBase from "pocketbase";
import { execSync } from "child_process";

export default class DBHandler extends PocketBase {
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
		//
		// !!! ------- the actual database entry for the host is deleted via deleteOne ------- !!!
		//

		// this function is unique, as it has to run multiple shell scripts on the server itself
		// this means: removing the SSL cert, deleting the apache directives, and deleting the docker container and image

		execSync(`sudo a2dissite ${host.repo} ${host.repo}-le-ssl`);
		execSync(
			`sudo rm /etc/apache2/sites-available/${host.repo}.conf /etc/apache2/sites-available/${host.repo}-le-ssl.conf`,
		);
		execSync(`docker stop ${host.name}-container`);
		execSync(`docker rm ${host.name}-container`);
		execSync(`docker rmi ${host.name}-image`);
		execSync(`certbot delete --cert-name ${host.name}.${WEB_URL}`, {
			stdio: ["pipe", "inherit", "inherit"],
			input: "y\n",
		});
		execSync("apache2ctl restart");
	}
}
