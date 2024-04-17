const ContributionModel = require("../models/contributionModel");
const TopicModel = require("../models/topicModel");
const FacultyModel = require("../models/facultyModel");

const dashBroadAdmin = async (rawData) => {
  try {
    let year = rawData.year;
    let month = rawData.month;
    let start, end;

    if (year) {
      year = Number(year);

      if (month) {
        month = Number(month) - 1; // Giảm 1 vì tháng trong JavaScript bắt đầu từ 0 (0 là tháng 1)
        start = new Date(year, month); // Bắt đầu của tháng
        end = new Date(year, month + 1); // Bắt đầu của tháng tiếp theo
      } else {
        start = new Date(year, 0); // Bắt đầu của năm
        end = new Date(year + 1, 0); // Bắt đầu của năm tiếp theo
      }

      const contributiontime = await ContributionModel.find({
        createdAt: {
          $gte: start,
          $lt: end,
        },
      });

      return {
        DT: contributiontime,
      };
    }
    //const month = req.body.month;
    const adminDashboard = [];
    const dashbroadTopic = [];
    const dashbroadFaculty = [];
    const contributionCount = await ContributionModel.countDocuments();
    const topic = await TopicModel.find();
    const sumTopic = await TopicModel.countDocuments();

    for (const item of topic) {
      const contributionbyTopic = await ContributionModel.countDocuments({
        topic_id: item._id,
      });
      const percentage = (
        (contributionbyTopic / contributionCount) *
        100
      ).toFixed(2);
      const faculty = await FacultyModel.findById(item.faculty_id);
      if (faculty) {
        dashbroadTopic.push({
          topic_name: item.name,
          faculty_name: faculty.faculty_name,
          contribution_count: contributionbyTopic,
          percent: percentage + "%",
        });
      }
      dashbroadTopic.push({
        topic_name: item.name,
        contribution_count: contributionbyTopic,
        percent: percentage + "%",
      });
    }

    const faculty = await FacultyModel.find();
    for (const item of faculty) {
      const contributionbyFaculty = await ContributionModel.countDocuments({
        faculty_id: item._id,
      });
      const percentage = (
        (contributionbyFaculty / contributionCount) *
        100
      ).toFixed(2);
      const uniqueContributors = await ContributionModel.distinct("user_id", {
        faculty_id: item._id,
      });
      dashbroadFaculty.push({
        faculty_name: item.faculty_name,
        contribution_count: contributionbyFaculty,
        unique_contributors: uniqueContributors.length,
        percent: percentage + "%",
      });
    }

    const currentDate = new Date();
    const twoWeeksAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 14)
    );

    const contributionsNoComments = await ContributionModel.find({
      comments: { $size: 0 },
    });

    const contributionsNoRecentComments = await ContributionModel.find({
      "comments.createdAt": { $lte: twoWeeksAgo },
      comments: { $size: 0 },
    });

    adminDashboard.push({
      Sum_of_Contribution: contributionCount,
      topic: {
        Sum_of_Topic: sumTopic,
        dashbroadTopic,
      },
      faculty: {
        Sum_of_Faculty: faculty.length,
        dashbroadFaculty,
      },
      contributions_no_comments: contributionsNoComments.length, // Add contributions with no comments
      contributions_no_comments_apter14days:
        contributionsNoRecentComments.length, // Add contributions with no comments in the last 14 days
    });
    return {
      EM: "Export information successfully",
      EC: 0,
      DT: adminDashboard,
    };
  } catch (error) {
    console.log(">> Dash broad admin error (service): " + error);
    res.status(500).json({
      EM: "Export information fail ",
      EC: 1,
    });
  }
};

