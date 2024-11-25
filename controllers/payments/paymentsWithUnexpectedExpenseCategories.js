import { client } from "../../client/index.js";

const paymentsWithUnexpectedExpenseCategories = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentCategoriesCollection = db.collection("Payment Categories");

    const pipeline = [
      {
        $group: {
          _id: "$Expense_Category",
          TotalAmount: { $sum: "$Amount" },
          PaymentCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "Payment Categories",
          localField: "_id",
          foreignField: "Expense_Category",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $lookup: {
          from: "Payment Categories",
          pipeline: [
            {
              $group: {
                _id: null,
                GrandTotal: { $sum: "$Amount" },
              },
            },
          ],
          as: "grandTotal",
        },
      },
      {
        $unwind: "$grandTotal",
      },
      {
        $match: {
          $expr: {
            $lt: [
              "$TotalAmount",
              { $multiply: [0.05, "$grandTotal.GrandTotal"] },
            ],
          },
        },
      },
      {
        $project: {
          Payment_ID: "$categoryDetails.Payment_ID",
          Amount: "$categoryDetails.Amount",
          Expense_Category: "$categoryDetails.Expense_Category",
          Payment_Date: "$categoryDetails.Payment_Date",
        },
      },
      {
        $sort: { Payment_Date: 1 },
      },
    ];

    const results = await paymentCategoriesCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching category payment status:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve category payment status" });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnexpectedExpenseCategories };
