/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			name: "hosts",
			type: "base",
			fields: [
				{ name: "name", type: "text", required: true },
				{ name: "port", type: "number", required: true },
				{ name: "repo", type: "text", required: true },
				{ name: "certDate", type: "date" },
				// webpage/index.js sorts by -created
				{ name: "created", type: "autodate", onCreate: true },
				{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
			],
			// public read access: the admin webpage lists hosts before authenticating
			listRule: "",
			viewRule: "",
		});

		app.save(collection);

		const record = new Record(collection);
		record.set("name", "test-URL");
		record.set("port", "1234");
		record.set("repo", "test-repo");
		app.save(record);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId("hosts");
		app.delete(collection);
	},
);
