import { client } from "../../client/index.js";

const paymentsWithUnexpectedDelays = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const delayedPaymentsCollection = db.collection("Delayed Payments");

    const pipeline = [
      {
        $addFields: {
          ProcessingDays: {
            $subtract: [
              { $toDate: "$PaymentDate" },
              { $toDate: "$InvoiceDate" },
            ],
          },
        },
      },
      {
        $addFields: {
          ProcessingDays: {
            $divide: [{ $toLong: "$ProcessingDays" }, 86400000],
          },
        },
      },
      {
        $match: {
          ProcessingDays: { $gt: 7 },
        },
      },
      {
        $project: {
          PaymentID: 1,
          CustomerID: 1,
          InvoiceID: 1,
          InvoiceDate: 1,
          PaymentDate: 1,
          Amount: 1,
          Currency: 1,
          ProcessingDays: 1,
        },
      },
      {
        $sort: { CustomerID: 1, InvoiceDate: 1 },
      },
    ];

    const results = await delayedPaymentsCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching delayed payments:", error);
    res.status(500).json({ error: "Failed to retrieve delayed payments" });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnexpectedDelays };
