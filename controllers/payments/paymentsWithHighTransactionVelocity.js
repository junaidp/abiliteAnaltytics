import { client } from "../../client/index.js";

const paymentsWithHighTransactionVelocity = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsVelocityCollection = db.collection("Payments Velocity");

    const pipeline = [
      {
        $group: {
          _id: { CustomerID: "$CustomerID", PaymentDate: "$PaymentDate" },
          TransactionCount: { $sum: 1 },
        },
      },
      {
        $match: {
          TransactionCount: { $gt: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          CustomerID: "$_id.CustomerID",
          PaymentDate: "$_id.PaymentDate",
          TransactionCount: 1,
        },
      },
      {
        $sort: {
          CustomerID: 1,
          PaymentDate: 1,
        },
      },
    ];

    const results = await paymentsVelocityCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching daily transaction counts:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve daily transaction counts" });
  } finally {
    await client.close();
  }
};

export { paymentsWithHighTransactionVelocity };
