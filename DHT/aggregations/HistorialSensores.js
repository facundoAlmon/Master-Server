db.dhtvalues.aggregate(
	[
		{
			$match: {
			}
		},

		// Stage 2
		{
			$group: {
				_id: "$tipo",
				valores: { $push: "$valor" },
				date: { $push: "$date" }
			}
		}

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
