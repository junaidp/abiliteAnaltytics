import { client } from "../../client/index.js";

const inconsistentUnitPrices = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const productsCollection = db.collection("Products");

    const pipeline = [
      {
        $group: {
          _id: null,
          avgUnitPrice: { $avg: "$Unit_Price" },
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
              { $gt: ["$products.Unit_Price", "$avgUnitPrice"] },
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
                                "$products.Unit_Price",
                                "$avgUnitPrice",
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
                  { $lt: ["$products.Unit_Price", "$avgUnitPrice"] },
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
                                    "$products.Unit_Price",
                                    "$avgUnitPrice",
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
          DeviationPercentageFromPrevPrice: {
            $concat: [
              {
                $cond: [
                  { $gt: ["$products.Unit_Price", "$products.Prev_Price"] },
                  "+",
                  {
                    $cond: [
                      { $lt: ["$products.Unit_Price", "$products.Prev_Price"] },
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
                            "$products.Unit_Price",
                            "$products.Prev_Price",
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
                      $subtract: [
                        "$products.Unit_Price",
                        "$products.Prev_Price",
                      ],
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
                      $subtract: [
                        "$products.Unit_Price",
                        "$products.Prev_Price",
                      ],
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
          Unit_Price: "$products.Unit_Price",
          Prev_Price: "$products.Prev_Price",
          AvgPrice: "$avgUnitPrice",
          DeviationPercentageFromAvg: 1,
          DeviationPercentageFromPrevPrice: 1,
        },
      },
    ];

    const result = await productsCollection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching inconsistent unit prices:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve inconsistent unit prices" });
  } finally {
    await client.close();
  }
};

export { inconsistentUnitPrices };
