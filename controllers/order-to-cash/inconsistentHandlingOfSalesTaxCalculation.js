import { client } from "../../client/index.js";

const inconsistentHandlingOfSalesTaxCalculation = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const taxCollection = db.collection("Tax_1");
    const taxRateCollection = db.collection("Tax_S");

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
        $unwind: "$tax_info",
      },
      {
        $group: {
          _id: "$Order_ID",
          CalculatedTax: {
            $sum: { $multiply: ["$Order_Amount", "$tax_info.Tax_Rate"] },
          },
        },
      },
      {
        $addFields: {
          CalculatedTax: { $round: ["$CalculatedTax", 2] },
        },
      },
      {
        $lookup: {
          from: "Tax_1",
          localField: "_id",
          foreignField: "Order_ID",
          as: "actual_sales",
        },
      },
      {
        $unwind: "$actual_sales",
      },
      {
        $group: {
          _id: "$_id",
          Order_ID: { $first: "$_id" },
          Customer_ID: { $first: "$actual_sales.Customer_ID" },
          Order_Amount: { $first: "$actual_sales.Order_Amount" },
          CalculatedTax: { $first: "$CalculatedTax" },
          ActualTax: {
            $sum: { $round: ["$actual_sales.Sales_Tax", 2] },
          },
        },
      },
      {
        $addFields: {
          DiscrepancyStatus: {
            $cond: {
              if: { $ne: ["$CalculatedTax", "$ActualTax"] },
              then: "Discrepancy",
              else: "No Discrepancy",
            },
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
            { $expr: { $ne: ["$CalculatedTax", "$ActualTax"] } },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          Order_ID: 1,
          Customer_ID: 1,
          Order_Amount: { $round: ["$Order_Amount", 2] },
          Standard_Tax: "$CalculatedTax",
          ActualTax: 1,
          DiscrepancyStatus: 1,
        },
      },
    ];

    const result = await taxCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching inconsistent handling of sales tax:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve inconsistent sales tax data" });
  } finally {
    await client.close();
  }
};

export { inconsistentHandlingOfSalesTaxCalculation };
