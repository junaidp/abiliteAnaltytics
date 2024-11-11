import { client } from "../../client/index.js";

const inconsistenciesInPaymentMethods = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const paymentsCollection = db.collection("Payments");

    const pipeline = [
      {
        $group: {
          _id: "$Customer_ID",
          NumPaymentMethods: { $addToSet: "$Payment_Method" },
          NumOrders: { $addToSet: "$Order_ID" },
        },
      },
      {
        $addFields: {
          NumPaymentMethods: { $size: "$NumPaymentMethods" },
          NumOrders: { $size: "$NumOrders" },
        },
      },
      {
        $match: {
          NumPaymentMethods: { $gt: 1 },
          NumOrders: { $gt: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          Customer_ID: "$_id",
          NumPaymentMethods: 1,
          NumOrders: 1,
        },
      },
    ];

    const result = await paymentsCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching inconsistencies in payment methods:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve inconsistencies in payment methods" });
  } finally {
    await client.close();
  }
};

export { inconsistenciesInPaymentMethods };
