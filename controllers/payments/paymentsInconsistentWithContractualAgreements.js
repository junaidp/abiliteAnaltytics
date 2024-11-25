import { client } from "../../client/index.js";

const paymentsInconsistentWithContractualAgreements = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsCollection = db.collection("Payments Data");

    const pipeline = [
      {
        $lookup: {
          from: "Contract Terms",
          localField: "Customer_ID",
          foreignField: "Customer_ID",
          as: "ContractDetails",
        },
      },
      {
        $unwind: "$ContractDetails",
      },
      {
        $addFields: {
          Status: {
            $switch: {
              branches: [
                {
                  case: {
                    $lt: [
                      "$Payment_Amount",
                      "$ContractDetails.MinPaymentAmount",
                    ],
                  },
                  then: "Below Minimum",
                },
                {
                  case: {
                    $gt: [
                      "$Payment_Amount",
                      "$ContractDetails.MaxPaymentAmount",
                    ],
                  },
                  then: "Above Maximum",
                },
                {
                  case: { $gt: ["$Payment_Date", "$ContractDetails.Due_Date"] },
                  then: "Late Payment",
                },
              ],
              default: "Aligned",
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { Payment_Amount: { $lt: "$ContractDetails.MinPaymentAmount" } },
            { Payment_Amount: { $gt: "$ContractDetails.MaxPaymentAmount" } },
            { Payment_Date: { $gt: "$ContractDetails.Due_Date" } },
          ],
        },
      },
      {
        $project: {
          Payment_ID: 1,
          Payment_Date: 1,
          Customer_ID: 1,
          Payment_Amount: 1,
          MinPaymentAmount: "$ContractDetails.MinPaymentAmount",
          MaxPaymentAmount: "$ContractDetails.MaxPaymentAmount",
          Due_Date: "$ContractDetails.Due_Date",
          Status: 1,
        },
      },
    ];

    const results = await paymentsCollection.aggregate(pipeline).toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ error: "Failed to retrieve payment status" });
  } finally {
    await client.close();
  }
};

export { paymentsInconsistentWithContractualAgreements };
