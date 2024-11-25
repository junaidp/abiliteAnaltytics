import { client } from "../../client/index.js";

const unusualPatternsInPaymentMetadata = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentMetadataCollection = db.collection("Payment Metadata");

    const results = await paymentMetadataCollection
      .aggregate([
        {
          $addFields: {
            TimeStatus: {
              $cond: {
                if: {
                  $or: [
                    { $lt: [{ $hour: "$PaymentDateTime" }, 6] },
                    { $gt: [{ $hour: "$PaymentDateTime" }, 20] },
                  ],
                },
                then: "Unusual Time",
                else: "Normal Time",
              },
            },
            CodeStatus: {
              $cond: {
                if: {
                  $not: {
                    $in: ["$TransactionCode", ["EXP001", "SAL001", "EXP002"]],
                  },
                },
                then: "Rare Code",
                else: "Common Code",
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { $expr: { $lt: [{ $hour: "$PaymentDateTime" }, 6] } },
              { $expr: { $gt: [{ $hour: "$PaymentDateTime" }, 20] } },
              {
                $expr: {
                  $not: {
                    $in: ["$TransactionCode", ["EXP001", "SAL001", "EXP002"]],
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            PaymentID: 1,
            PaymentAmount: 1,
            PaymentDateTime: 1,
            TransactionCode: 1,
            TimeStatus: 1,
            CodeStatus: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching unusual patterns in payment metadata:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in payment metadata",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInPaymentMetadata };
