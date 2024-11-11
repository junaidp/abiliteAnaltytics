import { client } from "../../client/index.js";

const unusualDiscounts = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const ordersCollection = db.collection("Orders Discount");

    const pipeline = [
      {
        $addFields: {
          highDiscountCount: {
            $sum: {
              $cond: [
                { $gt: [{ $divide: ["$Discount", "$Price"] }, 0.5] },
                1,
                0,
              ],
            },
          },
          totalDiscount: { $sum: "$Discount" },
        },
      },
      {
        $group: {
          _id: "$Order_ID",
          highDiscountCount: { $sum: "$highDiscountCount" },
          totalDiscount: { $sum: "$totalDiscount" },
        },
      },
      {
        $match: {
          $or: [
            { totalDiscount: { $gt: 100 } },
            { highDiscountCount: { $gt: 1 } },
          ],
        },
      },
      {
        $sort: { totalDiscount: -1 },
      },
      {
        $project: {
          _id: 0,
          Order_ID: "$_id",
          highDiscountCount: 1,
          totalDiscount: 1,
        },
      },
    ];

    const result = await ordersCollection.aggregate(pipeline).toArray();

    res.json(result);
  } catch (error) {
    console.error("Error fetching unusual discounts:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve unusual discounts data" });
  } finally {
    await client.close();
  }
};

export { unusualDiscounts };
