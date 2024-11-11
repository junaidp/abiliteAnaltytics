import { client } from "../../client/index.js";

const unusualPatternsInCustomerReturns = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");
    const ordersReturnCollection = db.collection("Orders Return");

    const customerReturnStatsPipeline = [
      {
        $group: {
          _id: "$Customer_ID",
          ReturnCount: {
            $sum: { $cond: [{ $eq: ["$Returned", "Yes"] }, 1, 0] },
          },
          TotalOrderCount: { $sum: 1 },
        },
      },
    ];

    const customerReturnStats = await ordersReturnCollection
      .aggregate(customerReturnStatsPipeline)
      .toArray();

    const customerReturnRate = customerReturnStats.map((customer) => {
      const returnRate = (
        (customer.ReturnCount / customer.TotalOrderCount) *
        100
      ).toFixed(2);
      return {
        Customer_ID: customer._id,
        ReturnCount: customer.ReturnCount,
        TotalOrderCount: customer.TotalOrderCount,
        ReturnRate: parseFloat(returnRate),
      };
    });

    const filteredCustomers = customerReturnRate.filter(
      (customer) => customer.ReturnRate > 20
    );

    const sortedResult = filteredCustomers.sort(
      (a, b) => b.ReturnRate - a.ReturnRate
    );

    res.json(sortedResult);
  } catch (error) {
    console.error(
      "Error fetching unusual patterns in customer returns:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve unusual patterns in customer returns data",
    });
  } finally {
    await client.close();
  }
};

export { unusualPatternsInCustomerReturns };
