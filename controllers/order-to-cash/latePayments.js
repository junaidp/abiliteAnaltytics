import { client } from "../../client/index.js";

const latePayments = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const collection = db.collection("Payments");

    const pipeline = [
      {
        $addFields: {
          Today_Date: { $dateToString: { format: "%Y-%m-%d", date: "$$NOW" } },
          DaysOverdue: {
            $dateDiff: {
              startDate: "$Due_Date",
              endDate: "$$NOW",
              unit: "day",
            },
          },
        },
      },
      {
        $match: { DaysOverdue: { $gt: 0 } },
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

    const latePaymentsData = await collection.aggregate(pipeline).toArray();
    res.json(latePaymentsData);
  } catch (error) {
    console.error("Error fetching late payments:", error);
    res.status(500).json({ error: "Failed to retrieve late payments" });
  } finally {
    await client.close();
  }
};

export { latePayments };
