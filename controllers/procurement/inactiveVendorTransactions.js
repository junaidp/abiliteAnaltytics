import { client } from "../../client/index.js";

const inactiveVendorTransactions = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const results = await db
      .collection("Vendor Status")
      .find({
        Vendor_Status: "Inactive",
      })
      .project({
        Transaction_ID: 1,
        Vendor_ID: 1,
        Transaction_Date: 1,
        Amount: 1,
        Vendor_Name: 1,
        Vendor_Status: 1,
      })
      .toArray();

    res.status(200).json({
      message: "Fetched inactive vendor transactions successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error fetching inactive vendor transactions:", error);
    res.status(500).json({
      message: "Error fetching inactive vendor transactions",
      error: error.message,
    });
  } finally {
    await client.close();
  }
};

export { inactiveVendorTransactions };
