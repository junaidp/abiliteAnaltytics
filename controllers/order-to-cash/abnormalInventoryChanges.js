import { client } from "../../client/index.js";

const abnormalInventoryChanges = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const collection = db.collection("Inventory Changes.xlsx");

    const pipeline = [
      { $sort: { Item: 1, Date: 1 } },
      {
        $setWindowFields: {
          partitionBy: "$Item",
          sortBy: { Date: 1 },
          output: {
            prev_quantity: { $shift: { by: -1, output: "$Quantity" } },
          },
        },
      },
      {
        $addFields: {
          deviation_percentage: {
            $cond: {
              if: { $ne: ["$prev_quantity", null] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$Quantity", "$prev_quantity"] },
                      {
                        $cond: {
                          if: { $eq: ["$prev_quantity", 0] },
                          then: null,
                          else: "$prev_quantity",
                        },
                      },
                    ],
                  },
                  100,
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $match: {
          deviation_percentage: { $exists: true, $ne: null },
          $expr: { $gt: [{ $abs: "$deviation_percentage" }, 50] },
        },
      },
      {
        $project: {
          _id: 0,
          Item: 1,
          Date: 1,
          Quantity: 1,
          Prev_Quantity: "$prev_quantity",
          Deviation_Percentage: { $round: ["$deviation_percentage", 2] },
        },
      },
    ];

    const abnormalInventoryChanges = await collection
      .aggregate(pipeline)
      .toArray();
    res.json(abnormalInventoryChanges);
  } catch (error) {
    console.error("Error fetching abnormal inventory changes:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve abnormal inventory changes" });
  } finally {
    await client.close();
  }
};

export { abnormalInventoryChanges };
