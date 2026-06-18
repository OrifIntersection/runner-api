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
	},
	(app) => {
		const collection = app.findCollectionByNameOrId("hosts");
		app.delete(collection);
	},
);
