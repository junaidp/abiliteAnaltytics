import { client } from "../../client/index.js";

const suspiciousCustomerBehavior = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const ordersCollection = db.collection("Orders Discount");

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const currentYear = new Date();

    const customerOrderStatsPipeline = [
      {
        $match: {
          Order_Date: {
            $gte: new Date(lastYear.getFullYear(), 0, 1),
            $lt: new Date(currentYear.getFullYear(), 0, 1),
          },
        },
      },
      {
        $addFields: {
          Order_Date: { $toDate: "$Order_Date" },
        },
      },
      {
        $group: {
          _id: "$Customer_ID",
          OrderCount: { $sum: 1 },
          AvgOrderAmount: { $avg: "$Order_Amount" },
          OrderDate: { $first: "$Order_Date" },
        },
      },
    ];

    const customerOrderStats = await ordersCollection
      .aggregate(customerOrderStatsPipeline)
      .toArray();

    const averagesPipeline = [
      {
        $group: {
          _id: null,
          AvgOrderCountLastYear: { $avg: "$OrderCount" },
          AvgOrderAmountLastYear: { $avg: "$AvgOrderAmount" },
        },
      },
    ];

    const averages = await ordersCollection
      .aggregate(averagesPipeline)
      .toArray();

    const currentStatsPipeline = [
      {
        $match: {
          Order_Date: {
            $gte: new Date(currentYear.getFullYear(), 0, 1),
            $lt: new Date(currentYear.getFullYear() + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: "$Customer_ID",
          OrderCount: { $sum: 1 },
          AvgOrderAmount: { $avg: "$Order_Amount" },
        },
      },
    ];

    const currentStats = await ordersCollection
      .aggregate(currentStatsPipeline)
      .toArray();

    const result = currentStats
      .map((customer) => {
        const lastYearStats = customerOrderStats.find(
          (stat) => stat._id === customer._id
        );
        if (!lastYearStats) return null;

        const avgOrderAmountPercentDiff =
          ((customer.AvgOrderAmount - averages[0].AvgOrderAmountLastYear) /
            averages[0].AvgOrderAmountLastYear) *
          100;

        if (
          customer.OrderCount > 1.15 * averages[0].AvgOrderCountLastYear ||
          customer.AvgOrderAmount > 1.15 * averages[0].AvgOrderAmountLastYear
        ) {
          return {
            Customer_ID: customer._id,
            OrderCount: customer.OrderCount,
            AvgOrderAmount: customer.AvgOrderAmount,
            AvgOrderAmountPercentDiff: avgOrderAmountPercentDiff.toFixed(2),
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json(result);
  } catch (error) {
    console.error("Error fetching suspicious customer behavior:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve suspicious customer behavior data" });
  } finally {
    await client.close();
  }
};

export { suspiciousCustomerBehavior };
