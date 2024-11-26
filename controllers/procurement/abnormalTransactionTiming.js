import { client } from "../../client/index.js";

const abnormalTransactionTiming = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const transactionsCollection = db.collection("Transactions");

    const results = await transactionsCollection
      .aggregate([
        {
          $project: {
            Year: { $year: "$Transaction_Date" },
            Month: { $month: "$Transaction_Date" },
            Day: { $dayOfMonth: "$Transaction_Date" },
            Transaction_Date: 1,
          },
        },
        {
          $group: {
            _id: { Year: "$Year", Month: "$Month" },
            TotalTransactions: { $sum: 1 },
            EndOfMonthTransactions: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      { $subtract: [{ $dayOfMonth: "$Transaction_Date" }, 27] },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            Year: "$_id.Year",
            Month: "$_id.Month",
            TotalTransactions: 1,
            EndOfMonthTrans: "$EndOfMonthTransactions",
            PercentageOfEndOfMonthTrans: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$EndOfMonthTransactions",
                        "$TotalTransactions",
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $match: {
            PercentageOfEndOfMonthTrans: { $gt: 30 },
          },
        },
        {
          $sort: { Year: 1, Month: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching abnormal transaction timing:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve abnormal transaction timing data" });
  } finally {
    await client.close();
  }
};

export { abnormalTransactionTiming };
