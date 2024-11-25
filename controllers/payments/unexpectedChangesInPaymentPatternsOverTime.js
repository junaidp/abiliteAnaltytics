import { client } from "../../client/index.js";

const unexpectedChangesInPaymentPatternsOverTime = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentPatternsCollection = db.collection("Payment Patterns");

    const results = await paymentPatternsCollection
      .aggregate([
        {
          $match: {
            Payment_Date: { $lt: new Date("2024-08-01") },
          },
        },
        {
          $group: {
            _id: "$Expense_Category",
            AvgAmount: { $avg: "$Amount" },
          },
        },
        {
          $lookup: {
            from: "Payment Patterns",
            localField: "_id",
            foreignField: "Expense_Category",
            as: "payments",
          },
        },
        {
          $unwind: "$payments",
        },
        {
          $match: {
            "payments.Payment_Date": { $gte: new Date("2024-08-01") },
          },
        },
        {
          $addFields: {
            Deviation: {
              $abs: { $subtract: ["$payments.Amount", "$AvgAmount"] },
            },
          },
        },
        {
          $match: {
            Deviation: { $gt: { $multiply: ["$AvgAmount", 0.25] } },
          },
        },
        {
          $project: {
            _id: 0,
            Payment_ID: "$payments.Payment_ID",
            Amount: "$payments.Amount",
            Expense_Category: "$payments.Expense_Category",
            Payment_Date: "$payments.Payment_Date",
            AvgAmount: 1,
            Deviation: 1,
          },
        },
        {
          $sort: { Payment_Date: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching unexpected changes in payment patterns:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve unexpected changes in payment patterns over time",
    });
  } finally {
    await client.close();
  }
};

export { unexpectedChangesInPaymentPatternsOverTime };
