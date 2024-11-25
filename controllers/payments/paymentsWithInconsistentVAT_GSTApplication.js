import { client } from "../../client/index.js";

const paymentsWithInconsistentVAT_GSTApplication = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsVatGstCollection = db.collection("Payments_VAT_GST");
    const standardVatGstCollection = db.collection("Standard_VAT_GST");

    const pipeline = [
      {
        $lookup: {
          from: "Standard_VAT_GST",
          localField: "ProductID",
          foreignField: "ProductID",
          as: "vatDetails",
        },
      },
      {
        $unwind: "$vatDetails",
      },
      {
        $addFields: {
          Standard_VAT_GST_Percentage: {
            $concat: [
              {
                $toString: { $multiply: ["$vatDetails.Standard_VAT_GST", 100] },
              },
              "%",
            ],
          },
          Applied_VAT_GST_Percentage: {
            $concat: [
              { $toString: { $multiply: ["$Applied_VAT_GST", 100] } },
              "%",
            ],
          },
          VAT_Discrepancy: {
            $cond: {
              if: { $ne: ["$Applied_VAT_GST", "$vatDetails.Standard_VAT_GST"] },
              then: "Discrepancy",
              else: "No Discrepancy",
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $ne: ["$Applied_VAT_GST", "$vatDetails.Standard_VAT_GST"],
          },
        },
      },
      {
        $project: {
          TransactionID: 1,
          ProductID: 1,
          ProductName: "$vatDetails.ProductName",
          Standard_VAT_GST_Percentage: 1,
          Applied_VAT_GST_Percentage: 1,
          VAT_Discrepancy: 1,
        },
      },
    ];

    const results = await paymentsVatGstCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching VAT discrepancy data:", error);
    res.status(500).json({ error: "Failed to retrieve VAT discrepancy data" });
  } finally {
    await client.close();
  }
};

export { paymentsWithInconsistentVAT_GSTApplication };
