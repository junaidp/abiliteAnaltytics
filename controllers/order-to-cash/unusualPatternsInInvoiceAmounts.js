import { client } from "../../client/index.js";

const unusualPatternsInInvoiceAmounts = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const invoicesCollection = db.collection("Invoices");

    const pipeline = [
      {
        $group: {
          _id: "$Customer_ID",
          AvgInvoiceAmount_Customer: { $avg: "$Invoice_Amount" },
          StdDevInvoiceAmount_Customer: { $stdDevSamp: "$Invoice_Amount" },
        },
      },
      {
        $lookup: {
          from: "Invoices",
          localField: "_id",
          foreignField: "Customer_ID",
          as: "customerInvoices",
        },
      },
      {
        $unwind: "$customerInvoices",
      },
      {
        $project: {
          Customer_ID: "$_id",
          Invoice_ID: "$customerInvoices.Invoice_ID",
          Invoice_Amount: "$customerInvoices.Invoice_Amount",
          AvgInvoiceAmount_Customer: 1,
          StdDevInvoiceAmount_Customer: 1,
          isAboveAverage: {
            $gt: [
              "$customerInvoices.Invoice_Amount",
              {
                $add: [
                  "$AvgInvoiceAmount_Customer",
                  { $multiply: [1.5, "$StdDevInvoiceAmount_Customer"] },
                ],
              },
            ],
          },
          isBelowAverage: {
            $lt: [
              "$customerInvoices.Invoice_Amount",
              {
                $subtract: [
                  "$AvgInvoiceAmount_Customer",
                  { $multiply: [0.5, "$StdDevInvoiceAmount_Customer"] },
                ],
              },
            ],
          },
        },
      },
      {
        $match: {
          $or: [{ isAboveAverage: true }, { isBelowAverage: true }],
        },
      },
      {
        $addFields: {
          Customer_Deviation_Status: {
            $cond: {
              if: { $gt: ["$Invoice_Amount", "$AvgInvoiceAmount_Customer"] },
              then: "Above Average (Customer)",
              else: "Below Average (Customer)",
            },
          },
        },
      },
      {
        $project: {
          Customer_ID: 1,
          Invoice_ID: 1,
          Invoice_Amount: 1,
          AvgInvoiceAmount_Customer: 1,
          StdDevInvoiceAmount_Customer: 1,
          Customer_Deviation_Status: 1,
        },
      },
    ];

    const result = await invoicesCollection.aggregate(pipeline).toArray();

    res.json(result);
  } catch (error) {
    console.error("Error fetching unusual patterns in invoice amounts:", error);
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in invoice amounts data",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInInvoiceAmounts };
