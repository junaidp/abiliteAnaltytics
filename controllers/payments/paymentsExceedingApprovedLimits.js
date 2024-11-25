import { client } from "../../client/index.js";

const paymentsExceedingApprovedLimits = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsCollection = db.collection("Payments Data");
    const limitsCollection = db.collection("Approved Limits");

    const pipeline = [
      {
        $lookup: {
          from: "Approved Limits",
          localField: "Customer_ID",
          foreignField: "Customer_ID",
          as: "ApprovedLimitDetails",
        },
      },
      {
        $unwind: "$ApprovedLimitDetails",
      },
      {
        $match: {
          $expr: {
            $gt: ["$Payment_Amount", "$ApprovedLimitDetails.Approved_Limit"],
          },
        },
      },
      {
        $addFields: {
          Status: {
            $cond: {
              if: {
                $gt: [
                  "$Payment_Amount",
                  "$ApprovedLimitDetails.Approved_Limit",
                ],
              },
              then: "Exceeds Limit",
              else: "Within Limit",
            },
          },
        },
      },
      {
        $project: {
          Payment_ID: 1,
          Payment_Date: 1,
          Customer_ID: 1,
          Payment_Amount: 1,
          Approved_Limit: "$ApprovedLimitDetails.Approved_Limit",
          Status: 1,
        },
      },
    ];

    const results = await paymentsCollection.aggregate(pipeline).toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching payments exceeding limits:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve payments exceeding limits" });
  } finally {
    await client.close();
  }
};

export { paymentsExceedingApprovedLimits };
