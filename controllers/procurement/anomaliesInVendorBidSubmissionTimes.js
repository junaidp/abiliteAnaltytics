import { client } from "../../client/index.js";

const anomaliesInVendorBidSubmissionTimes = async (_, res) => {
  try {
    await client.connect();
    const db = client.db("Test");

    const vendorBidsCollection = db.collection("Vendor Bids");

    const results = await vendorBidsCollection
      .aggregate([
        {
          $addFields: {
            SubmissionStatus: {
              $cond: {
                if: { $gt: ["$Submission_Time", "$Deadline"] },
                then: "Late Submission",
                else: {
                  $cond: {
                    if: {
                      $lt: [
                        { $subtract: ["$Deadline", "$Submission_Time"] },
                        7 * 24 * 60 * 60 * 1000,
                      ],
                    },
                    then: "Early Submission",
                    else: "On Time",
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { SubmissionStatus: "Late Submission" },
              { SubmissionStatus: "Early Submission" },
            ],
          },
        },
        {
          $project: {
            Vendor_ID: 1,
            Bid_ID: 1,
            Submission_Time: 1,
            Deadline: 1,
            SubmissionStatus: 1,
          },
        },
        {
          $sort: { Vendor_ID: 1, Submission_Time: 1 },
        },
      ])
      .toArray();

    res.json(results);
  } catch (error) {
    console.error(
      "Error fetching anomalies in vendor bid submission times:",
      error
    );
    res.status(500).json({
      error: "Failed to retrieve anomalies in vendor bid submission times",
    });
  } finally {
    await client.close();
  }
};

export { anomaliesInVendorBidSubmissionTimes };
