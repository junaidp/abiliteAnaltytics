import { client } from "../../client/index.js";

const abnormalVendorRelationshipDurations = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const vendorsCollection = db.collection("Vendors");

    const results = await vendorsCollection
      .aggregate([
        {
          $addFields: {
            DurationInDays: {
              $cond: {
                if: { $eq: ["$End_Date", null] },
                then: {
                  $divide: [
                    { $subtract: [new Date(), "$Start_Date"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
                else: {
                  $divide: [
                    { $subtract: ["$End_Date", "$Start_Date"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            },
            RelationshipStatus: {
              $cond: {
                if: { $eq: ["$End_Date", null] },
                then: {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $divide: [
                            { $subtract: [new Date(), "$Start_Date"] },
                            1000 * 60 * 60 * 24,
                          ],
                        },
                        365,
                      ],
                    },
                    then: "Unusually Long",
                    else: "Normal Duration",
                  },
                },
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        {
                          $divide: [
                            { $subtract: ["$End_Date", "$Start_Date"] },
                            1000 * 60 * 60 * 24,
                          ],
                        },
                        30,
                      ],
                    },
                    then: "Abrupt End",
                    else: "Normal End",
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { RelationshipStatus: "Abrupt End" },
              { RelationshipStatus: "Unusually Long" },
            ],
          },
        },
        {
          $project: {
            Vendor_ID: 1,
            Start_Date: 1,
            End_Date: 1,
            DurationInDays: 1,
            RelationshipStatus: 1,
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
      "Error fetching abnormal vendor relationship durations:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve abnormal vendor relationship durations",
    });
  } finally {
    await client.close();
  }
};

export { abnormalVendorRelationshipDurations };
