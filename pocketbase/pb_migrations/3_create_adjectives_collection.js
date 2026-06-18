/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			name: "adjectives",
			type: "base",
			fields: [{ name: "adjective", type: "text", required: true }],
		});

		app.save(collection);

		// 36 entries, matching the 36 x 36 = 1296 combination count assumed by
		// generateName/hostHandler.js, so collision behavior is realistic locally.
		const adjectives = [
			"swift", "brave", "clever", "mighty", "silent", "gentle",
			"fierce", "bold", "calm", "wild", "curious", "lucky",
			"quiet", "sharp", "bright", "shadow", "golden", "silver",
			"crimson", "azure", "emerald", "frozen", "blazing", "rusty",
			"cosmic", "lunar", "solar", "hidden", "ancient", "rapid",
			"nimble", "sturdy", "vivid", "jolly", "gallant", "daring",
		];

		for (const adjective of adjectives) {
			const record = new Record(collection);
			record.set("adjective", adjective);
			app.save(record);
		}
	},
	(app) => {
		const collection = app.findCollectionByNameOrId("adjectives");
		app.delete(collection);
	},
);
