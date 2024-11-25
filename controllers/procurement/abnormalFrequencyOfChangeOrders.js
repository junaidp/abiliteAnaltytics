import { client } from "../../client/index.js";

const abnormalFrequencyOfChangeOrders = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const purchaseOrdersCollection = db.collection("Purchase Orders");

    const results = await purchaseOrdersCollection
      .aggregate([
        {
          $match: {
            Order_Type: "Change Order",
          },
        },
        {
          $group: {
            _id: "$Project_ID",
            ChangeOrderCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            AverageChangeOrderCount: { $avg: "$ChangeOrderCount" },
            ChangeOrderCounts: {
              $push: {
                Project_ID: "$_id",
                ChangeOrderCount: "$ChangeOrderCount",
              },
            },
          },
        },
        {
          $unwind: "$ChangeOrderCounts",
        },
        {
          $match: {
            $expr: {
              $gt: [
                "$ChangeOrderCounts.ChangeOrderCount",
                "$AverageChangeOrderCount",
              ],
            },
          },
        },
        {
          $project: {
            Project_ID: "$ChangeOrderCounts.Project_ID",
            ChangeOrderCount: "$ChangeOrderCounts.ChangeOrderCount",
            AverageChangeOrderCount: "$AverageChangeOrderCount",
          },
        },
        {
          $sort: { Project_ID: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching abnormal frequency of change orders:", error);
    res.status(500).json({
      error: "Failed to retrieve abnormal frequency of change orders",
    });
  } finally {
    await client.close();
  }
};

export { abnormalFrequencyOfChangeOrders };
