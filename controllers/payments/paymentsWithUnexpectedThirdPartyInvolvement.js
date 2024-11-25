import { client } from "../../client/index.js";

const paymentsWithUnexpectedThirdPartyInvolvement = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const paymentsThirdPartyCollection = db.collection("Payments Third Party");

    const results = await paymentsThirdPartyCollection
      .aggregate([
        {
          $match: {
            Third_Party_Involved: "Yes",
            Expected_Involvement: "No",
          },
        },
        {
          $project: {
            Payment_ID: 1,
            Amount: 1,
            Expense_Category: 1,
            Payment_Date: 1,
            Third_Party_Involved: 1,
            Expected_Involvement: 1,
          },
        },
        {
          $sort: {
            Payment_Date: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching payments with unexpected third-party involvement:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve payments with unexpected third-party involvement",
    });
  } finally {
    await client.close();
  }
};

export { paymentsWithUnexpectedThirdPartyInvolvement };
