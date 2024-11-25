import { client } from "../../client/index.js";

const paymentsWithUnexpectedCrossCurrencyTransactions = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const transactionCurrenciesCollection = db.collection(
      "Transaction Currencies"
    );
    const standardCurrenciesCollection = db.collection("Standard Currencies");

    const pipeline = [
      {
        $lookup: {
          from: "Standard Currencies",
          localField: "AccountID",
          foreignField: "AccountID",
          as: "currencyDetails",
        },
      },
      {
        $unwind: "$currencyDetails",
      },
      {
        $addFields: {
          Transaction_Status: {
            $cond: {
              if: { $ne: ["$Currency", "$currencyDetails.Currency"] },
              then: "Unauthorized Cross-Currency Transaction",
              else: "Authorized Transaction",
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $ne: ["$Currency", "$currencyDetails.Currency"],
          },
        },
      },
      {
        $project: {
          TransactionID: 1,
          AccountID: 1,
          AccountName: "$currencyDetails.AccountName",
          ExpectedCurrency: "$currencyDetails.Currency",
          TransactionCurrency: "$Currency",
          Transaction_Status: 1,
        },
      },
    ];

    const results = await transactionCurrenciesCollection
      .aggregate(pipeline)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error fetching transaction currency status:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve transaction currency status" });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnexpectedCrossCurrencyTransactions };
