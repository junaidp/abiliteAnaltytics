import { client } from "../../client/index.js";

const abnormalProcurementLogins = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const loginsHistoryCollection = db.collection("Logins History");

    const results = await loginsHistoryCollection
      .aggregate([
        {
          $project: {
            AccountID: 1,
            LoginHour: { $hour: "$Login_Time" },
            LoginMinute: { $minute: "$Login_Time" },
            LoginSecond: { $second: "$Login_Time" },
          },
        },
        {
          $match: {
            $or: [
              { LoginHour: { $lt: 9 } },
              { LoginHour: { $gt: 18 } },
              {
                $and: [{ LoginHour: { $eq: 18 } }, { LoginMinute: { $gt: 0 } }],
              },
            ],
          },
        },
        {
          $project: {
            AccountID: 1,
            Status: { $literal: "Login Outside Business Hours" },
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching abnormal patterns in procurement logins:",
      error
    );
    res.status(500).json({
      error:
        "Failed to retrieve abnormal patterns in procurement system logins",
    });
  } finally {
    await client.close();
  }
};

export { abnormalProcurementLogins };