const dashBroadAdminService = async (rawData) => {
  try {
    const result = [];
    const percentFaculty = [];
    const details = [];
    const currentDate = new Date();
    const twoWeeksAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 14)
    );
    const faculty = await FacultyModel.find();
    if (rawData.year && !rawData.month) {
      const year = Number(rawData.year);
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

      const Contributions = await ContributionModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfYear,
              $lt: endOfYear,
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            contributionCount: { $sum: 1 },
            contributions: { $push: "$$ROOT" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      const faculty = await FacultyModel.find();

      const result = {};
      for (const { _id, contributionCount, contributions } of Contributions) {
        const month = _id.month;
        const percentFaculty = [];
        const details = [];

        // Assuming that faculty is an array
        for (const item of faculty) {
          // Filter the contributions by faculty
          const contributionByFaculty = contributions.filter(
            (contribution) =>
              contribution.faculty_id.toString() === item._id.toString()
          );
          // Calculate the percentage
          const percentage = (
            (contributionByFaculty.length / contributionCount) *
            100
          ).toFixed(2);

          // Add to percentFaculty if percentage is not 0
          if (
            percentage &&
            percentage !== "0.00" &&
            contributionByFaculty.length !== 0
          ) {
            percentFaculty.push({
              faculty_name: item.faculty_name,
              percent: percentage + "%",
            });
          }

          // Add to details if there are contributions by faculty
          if (contributionByFaculty.length > 0) {
            const uniqueContributors = [
              ...new Set(
                contributionByFaculty.map((contribution) =>
                  contribution.user_id.toString()
                )
              ),
            ];
            const contributionsNoComments = contributionByFaculty.filter(
              (contribution) => contribution.comments.length === 0
            ).length;
            const contributionsNoRecentComments = contributionByFaculty.filter(
              (contribution) =>
                contribution.comments.length === 0 ||
                contribution.comments.every(
                  (comment) => new Date(comment.createdAt) <= twoWeeksAgo
                )
            ).length;

            details.push({
              faculty_name: item.faculty_name,
              contribution_count: contributionByFaculty.length,
              unique_contributors: uniqueContributors.length,
              contributionsNoComments,
              contributionsNoRecentComments,
            });
          }
        }

        result[`Month ${month}`] = {
          sumOfContribution: contributionCount,
          percentFaculty,
          details,
        };
      }

      return {
        EM: "Export DashBroad by year successfully",
        EC: 0,
        DT: result,
      };
    }

    if (rawData.year && rawData.month) {
      const year = Number(rawData.year);
      const month = Number(rawData.month) - 1; // months are 0-indexed in JavaScript
      const startOfMonth = new Date(Date.UTC(year, month, 1));
      const endOfMonth = new Date(Date.UTC(year, month + 1, 1));

      const Contributions = await ContributionModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            contributionCount: { $sum: 1 },
            contributions: { $push: "$$ROOT" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ]);

      const faculty = await FacultyModel.find();

      const result = {};
      let week = 0;
      let weekData = {
        sumOfContribution: 0,
        percentFaculty: [],
        details: [],
      };

      for (const { _id, contributionCount, contributions } of Contributions) {
        const day = _id.day;

        if (day % 7 === 1 && day !== 1) {
          result[`Week ${++week}`] = weekData;
          weekData = {
            sumOfContribution: 0,
            percentFaculty: [],
            details: [],
          };
        }

        weekData.sumOfContribution += contributionCount;

        for (const item of faculty) {
          const contributionByFaculty = contributions.filter(
            (contribution) =>
              contribution.faculty_id.toString() === item._id.toString()
          );

          const percentage = (
            (contributionByFaculty.length / contributionCount) *
            100
          ).toFixed(2);

          if (
            percentage &&
            percentage !== "0.00" &&
            contributionByFaculty.length !== 0
          ) {
            weekData.percentFaculty.push({
              faculty_name: item.faculty_name,
              percent: percentage + "%",
            });
          }

          if (contributionByFaculty.length > 0) {
            const uniqueContributors = [
              ...new Set(
                contributionByFaculty.map((contribution) =>
                  contribution.user_id.toString()
                )
              ),
            ];
            const contributionsNoComments = contributionByFaculty.filter(
              (contribution) => contribution.comments.length === 0
            ).length;
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            const contributionsNoRecentComments = contributionByFaculty.filter(
              (contribution) =>
                contribution.comments.length === 0 ||
                contribution.comments.every(
                  (comment) => new Date(comment.createdAt) <= twoWeeksAgo
                )
            ).length;

            weekData.details.push({
              faculty_name: item.faculty_name,
              contribution_count: contributionByFaculty.length,
              unique_contributors: uniqueContributors.length,
              contributionsNoComments,
              contributionsNoRecentComments,
            });
          }
        }
      }

      result[`Week ${week + 1}`] = weekData;

      return {
        EM: "Export DashBroad by year and month successfully",
        EC: 0,
        DT: result,
      };
    }

    const contributionCount = await ContributionModel.countDocuments();

    for (const item of faculty) {
      const contributionByFaculty = await ContributionModel.countDocuments({
        faculty_id: item._id,
      });
      const percentage = (
        (contributionByFaculty / contributionCount) *
        100
      ).toFixed(2);

      if (percentage && percentage !== "0.00") {
        percentFaculty.push({
          faculty_name: item.faculty_name,
          percent: percentage + "%",
        });
      }

      if (contributionByFaculty > 0) {
        const uniqueContributors = await ContributionModel.distinct("user_id", {
          faculty_id: item._id,
        });
        const contributionsNoComments = await ContributionModel.countDocuments({
          comments: { $size: 0 },
        });
        const contributionsNoRecentComments =
          await ContributionModel.countDocuments({
            "comments.createdAt": { $lte: twoWeeksAgo },
            comments: { $size: 0 },
          });
        details.push({
          faculty_name: item.faculty_name,
          contribution_count: contributionByFaculty,
          unique_contributors: uniqueContributors.length,
          contributionsNoComments,
          contributionsNoRecentComments,
        });
      }
    }

    result.push({
      sumOfContribution: contributionCount,
      percentFaculty,
      details,
    });

    return {
      EM: "Export information successfully",
      EC: 0,
      DT: result,
    };
  } catch (error) {
    console.log(">> Dash broad admin error (service): " + error);
    return {
      EM: "Export information fail ",
      EC: 1,
    };
  }
};

const dashBroadCoordinator = async (decoded) => {
  try {
    const dashBroadCoordinator = [];
    console.log(decoded.faculty_id);
    const topic = await TopicModel.find({
      faculty_id: decoded.faculty_id,
    });
    console.log(topic);
    if (!topic) {
      return {
        EM: "Topic not found",
        EC: 1,
        DT: "",
        status: 404,
      };
    }
    console.log(topic);
    return {
      EM: "Export information successfully",
      EC: 0,
      DT: topic,
      status: 200,
    };
  } catch (error) {
    console.log(">> Dash broad coordinator error (service): " + error);
    return {
      EM: "Export information fail ",
      EC: 1,
      status: 400,
    };
  }
};

module.exports = {
  dashBroadAdmin,
  dashBroadCoordinator,
  dashBroadAdminService,
};
