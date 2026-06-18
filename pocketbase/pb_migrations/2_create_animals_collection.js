/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			name: "animals",
			type: "base",
			fields: [{ name: "animal", type: "text", required: true }],
		});

		app.save(collection);

		// 36 entries, matching the 36 x 36 = 1296 combination count assumed by
		// generateName/hostHandler.js, so collision behavior is realistic locally.
		const animals = [
			"fox", "bear", "wolf", "eagle", "hawk", "owl",
			"lion", "tiger", "panther", "otter", "beaver", "badger",
			"raccoon", "squirrel", "rabbit", "deer", "elk", "moose",
			"bison", "falcon", "raven", "crow", "heron", "crane",
			"swan", "dolphin", "whale", "shark", "octopus", "turtle",
			"lizard", "gecko", "cobra", "viper", "panda", "koala",
		];

		for (const animal of animals) {
			const record = new Record(collection);
			record.set("animal", animal);
			app.save(record);
		}
	},
	(app) => {
		const collection = app.findCollectionByNameOrId("animals");
		app.delete(collection);
	},
);
