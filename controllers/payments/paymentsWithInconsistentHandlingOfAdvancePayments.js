import { client } from "../../client/index.js";

const paymentsWithInconsistentHandlingOfAdvancePayments = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const advancePaymentsCollection = db.collection("Advance Payments");

    const pipeline = [
      {
        $match: {
          AdvancePayment: "Yes",
          $or: [
            { PaymentAmount: { $lt: "$ApprovedAmount" } },
            { PaymentStatus: { $in: ["Failed", "Pending"] } },
          ],
        },
      },
      {
        $project: {
          PaymentID: 1,
          VendorID: 1,
          PaymentDate: 1,
          PaymentAmount: 1,
          ApprovedAmount: 1,
          PaymentStatus: 1,
          DueDate: 1,
        },
      },
    ];

    const results = await advancePaymentsCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching advance payment status:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve advance payment status" });
  } finally {
    await client.close();
  }
};

export { paymentsWithInconsistentHandlingOfAdvancePayments };
