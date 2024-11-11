import { client } from "../../client/index.js";

const unusualPatternsInGiftCardUsage = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const giftCardOrdersCollection = db.collection("Gift Card Orders");

    const pipeline = [
      {
        $match: {
          $expr: {
            $gt: ["$Gift_Card_Amount", { $multiply: ["$Order_Amount", 0.1] }],
          },
        },
      },
      {
        $project: {
          Order_ID: 1,
          Order_Amount: 1,
          Gift_Card_Amount: 1,
        },
      },
    ];

    const result = await giftCardOrdersCollection.aggregate(pipeline).toArray();

    res.json(result);
  } catch (error) {
    console.error("Error fetching unusual patterns in gift card usage:", error);
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in gift card usage data",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInGiftCardUsage };
