import { client } from "../../client/index.js";

const duplicateTransactions = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const collection = db.collection("Transaction Data");

    const pipeline = [
      {
        $group: {
          _id: {
            Order_ID: "$Order_ID",
            Customer_ID: "$Customer_ID",
            Quantity_Sold: "$Quantity_Sold",
            Per_Unit_Price: "$Per_Unit_Price",
          },
          DuplicateCount: { $sum: 1 },
        },
      },
      {
        $match: { DuplicateCount: { $gt: 1 } },
      },
      {
        $project: {
          _id: 0,
          Order_ID: "$_id.Order_ID",
          Customer_ID: "$_id.Customer_ID",
          Quantity_Sold: "$_id.Quantity_Sold",
          Per_Unit_Price: "$_id.Per_Unit_Price",
          DuplicateCount: 1,
        },
      },
    ];

    const duplicateTransactions = await collection
      .aggregate(pipeline)
      .toArray();
    res.json(duplicateTransactions);
  } catch (error) {
    console.error("Error fetching duplicate transactions:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve duplicate transactions" });
  } finally {
    await client.close();
  }
};

export { duplicateTransactions };
