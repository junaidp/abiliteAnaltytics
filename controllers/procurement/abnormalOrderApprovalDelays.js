import { client } from "../../client/index.js";

const abnormalOrderApprovalDelays = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const purchaseOrdersCollection = db.collection("Purchase Orders");

    const results = await purchaseOrdersCollection
      .aggregate([
        {
          $project: {
            Order_ID: 1,
            Order_Date: 1,
            Approval_Date: 1,
            Standard_Approval_Days: 1,
            ApprovalDelay: {
              $divide: [
                { $subtract: ["$Approval_Date", "$Order_Date"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $project: {
            Order_ID: 1,
            Order_Date: 1,
            Approval_Date: 1,
            Standard_Approval_Days: 1,
            ApprovalDelay: 1,
            DelayBeyondStandard: {
              $subtract: ["$ApprovalDelay", "$Standard_Approval_Days"],
            },
          },
        },
        {
          $match: {
            $expr: {
              $gt: ["$ApprovalDelay", "$Standard_Approval_Days"],
            },
          },
        },
        {
          $project: {
            Order_ID: 1,
            Order_Date: 1,
            Approval_Date: 1,
            ApprovalDelay: 1,
            Standard_Approval_Days: 1,
            DelayBeyondStandard: 1,
          },
        },
        {
          $sort: { Order_ID: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching abnormal order approval delays:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve abnormal order approval delays" });
  } finally {
    await client.close();
  }
};

export { abnormalOrderApprovalDelays };
