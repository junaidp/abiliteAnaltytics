import { client } from "../../client/index.js";

const inconsistentTaxRates = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const collection = db.collection("Tax_1");

    const pipeline = [
      {
        $lookup: {
          from: "Tax_1",
          localField: "Product_ID",
          foreignField: "Product_ID",
          as: "tax_data_self_join",
        },
      },
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
          Standard_Tax: { $arrayElemAt: ["$tax_info.Tax_Rate", 0] },
          Discrepancy_Status: {
            $cond: [
              {
                $eq: [
                  { $round: ["$Tax_Rate", 2] },
                  {
                    $round: [
                      { $arrayElemAt: ["$tax_data_self_join.Tax_Rate", 0] },
                      2,
                    ],
                  },
                ],
              },
              "Okay",
              "Discrepancy",
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          Product_ID: 1,
          Order_ID: 1,
          Tax_Rate: { $round: ["$Tax_Rate", 2] },
          Standard_Tax: { $round: ["$Standard_Tax", 2] },
          Discrepancy_Status: 1,
        },
      },
      {
        $match: {
          $expr: {
            $ne: [
              { $round: ["$Tax_Rate", 2] },
              { $round: ["$Standard_Tax", 2] },
            ],
          },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching inconsistent tax rates:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve inconsistent tax rates" });
  } finally {
    await client.close();
  }
};

export { inconsistentTaxRates };
