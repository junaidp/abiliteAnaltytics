import { client } from "../../client/index.js";

const unusualPatternsInProductReturns = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const salesReturnsCollection = db.collection("SalesReturns");

    const pipeline = [
      {
        $group: {
          _id: "$Product_ID",
          Return_Count: {
            $sum: {
              $cond: [{ $eq: ["$Returned", "Yes"] }, 1, 0],
            },
          },
          Total_Sales_Qty: { $sum: "$Sales" },
        },
      },
      {
        $addFields: {
          Return_Rate_Percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$Return_Count", "$Total_Sales_Qty"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $match: {
          Return_Rate_Percentage: { $gt: 10 },
        },
      },
      {
        $lookup: {
          from: "SalesReturns",
          localField: "_id",
          foreignField: "Product_ID",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo",
      },
      {
        $project: {
          Product_ID: "$_id",
          Return_Count: 1,
          Total_Sales_Qty: 1,
          Return_Rate_Percentage: 1,
          Product_Name: "$productInfo.Product_Name",
        },
      },
      {
        $group: {
          _id: "$Product_ID",
          Product_ID: { $first: "$Product_ID" },
          Return_Count: { $first: "$Return_Count" },
          Total_Sales_Qty: { $first: "$Total_Sales_Qty" },
          Return_Rate_Percentage: { $first: "$Return_Rate_Percentage" },
          Product_Name: { $first: "$Product_Name" },
        },
      },
      {
        $sort: { Return_Rate_Percentage: -1 },
      },
    ];

    const result = await salesReturnsCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching unusual patterns in product returns:", error);
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in product returns data",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInProductReturns };
