import { client } from "../../client/index.js";

const unusualPatternsInPaymentApprovalTimes = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentApprovalTimeCollection = db.collection(
      "Payment Approval Time"
    );

    const results = await paymentApprovalTimeCollection
      .aggregate([
        {
          $addFields: {
            ApprovalStatus: {
              $switch: {
                branches: [
                  {
                    case: { $gt: ["$ApprovalTime", "$ExpectedApproval"] },
                    then: "Delayed",
                  },
                  {
                    case: { $lt: ["$ApprovalTime", "$ExpectedApproval"] },
                    then: "Approved Earlier",
                  },
                ],
                default: "On Time",
              },
            },
          },
        },
        {
          $match: {
            $expr: { $ne: ["$ApprovalTime", "$ExpectedApproval"] },
          },
        },
        {
          $project: {
            _id: 0,
            PaymentID: 1,
            PaymentAmount: 1,
            SubmittedDate: 1,
            ApprovalDate: 1,
            ApprovalTime: 1,
            ExpectedApproval: 1,
            ApprovalStatus: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching unusual patterns in payment approval times:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in payment approval times",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInPaymentApprovalTimes };
