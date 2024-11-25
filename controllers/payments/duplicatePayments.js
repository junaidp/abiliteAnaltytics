import { client } from "../../client/index.js";

const duplicatePayments = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const collection = db.collection("Payments Data");

    const pipeline = [
      {
        $setWindowFields: {
          partitionBy: {
            Payment_Date: "$Payment_Date",
            Customer_ID: "$Customer_ID",
            Payment_Amount: "$Payment_Amount",
          },
          output: {
            DuplicateCount: { $count: {} },
          },
        },
      },
      {
        $match: {
          DuplicateCount: { $gt: 1 },
        },
      },
      {
        $project: {
          Payment_ID: 1,
          Payment_Date: 1,
          Customer_ID: 1,
          Payment_Amount: 1,
        },
      },
    ];

    const duplicatePaymentsResult = await collection
      .aggregate(pipeline)
      .toArray();
    res.json(duplicatePaymentsResult);
  } catch (error) {
    console.error("Error fetching duplicate payments:", error);
    res.status(500).json({ error: "Failed to retrieve duplicate payments" });
  } finally {
    await client.close();
  }
};

export { duplicatePayments };
