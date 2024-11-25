import { client } from "../../client/index.js";

const abnormalTrendsInWarrantyClaims = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const claimsCollection = db.collection("Warranty Claims");

    const results = await claimsCollection
      .aggregate([
        {
          $project: {
            Year: { $year: "$Claim_Date" },
            Month: { $month: "$Claim_Date" },
          },
        },
        {
          $group: {
            _id: { Year: "$Year", Month: "$Month" },
            ClaimCount: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.Year": 1, "_id.Month": 1 },
        },
        {
          $setWindowFields: {
            partitionBy: null,
            sortBy: { "_id.Year": 1, "_id.Month": 1 },
            output: {
              PrevMonthClaimCount: {
                $shift: { output: "$ClaimCount", by: -1 },
              },
            },
          },
        },
        {
          $addFields: {
            PercentChange: {
              $cond: {
                if: { $eq: ["$PrevMonthClaimCount", 0] },
                then: 0,
                else: {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ["$ClaimCount", "$PrevMonthClaimCount"] },
                        "$PrevMonthClaimCount",
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
        {
          $addFields: {
            Trend: {
              $switch: {
                branches: [
                  {
                    case: { $gt: ["$PercentChange", 50] },
                    then: "Abnormal Increase",
                  },
                  {
                    case: { $lt: ["$PercentChange", -50] },
                    then: "Abnormal Decrease",
                  },
                ],
                default: "Normal",
              },
            },
          },
        },
        {
          $match: {
            PercentChange: { $ne: 0 },
            $or: [
              { PercentChange: { $gt: 50 } },
              { PercentChange: { $lt: -50 } },
            ],
          },
        },
        {
          $project: {
            Year: "$_id.Year",
            Month: "$_id.Month",
            ClaimCount: 1,
            PrevMonthClaimCount: 1,
            PercentChange: { $round: ["$PercentChange", 2] },
            Trend: 1,
          },
        },
        {
          $sort: { Year: 1, Month: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching abnormal trends in warranty claims:", error);
    res.status(500).json({
      error: "Failed to retrieve abnormal trends in warranty claims data",
    });
  } finally {
    await client.close();
  }
};

export { abnormalTrendsInWarrantyClaims };
