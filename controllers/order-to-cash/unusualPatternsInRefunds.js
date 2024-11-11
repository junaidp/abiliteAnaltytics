import { client } from "../../client/index.js";

const unusualPatternsInRefunds = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const refundsCollection = db.collection("Refunds");

    const pipeline = [
      {
        $group: {
          _id: "$Order_ID",
          Refund_Count: { $sum: 1 },
          Total_Refund_Amount: { $sum: "$Refund_Amount" },
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                Avg_Refund_Count: { $avg: "$Refund_Count" },
                Avg_Total_Refund_Amount: { $avg: "$Total_Refund_Amount" },
              },
            },
          ],
          detailedData: [
            {
              $project: {
                Order_ID: "$_id",
                Refund_Count: 1,
                Total_Refund_Amount: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$summary" },
      { $unwind: "$detailedData" },
      {
        $addFields: {
          "detailedData.Refund_Status": {
            $cond: {
              if: {
                $or: [
                  {
                    $gt: [
                      "$detailedData.Refund_Count",
                      { $multiply: ["$summary.Avg_Refund_Count", 2] },
                    ],
                  },
                  {
                    $gt: [
                      "$detailedData.Total_Refund_Amount",
                      { $multiply: ["$summary.Avg_Total_Refund_Amount", 2] },
                    ],
                  },
                ],
              },
              then: {
                $cond: [
                  {
                    $gt: [
                      "$detailedData.Refund_Count",
                      { $multiply: ["$summary.Avg_Refund_Count", 2] },
                    ],
                  },
                  "High Refund Frequency",
                  "Abnormally High Refund Amount",
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$detailedData" },
      },
      {
        $match: { Refund_Status: { $ne: null } },
      },
      {
        $sort: { Refund_Status: -1 },
      },
    ];

    const result = await refundsCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching unusual patterns in refunds:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve unusual patterns in refunds data" });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInRefunds };
