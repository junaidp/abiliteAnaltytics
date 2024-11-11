import { client } from "../../client/index.js";

const inconsistentUnitCosts = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const productsCollection = db.collection("Products");

    const pipeline = [
      {
        $group: {
          _id: null,
          avgUnitCost: { $avg: "$Unit_Cost" },
        },
      },
      {
        $lookup: {
          from: "Products",
          localField: "Product_ID",
          foreignField: "Product_ID",
          as: "products",
        },
      },
      {
        $unwind: "$products",
      },
      {
        $addFields: {
          DeviationPercentageFromAvg: {
            $cond: [
              { $gt: ["$products.Unit_Cost", "$avgUnitCost"] },
              {
                $concat: [
                  "+",
                  {
                    $round: [
                      {
                        $multiply: [
                          {
                            $abs: {
                              $subtract: [
                                "$products.Unit_Cost",
                                "$avgUnitCost",
                              ],
                            },
                          },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                ],
              },
              {
                $cond: [
                  { $lt: ["$products.Unit_Cost", "$avgUnitCost"] },
                  {
                    $concat: [
                      "-",
                      {
                        $round: [
                          {
                            $multiply: [
                              {
                                $abs: {
                                  $subtract: [
                                    "$products.Unit_Cost",
                                    "$avgUnitCost",
                                  ],
                                },
                              },
                              100,
                            ],
                          },
                          2,
                        ],
                      },
                    ],
                  },
                  "0.00",
                ],
              },
            ],
          },
          DeviationPercentageFromPrevCost: {
            $concat: [
              {
                $cond: [
                  { $gt: ["$products.Unit_Cost", "$products.prev_cost"] },
                  "+",
                  {
                    $cond: [
                      { $lt: ["$products.Unit_Cost", "$products.prev_cost"] },
                      "-",
                      "",
                    ],
                  },
                ],
              },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $abs: {
                          $subtract: [
                            "$products.Unit_Cost",
                            "$products.prev_cost",
                          ],
                        },
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              $expr: {
                $gt: [
                  {
                    $abs: {
                      $subtract: ["$products.Unit_Cost", "$products.prev_cost"],
                    },
                  },
                  10,
                ],
              },
            },
            {
              $expr: {
                $lt: [
                  {
                    $abs: {
                      $subtract: ["$products.Unit_Cost", "$products.prev_cost"],
                    },
                  },
                  -10,
                ],
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          Product_ID: "$products.Product_ID",
          Product_Name: "$products.Product_Name",
          Unit_Cost: "$products.Unit_Cost",
          prev_cost: "$products.prev_cost",
          AvgCost: "$avgUnitCost",
          DeviationPercentageFromAvg: 1,
          DeviationPercentageFromPrevCost: 1,
        },
      },
    ];

    const result = await productsCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching inconsistent unit costs:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve inconsistent unit costs" });
  } finally {
    await client.close();
  }
};

export { inconsistentUnitCosts };
