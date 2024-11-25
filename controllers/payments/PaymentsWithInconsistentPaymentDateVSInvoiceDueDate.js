import { client } from "../../client/index.js";

const PaymentsWithInconsistentPaymentDateVSInvoiceDueDate = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsHistoryCollection = db.collection("Payments History");

    const pipeline = [
      {
        $addFields: {
          DaysDifference: {
            $abs: {
              $divide: [
                { $subtract: ["$PaymentDate", "$InvoiceDueDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $match: {
          DaysDifference: { $gt: 5 },
        },
      },
      {
        $project: {
          PaymentID: 1,
          CustomerID: 1,
          InvoiceID: 1,
          InvoiceDueDate: 1,
          PaymentDate: 1,
          Amount: 1,
          Currency: 1,
          DaysDifference: 1,
        },
      },
      {
        $sort: {
          CustomerID: 1,
          InvoiceDueDate: 1,
        },
      },
    ];

    const results = await paymentsHistoryCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching payments history:", error);
    res.status(500).json({ error: "Failed to retrieve payments history" });
  } finally {
    await client.close();
  }
};

export { PaymentsWithInconsistentPaymentDateVSInvoiceDueDate };
