import { client } from "../../client/index.js";

const paymentsWithHighTransactionFees = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const transactionsCollection = db.collection("Transaction Fees");

    const pipeline = [
      {
        $addFields: {
          FeePercentage: {
            $concat: [
              {
                $toString: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ["$TransactionFee", "$TransactionAmount"] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
              },
              "%",
            ],
          },
          FeeStatus: {
            $cond: {
              if: {
                $gt: [
                  {
                    $multiply: [
                      { $divide: ["$TransactionFee", "$TransactionAmount"] },
                      100,
                    ],
                  },
                  4,
                ],
              },
              then: "High Fee",
              else: "Normal Fee",
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $gt: [
              {
                $multiply: [
                  { $divide: ["$TransactionFee", "$TransactionAmount"] },
                  100,
                ],
              },
              4,
            ],
          },
        },
      },
      {
        $project: {
          TransactionID: 1,
          AccountID: 1,
          TransactionDate: 1,
          TransactionAmount: 1,
          TransactionFee: 1,
          FeePercentage: 1,
          FeeStatus: 1,
        },
      },
    ];

    const results = await transactionsCollection.aggregate(pipeline).toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching transaction fee status:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve transaction fee status" });
  } finally {
    await client.close();
  }
};

export { paymentsWithHighTransactionFees };
