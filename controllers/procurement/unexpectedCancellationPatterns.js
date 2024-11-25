import { client } from "../../client/index.js";

const unexpectedCancellationPatterns = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const orderData = await db
      .collection("Orders Data")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$Order_Date" },
              month: { $month: "$Order_Date" },
            },
            TotalOrders: { $sum: 1 },
            CancelledOrders: {
              $sum: {
                $cond: [{ $eq: ["$Order_Status", "Cancelled"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            OrderYear: "$_id.year",
            OrderMonth: "$_id.month",
            TotalOrders: 1,
            CancelledOrders: 1,
            CancellationRate: {
              $cond: [
                { $gt: ["$TotalOrders", 0] },
                {
                  $multiply: [
                    { $divide: ["$CancelledOrders", "$TotalOrders"] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray();

    const rates = orderData.map((o) => o.CancellationRate);
    const avgCancellationRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const stdDevCancellationRate = Math.sqrt(
      rates.reduce(
        (sum, rate) => sum + Math.pow(rate - avgCancellationRate, 2),
        0
      ) / rates.length
    );

    const results = orderData
      .map((data) => ({
        ...data,
        AvgCancellationRate: avgCancellationRate,
        StdDevCancellationRate: stdDevCancellationRate,
        CancellationFlag:
          data.CancellationRate >
          avgCancellationRate + 2 * stdDevCancellationRate
            ? "High Cancellation Rate"
            : data.CancellationRate <
              avgCancellationRate - 2 * stdDevCancellationRate
            ? "Low Cancellation Rate"
            : null,
      }))
      .filter((data) => data.CancellationFlag !== null)
      .sort((a, b) => a.OrderYear - b.OrderYear || a.OrderMonth - b.OrderMonth);

    res.status(200).json({
      message:
        "Fetched unexpected patterns in order cancellation rates successfully",
      data: results,
    });
  } catch (error) {
    console.error(
      "Error fetching unexpected patterns in order cancellation rates:",
      error
    );
    res.status(500).json({
      message: "Error fetching unexpected patterns in order cancellation rates",
      error: error.message,
    });
  } finally {
    await client.close();
  }
};

export { unexpectedCancellationPatterns };
