import { client } from "../../client/index.js";

const findDuplicateEntries = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const vendorTransactionsCollection = db.collection("Vendor Transactions");

    const results = await vendorTransactionsCollection
      .aggregate([
        {
          $group: {
            _id: {
              Vendor_ID: "$Vendor_ID",
              Transaction_ID: "$Transaction_ID",
              Purchase_Order_ID: "$Purchase_Order_ID",
            },
            DuplicateCount: { $sum: 1 },
          },
        },
        {
          $match: {
            DuplicateCount: { $gt: 1 },
          },
        },
        {
          $project: {
            Vendor_ID: "$_id.Vendor_ID",
            Transaction_ID: "$_id.Transaction_ID",
            Purchase_Order_ID: "$_id.Purchase_Order_ID",
            DuplicateCount: 1,
            Status: { $literal: "Duplicate" },
          },
        },
        {
          $sort: {
            Vendor_ID: 1,
            Purchase_Order_ID: 1,
            Transaction_ID: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching duplicate entries:", error);
    res.status(500).json({ error: "Failed to retrieve duplicate entries" });
  } finally {
    await client.close();
  }
};

export { findDuplicateEntries };
