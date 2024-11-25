import { client } from "../../client/index.js";

const paymentsWithUnexpectedPaymentSources = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentSourcesCollection = db.collection("Payment Sources");

    const authorizedPaymentSources = [
      "Credit Card",
      "Bank Transfer",
      "PayPal",
      "Debit Card",
      "Wire Transfer",
    ];

    const results = await paymentSourcesCollection
      .aggregate([
        {
          $match: {
            PaymentSource: { $nin: authorizedPaymentSources },
          },
        },
        {
          $project: {
            PaymentID: 1,
            CustomerID: 1,
            InvoiceID: 1,
            PaymentSource: 1,
            Amount: 1,
            Currency: 1,
          },
        },
        {
          $sort: {
            CustomerID: 1,
            InvoiceID: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching unexpected payment sources:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve unexpected payment sources" });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnexpectedPaymentSources };
