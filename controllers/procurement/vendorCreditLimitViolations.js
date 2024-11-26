import { client } from "../../client/index.js";

const vendorCreditLimitViolations = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const results = await db
      .collection("Procurement Transactions")
      .aggregate([
        {
          $lookup: {
            from: "Vendors Limit",
            localField: "Vendor_ID",
            foreignField: "Vendor_ID",
            as: "VendorDetails",
          },
        },
        {
          $unwind: "$VendorDetails",
        },
        {
          $project: {
            Transaction_ID: 1,
            Vendor_ID: 1,
            Transaction_Amount: 1,
            Credit_Limit: "$VendorDetails.Credit_Limit",
            Status: {
              $cond: [
                { $gt: ["$Transaction_Amount", "$VendorDetails.Credit_Limit"] },
                "Limit Exceeded",
                null,
              ],
            },
          },
        },
        {
          $match: {
            Status: { $eq: "Limit Exceeded" },
          },
        },
        {
          $sort: { Vendor_ID: 1, Transaction_ID: 1 },
        },
      ])
      .toArray();

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching vendor credit limit violations:", error);
    res.status(500).json({
      message: "Error fetching vendor credit limit violations",
      error: error.message,
    });
  } finally {
    await client.close();
  }
};

export { vendorCreditLimitViolations };
