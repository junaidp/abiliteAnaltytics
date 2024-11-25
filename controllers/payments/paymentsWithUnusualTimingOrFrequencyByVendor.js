import { client } from "../../client/index.js";

const paymentsWithUnusualTimingOrFrequencyByVendor = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsFrequencyCollection = db.collection("Payments Frequency");

    const results = await paymentsFrequencyCollection
      .aggregate([
        {
          $sort: { VendorID: 1, PaymentDate: 1 },
        },
        {
          $group: {
            _id: "$VendorID",
            payments: {
              $push: {
                PaymentID: "$PaymentID",
                PaymentDate: "$PaymentDate",
                PaymentAmount: "$PaymentAmount",
              },
            },
          },
        },
        {
          $addFields: {
            payments: {
              $map: {
                input: { $range: [1, { $size: "$payments" }] },
                as: "idx",
                in: {
                  PaymentID: { $arrayElemAt: ["$payments.PaymentID", "$$idx"] },
                  PaymentDate: {
                    $arrayElemAt: ["$payments.PaymentDate", "$$idx"],
                  },
                  PaymentAmount: {
                    $arrayElemAt: ["$payments.PaymentAmount", "$$idx"],
                  },
                  PreviousPaymentDate: {
                    $arrayElemAt: [
                      "$payments.PaymentDate",
                      { $subtract: ["$$idx", 1] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $unwind: "$payments",
        },
        {
          $addFields: {
            DaysBetweenPayments: {
              $subtract: [
                "$payments.PaymentDate",
                "$payments.PreviousPaymentDate",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            payments: { $push: "$payments" },
            AvgDaysBetweenPayments: { $avg: "$DaysBetweenPayments" },
          },
        },
        {
          $addFields: {
            payments: {
              $map: {
                input: "$payments",
                as: "payment",
                in: {
                  $mergeObjects: [
                    "$$payment",
                    { AvgDaysBetweenPayments: "$AvgDaysBetweenPayments" },
                  ],
                },
              },
            },
          },
        },
        {
          $unwind: "$payments",
        },
        {
          $match: {
            DaysBetweenPayments: { $ne: null },
            $expr: {
              $or: [
                {
                  $gt: [
                    "$payments.DaysBetweenPayments",
                    { $multiply: ["$payments.AvgDaysBetweenPayments", 1.5] },
                  ],
                },
                {
                  $lt: [
                    "$payments.DaysBetweenPayments",
                    { $multiply: ["$payments.AvgDaysBetweenPayments", 0.5] },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            VendorID: "$_id",
            PaymentID: "$payments.PaymentID",
            PaymentDate: "$payments.PaymentDate",
            PaymentAmount: "$payments.PaymentAmount",
            DaysBetweenPayments: "$DaysBetweenPayments",
            AvgDaysBetweenPayments: "$payments.AvgDaysBetweenPayments",
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching payments with unusual timing or frequency by vendor:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve payments with unusual timing or frequency by vendor",
    });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnusualTimingOrFrequencyByVendor };
