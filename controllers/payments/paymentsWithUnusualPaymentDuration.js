import { client } from "../../client/index.js";

const paymentsWithUnusualPaymentDuration = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsDurationCollection = db.collection("Payments Duration");

    const results = await paymentsDurationCollection
      .aggregate([
        {
          $addFields: {
            ProcessingTime: {
              $divide: [
                { $subtract: ["$CompletionDate", "$InitiationDate"] },
                86400000,
              ],
            },
          },
        },
        {
          $group: {
            _id: "$VendorID",
            AvgProcessingTime: { $avg: "$ProcessingTime" },
            payments: { $push: "$$ROOT" },
          },
        },
        {
          $unwind: "$payments",
        },
        {
          $addFields: {
            ProcessingTime: "$payments.ProcessingTime",
            VendorID: "$payments.VendorID",
            PaymentID: "$payments.PaymentID",
            InitiationDate: "$payments.InitiationDate",
            CompletionDate: "$payments.CompletionDate",
            AvgProcessingTime: "$AvgProcessingTime",
          },
        },
        {
          $match: {
            ProcessingTime: { $ne: null },
            $expr: {
              $or: [
                {
                  $gt: [
                    "$ProcessingTime",
                    { $multiply: ["$AvgProcessingTime", 1.5] },
                  ],
                },
                {
                  $lt: [
                    "$ProcessingTime",
                    { $multiply: ["$AvgProcessingTime", 0.5] },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            VendorID: 1,
            PaymentID: 1,
            InitiationDate: 1,
            CompletionDate: 1,
            ProcessingTime: 1,
            AvgProcessingTime: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching payments with unusual payment duration:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve payments with unusual payment duration",
    });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnusualPaymentDuration };
