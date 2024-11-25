import { client } from "../../client/index.js";

const paymentsOutsideStandardBusinessHours = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsCollection = db.collection("Payments Time");

    const pipeline = [
      {
        $addFields: {
          Payment_Status: {
            $cond: {
              if: {
                $or: [
                  { $lt: ["$TransactionTime", "09:00:00"] },
                  { $gt: ["$TransactionTime", "18:00:00"] },
                ],
              },
              then: "Payment Made During Non-Business Hours",
              else: "Payment Made During Business Hours",
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { TransactionTime: { $lt: "09:00:00" } },
            { TransactionTime: { $gt: "18:00:00" } },
          ],
        },
      },
      {
        $project: {
          TransactionID: 1,
          AccountID: 1,
          TransactionDate: 1,
          TransactionTime: 1,
          TransactionAmount: 1,
          Payment_Status: 1,
        },
      },
    ];

    const results = await paymentsCollection.aggregate(pipeline).toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching payment time status:", error);
    res.status(500).json({ error: "Failed to retrieve payment time status" });
  } finally {
    await client.close();
  }
};

export { paymentsOutsideStandardBusinessHours };
