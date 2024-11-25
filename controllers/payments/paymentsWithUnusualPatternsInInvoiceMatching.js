import { client } from "../../client/index.js";

const paymentsWithUnusualPatternsInInvoiceMatching = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentInvoicesCollection = db.collection("Payment Invoices");

    const results = await paymentInvoicesCollection
      .aggregate([
        {
          $addFields: {
            AmountDiscrepancy: {
              $abs: { $subtract: ["$InvoiceAmount", "$PaidAmount"] },
            },
            TaxDiscrepancy: {
              $abs: { $subtract: ["$InvoiceTax", "$PaidTax"] },
            },
          },
        },
        {
          $match: {
            $or: [
              {
                AmountDiscrepancy: {
                  $gt: [{ $multiply: ["$InvoiceAmount", 0.05] }],
                },
              },
              {
                TaxDiscrepancy: { $gt: [{ $multiply: ["$InvoiceTax", 0.05] }] },
              },
            ],
          },
        },
        {
          $project: {
            PaymentID: 1,
            InvoiceID: 1,
            VendorID: 1,
            InvoiceAmount: 1,
            PaidAmount: 1,
            InvoiceTax: 1,
            PaidTax: 1,
            AmountDiscrepancy: 1,
            TaxDiscrepancy: 1,
            MatchingStatus: {
              $switch: {
                branches: [
                  {
                    case: {
                      $gt: [
                        "$AmountDiscrepancy",
                        { $multiply: ["$InvoiceAmount", 0.05] },
                      ],
                    },
                    then: "Amount Mismatch",
                  },
                  {
                    case: {
                      $gt: [
                        "$TaxDiscrepancy",
                        { $multiply: ["$InvoiceTax", 0.05] },
                      ],
                    },
                    then: "Tax Mismatch",
                  },
                ],
                default: "Matched",
              },
            },
          },
        },
        {
          $sort: {
            PaymentID: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching payments with unusual patterns in invoice matching:",
      error
    );
    res
      .status(500)
      .json({
        error:
          "Failed to retrieve payments with unusual patterns in invoice matching",
      });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnusualPatternsInInvoiceMatching };
