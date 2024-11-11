import { client } from "../../client/index.js";

const unusualOrderAmounts = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const ordersCollection = db.collection("Orders Discount");

    const avgPipeline = [
      {
        $group: {
          _id: null,
          avgOrderAmount: { $avg: "$Order_Amount" },
        },
      },
    ];

    const avgResult = await ordersCollection.aggregate(avgPipeline).toArray();
    const avgOrderAmount = avgResult[0]?.avgOrderAmount;

    if (!avgOrderAmount) {
      return res.status(404).json({ error: "No order amounts found" });
    }

    const filterPipeline = [
      {
        $match: {
          $or: [
            { Order_Amount: { $gt: 1.5 * avgOrderAmount } },
            { Order_Amount: { $lt: 0.5 * avgOrderAmount } },
          ],
        },
      },
      {
        $sort: { Order_Amount: -1 },
      },
      {
        $project: {
          _id: 0,
          Order_ID: 1,
          Order_Amount: 1,
        },
      },
    ];

    const result = await ordersCollection.aggregate(filterPipeline).toArray();

    res.json(result);
  } catch (error) {
    console.error("Error fetching unusual order amounts:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve unusual order amounts data" });
  } finally {
    await client.close();
  }
};

export { unusualOrderAmounts };
