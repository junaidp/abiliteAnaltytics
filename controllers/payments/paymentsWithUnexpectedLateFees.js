import { client } from "../../client/index.js";

const paymentsWithUnexpectedLateFees = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const lateFeesCollection = db.collection("Late Fees");

    const pipeline = [
      {
        $addFields: {
          DaysLate: {
            $divide: [
              {
                $subtract: [
                  { $toDate: "$PaymentDate" },
                  { $toDate: "$DueDate" },
                ],
              },
              86400000,
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $gt: [{ $toDate: "$PaymentDate" }, { $toDate: "$DueDate" }],
          },
        },
      },
      {
        $addFields: {
          UnderpaidLateFee: {
            $subtract: ["$ExpectedLateFee", "$LateFeeApplied"],
          },
          FeeStatus: {
            $cond: {
              if: { $lt: ["$LateFeeApplied", "$ExpectedLateFee"] },
              then: "Underpaid Late Fee",
              else: "Paid Correctly",
            },
          },
        },
      },
      {
        $match: {
          LateFeeApplied: { $lt: "$ExpectedLateFee" },
        },
      },
      {
        $project: {
          PaymentID: 1,
          InvoiceID: 1,
          VendorID: 1,
          InvoiceAmount: 1,
          PaidAmount: 1,
          DueDate: 1,
          PaymentDate: 1,
          LateFeeApplied: 1,
          ExpectedLateFee: 1,
          UnderpaidLateFee: 1,
          FeeStatus: 1,
        },
      },
    ];

    const results = await lateFeesCollection.aggregate(pipeline).toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching late fee discrepancies:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve late fee discrepancies" });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnexpectedLateFees };
