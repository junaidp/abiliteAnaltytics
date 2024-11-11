import { client } from "../../client/index.js";

const unusualTimeGapsInPaymentProcessing = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const transactionsCollection = db.collection("Transaction Data");

    const pipeline = [
      {
        $addFields: {
          Today_Date: { $toDate: new Date() },
          DaysOverdue: {
            $subtract: [{ $toDate: new Date() }, "$Due_Date"],
          },
        },
      },
      {
        $addFields: {
          DaysOverdue: {
            $divide: [{ $abs: "$DaysOverdue" }, 1000 * 60 * 60 * 24],
          },
        },
      },
      {
        $match: {
          DaysOverdue: { $gt: 0 },
        },
      },
      {
        $project: {
          _id: 0,
          Sr: 1,
          Customer_ID: 1,
          Order_ID: 1,
          Customer_Name: 1,
          Due_Date: 1,
          Today_Date: 1,
          DaysOverdue: 1,
        },
      },
    ];

    const result = await transactionsCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error(
      "Error fetching unusual time gaps in payment processing:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve unusual time gaps in payment processing",
    });
  } finally {
    await client.close();
  }
};

export { unusualTimeGapsInPaymentProcessing };
