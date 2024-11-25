import { client } from "../../client/index.js";

const outliersInPurchaseAmounts = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const stats = await db
      .collection("Purchase Data")
      .aggregate([
        {
          $group: {
            _id: null,
            AvgAmount: { $avg: "$Purchase_Amount" },
            StdDevAmount: { $stdDevSamp: "$Purchase_Amount" },
          },
        },
      ])
      .toArray();

    const avgAmount = stats[0]?.AvgAmount || 0;
    const stdDevAmount = stats[0]?.StdDevAmount || 0;

    const purchaseAmounts = await db
      .collection("Purchase Data")
      .find({}, { Purchase_Amount: 1 })
      .sort({ Purchase_Amount: 1 })
      .toArray();
    const mid = Math.floor(purchaseAmounts.length / 2);
    const medianAmount =
      purchaseAmounts.length % 2 === 0
        ? (purchaseAmounts[mid - 1].Purchase_Amount +
            purchaseAmounts[mid].Purchase_Amount) /
          2
        : purchaseAmounts[mid].Purchase_Amount;

    const results = await db
      .collection("Purchase Data")
      .aggregate([
        {
          $project: {
            Purchase_ID: 1,
            Purchase_Date: 1,
            Purchase_Amount: 1,
            AvgAmount: { $literal: avgAmount },
            StdDevAmount: { $literal: stdDevAmount },
            MedianAmount: { $literal: medianAmount },
            OutlierFlag: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: ["$Purchase_Amount", avgAmount + 2 * stdDevAmount],
                    },
                    then: "High Outlier",
                  },
                  {
                    case: {
                      $lt: ["$Purchase_Amount", avgAmount - 2 * stdDevAmount],
                    },
                    then: "Low Outlier",
                  },
                  {
                    case: {
                      $gt: ["$Purchase_Amount", medianAmount * 1.5],
                    },
                    then: "High Outlier",
                  },
                  {
                    case: {
                      $lt: ["$Purchase_Amount", medianAmount * 0.5],
                    },
                    then: "Low Outlier",
                  },
                ],
                default: "Normal",
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { Purchase_Amount: { $gt: avgAmount + 2 * stdDevAmount } },
              { Purchase_Amount: { $lt: avgAmount - 2 * stdDevAmount } },
              { Purchase_Amount: { $gt: medianAmount * 1.5 } },
              { Purchase_Amount: { $lt: medianAmount * 0.5 } },
            ],
          },
        },
        { $sort: { Purchase_Date: 1 } },
      ])
      .toArray();

    res.status(200).json({
      message: "Fetched outliers in purchase amounts successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error fetching outliers in purchase amounts:", error);
    res.status(500).json({
      message: "Error fetching outliers in purchase amounts",
      error: error.message,
    });
  } finally {
    await client.close();
  }
};

export { outliersInPurchaseAmounts };
