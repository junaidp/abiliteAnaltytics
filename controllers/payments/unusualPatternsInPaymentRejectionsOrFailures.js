import { client } from "../../client/index.js";

const unusualPatternsInPaymentRejectionsOrFailures = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentFailuresCollection = db.collection("Payment Failures");

    const results = await paymentFailuresCollection
      .aggregate([
        {
          $match: {
            Status: { $in: ["Failed", "Rejected"] },
          },
        },
        {
          $addFields: {
            TransactionDate: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$TransactionTime",
                    regex: "^[0-9]{2}:[0-9]{2}:[0-9]{2}$",
                  },
                },
                then: {
                  $dateFromString: {
                    dateString: {
                      $concat: [
                        new Date().toISOString().slice(0, 10),
                        "T",
                        "$TransactionTime",
                      ],
                    },
                  },
                },
                else: { $toDate: "$TransactionTime" },
              },
            },
          },
        },
        {
          $addFields: {
            TransactionHour: { $hour: "$TransactionDate" },
          },
        },
        {
          $group: {
            _id: {
              PaymentMethod: "$PaymentMethod",
              TransactionHour: "$TransactionHour",
            },
            Frequency: { $sum: 1 },
            AvgAmount: { $avg: "$Amount" },
          },
        },
        {
          $project: {
            _id: 0,
            PaymentMethod: "$_id.PaymentMethod",
            TransactionHour: "$_id.TransactionHour",
            Frequency: 1,
            AvgAmount: 1,
          },
        },
        {
          $sort: { Frequency: -1, PaymentMethod: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching unusual patterns in payment rejections or failures:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve unusual patterns in payment rejections or failures",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInPaymentRejectionsOrFailures };
