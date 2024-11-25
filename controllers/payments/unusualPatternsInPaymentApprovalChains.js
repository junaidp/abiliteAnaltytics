import { client } from "../../client/index.js";

const unusualPatternsInPaymentApprovalChains = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentApprovalCollection = db.collection("Payment Approval");

    const results = await paymentApprovalCollection
      .aggregate([
        {
          $sort: { PaymentID: 1, ApprovalOrder: 1 },
        },
        {
          $group: {
            _id: "$PaymentID",
            approvers: {
              $push: {
                ApproverID: "$ApproverID",
                ApprovalOrder: "$ApprovalOrder",
                Status: "$Status",
              },
            },
          },
        },
        {
          $addFields: {
            approvalChain: {
              $map: {
                input: { $range: [1, { $size: "$approvers" }] },
                as: "index",
                in: {
                  PreviousApproverID: {
                    $arrayElemAt: [
                      "$approvers.ApproverID",
                      { $subtract: ["$$index", 1] },
                    ],
                  },
                  ApproverID: {
                    $arrayElemAt: ["$approvers.ApproverID", "$$index"],
                  },
                  ApprovalOrder: {
                    $arrayElemAt: ["$approvers.ApprovalOrder", "$$index"],
                  },
                  Status: { $arrayElemAt: ["$approvers.Status", "$$index"] },
                },
              },
            },
          },
        },
        {
          $unwind: "$approvalChain",
        },
        {
          $match: {
            $or: [
              {
                $expr: {
                  $ne: [
                    "$approvalChain.PreviousApproverID",
                    "$approvalChain.ApproverID",
                  ],
                },
                "approvalChain.ApprovalOrder": { $gt: [1] },
              },
              { "approvalChain.Status": "Rejected" },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            PaymentID: "$_id",
            ApproverID: "$approvalChain.ApproverID",
            PreviousApproverID: "$approvalChain.PreviousApproverID",
            ApprovalOrder: "$approvalChain.ApprovalOrder",
            Status: "$approvalChain.Status",
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching unusual patterns in payment approval chains:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in payment approval chains",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInPaymentApprovalChains };
