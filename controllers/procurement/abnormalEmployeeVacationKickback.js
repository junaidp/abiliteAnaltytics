import { client } from "../../client/index.js";

const abnormalEmployeeVacationKickback = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const purchasesCollection = db.collection("Purchases");
    const employeeLeavesCollection = db.collection("Employee Leaves");

    const results = await purchasesCollection
      .aggregate([
        {
          $lookup: {
            from: "Employee Leaves",
            let: { transaction_date: "$Transaction_Date" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $gte: ["$Leave_Start_Date", "$$transaction_date"] },
                      { $lte: ["$Leave_End_Date", "$$transaction_date"] },
                    ],
                  },
                },
              },
              {
                $project: { Employee_ID: 1 },
              },
            ],
            as: "leave_data",
          },
        },
        {
          $unwind: { path: "$leave_data", preserveNullAndEmptyArrays: true },
        },
        {
          $match: {
            "leave_data.Employee_ID": { $exists: true },
          },
        },
        {
          $group: {
            _id: "$Vendor_ID",
            LeaveTransactions: { $push: "$Transaction_Amount" },
          },
        },
        {
          $lookup: {
            from: "Purchases",
            localField: "_id",
            foreignField: "Vendor_ID",
            as: "NormalPurchases",
          },
        },
        {
          $unwind: "$NormalPurchases",
        },

        {
          $group: {
            _id: "$_id",
            NormalAvgTransactionAmount: {
              $avg: "$NormalPurchases.Transaction_Amount",
            },
          },
        },

        {
          $project: {
            Vendor_ID: "$_id",
            AvgLeaveSpending: { $avg: "$LeaveTransactions" },
            NormalAvgTransactionAmount: 1,
          },
        },

        {
          $match: {
            $expr: {
              $gt: [
                "$AvgLeaveSpending",
                { $multiply: ["$NormalAvgTransactionAmount", 1.5] },
              ],
            },
          },
        },

        {
          $project: {
            Vendor_ID: 1,
            AvgNormalSpending: "$NormalAvgTransactionAmount",
            AvgSpendingDuringLeave: "$AvgLeaveSpending",
          },
        },

        {
          $sort: { Vendor_ID: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching abnormal patterns in employee vacation or kickback activities:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve abnormal patterns in employee vacation or kickback activities",
    });
  } finally {
    await client.close();
  }
};

export { abnormalEmployeeVacationKickback };
