import { client } from "../../client/index.js";

const unusualPatternsInEmployeeSalesPerformance = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const employeeSalesCollection = db.collection("Employee Sales");

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const employeeSalesStatsPipeline = [
      {
        $project: {
          Employee_ID: 1,
          TotalSalesAmount: { $sum: "$Sales" },
          SaleYear: { $year: "$Order_Date" },
          SaleMonth: { $month: "$Order_Date" },
        },
      },
      {
        $group: {
          _id: {
            Employee_ID: "$Employee_ID",
            SaleYear: "$SaleYear",
            SaleMonth: "$SaleMonth",
          },
          TotalSalesAmount: { $sum: "$TotalSalesAmount" },
        },
      },
    ];

    const employeeSalesStats = await employeeSalesCollection
      .aggregate(employeeSalesStatsPipeline)
      .toArray();

    const avgSalesPipeline = [
      {
        $match: {
          SaleYear: currentYear,
          SaleMonth: { $lt: currentMonth },
        },
      },
      {
        $group: {
          _id: "$Employee_ID",
          AvgSalesAmount: { $avg: "$TotalSalesAmount" },
        },
      },
    ];

    const avgSalesData = await employeeSalesCollection
      .aggregate(avgSalesPipeline)
      .toArray();

    const currentMonthSalesPipeline = [
      {
        $match: {
          SaleYear: currentYear,
          SaleMonth: currentMonth,
        },
      },
      {
        $lookup: {
          from: "Employee Sales",
          localField: "Employee_ID",
          foreignField: "Employee_ID",
          as: "avgSales",
        },
      },
      {
        $unwind: "$avgSales",
      },
      {
        $project: {
          Employee_ID: 1,
          TotalSalesAmount: 1,
          SaleYear: 1,
          SaleMonth: 1,
          AvgSalesAmount: "$avgSales.AvgSalesAmount",
        },
      },
      {
        $match: {
          $or: [
            {
              TotalSalesAmount: {
                $gt: { $multiply: ["$AvgSalesAmount", 1.15] },
              },
            },
            {
              TotalSalesAmount: {
                $lt: { $multiply: ["$AvgSalesAmount", 0.85] },
              },
            },
          ],
        },
      },
      {
        $sort: { Employee_ID: 1, SaleYear: 1, SaleMonth: 1 },
      },
    ];

    const currentMonthSales = await employeeSalesCollection
      .aggregate(currentMonthSalesPipeline)
      .toArray();

    res.json(currentMonthSales);
  } catch (error) {
    console.error(
      "Error fetching unusual patterns in employee sales performance:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve unusual patterns in employee sales performance data",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInEmployeeSalesPerformance };
