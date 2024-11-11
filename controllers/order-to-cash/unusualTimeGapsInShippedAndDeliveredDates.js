import { client } from "../../client/index.js";

const unusualTimeGapsInShippedAndDeliveredDates = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const ordersCollection = db.collection("Orders Delivery");

    const pipeline = [
      {
        $addFields: {
          DaysDelay: {
            $divide: [
              { $subtract: ["$Delivered_Date", "$Shipped_Date"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $match: {
          DaysDelay: { $gt: 5 },
        },
      },
      {
        $project: {
          _id: 0,
          Order_ID: 1,
          Shipped_Date: 1,
          Delivered_Date: 1,
          DaysDelay: 1,
        },
      },
    ];

    const result = await ordersCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error(
      "Error fetching unusual time gaps in shipped and delivered dates:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve unusual time gaps in shipped and delivered dates",
    });
  } finally {
    await client.close();
  }
};

export { unusualTimeGapsInShippedAndDeliveredDates };
