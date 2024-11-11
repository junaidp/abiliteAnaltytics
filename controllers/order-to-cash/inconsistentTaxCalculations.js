import { client } from "../../client/index.js";

const inconsistentTaxCalculations = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const collection = db.collection("Tax_1");

    const pipeline = [
      {
        $lookup: {
          from: "Tax_S",
          localField: "Product_ID",
          foreignField: "Product_ID",
          as: "tax_info",
        },
      },
      {
        $addFields: {
          CalculatedTax: {
            $round: [
              {
                $multiply: [
                  { $sum: "$Order_Amount" },
                  { $arrayElemAt: ["$tax_info.Tax_Rate", 0] },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$Order_ID",
          CalculatedTax: { $sum: "$CalculatedTax" },
        },
      },
      {
        $lookup: {
          from: "Tax_1",
          localField: "_id",
          foreignField: "Order_ID",
          as: "actual_tax",
        },
      },
      {
        $addFields: {
          ActualTax: { $sum: { $arrayElemAt: ["$actual_tax.Sales_Tax", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          Order_ID: "$_id",
          Customer_ID: 1,
          Order_Amount: 1,
          Standard_Tax: "$CalculatedTax",
          ActualTax: 1,
          PercentageDeviation: {
            $round: [
              {
                $cond: {
                  if: {
                    $eq: [
                      { $abs: { $subtract: ["$ActualTax", "$CalculatedTax"] } },
                      0,
                    ],
                  },
                  then: 0,
                  else: {
                    $multiply: [
                      { $abs: { $subtract: ["$ActualTax", "$CalculatedTax"] } },
                      100,
                    ],
                  },
                },
              },
              2,
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              $expr: {
                $gt: [
                  { $abs: { $subtract: ["$CalculatedTax", "$ActualTax"] } },
                  0.01,
                ],
              },
            },
            {
              $expr: {
                $ne: ["$CalculatedTax", "$ActualTax"],
              },
            },
          ],
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    res.json(result);
  } catch (error) {
    console.error("Error fetching inconsistent tax calculations:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve inconsistent tax calculations" });
  } finally {
    await client.close();
  }
};

export { inconsistentTaxCalculations };
