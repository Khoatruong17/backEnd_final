const ContributionModel = require("../models/contributionModel");
const TopicModel = require("../models/topicModel");
const FacultyModel = require("../models/facultyModel");

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

        result.push({
          month: `Month ${month}`,
          sumOfContribution: contributionCount,
          percentTopic,
          details,
        });
      }

      return {
        EM: "Export DashBroad for admin by year successfully",
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
        EM: "Export DashBroad for admin by year and month successfully",
        EC: 0,
        DT: result,
      };
    }

    const contributionCount = await ContributionModel.countDocuments();

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

    result.push({
      sumOfContribution: contributionCount,
      percentFaculty,
      details,
    });

    return {
      EM: "Export DashBroad for admin successfully",
      EC: 0,
      DT: result,
    };
  } catch (error) {
    console.log(">> Dash broad admin error (service): " + error);
    return {
      EM: "Export DashBroad for admin fail ",
      EC: 1,
    };
  }
};

const dashBroadCoordinator = async (rawData, decoded) => {
  try {
    const result = [];
    const percentTopic = [];
    const details = [];
    const currentDate = new Date();
    const twoWeeksAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 14)
    );

    const faculty = await FacultyModel.findById(decoded.faculty_id);
    if (!faculty) {
      throw new Error("Faculty not found");
    }
    const contributionCount = await ContributionModel.countDocuments({
      faculty_id: decoded.faculty_id,
    });

    if (rawData.year && !rawData.month) {
      const year = Number(rawData.year);
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

      const Contributions = await ContributionModel.aggregate([
        {
          $match: {
            submit_date: {
              $gte: startOfYear,
              $lt: endOfYear,
            },
            faculty_id: faculty._id,
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$submit_date" },
              year: { $year: "$submit_date" },
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

      const topics = await TopicModel.find({ faculty_id: faculty._id });
      const result = {};

      for (const { _id, contributionCount, contributions } of Contributions) {
        const month = _id.month;
        const percentTopic = [];
        const details = [];

        for (const item of topics) {
          const contributionByTopic = contributions.filter(
            (contribution) =>
              contribution.topic_id.toString() === item._id.toString()
          );
          const percentage = (
            (contributionByTopic.length / contributionCount) *
            100
          ).toFixed(2);

          if (percentage && percentage !== "0.00") {
            percentTopic.push({
              topic_name: item.name,
              percent: percentage + "%",
            });
          }

          if (contributionByTopic.length > 0) {
            const uniqueContributors = [
              ...new Set(
                contributionByTopic.map((contribution) =>
                  contribution.user_id.toString()
                )
              ),
            ];
            const contributionsNoComments = contributionByTopic.filter(
              (contribution) => contribution.comments.length === 0
            ).length;
            const contributionsNoRecentComments = contributionByTopic.filter(
              (contribution) =>
                contribution.comments.every(
                  (comment) => new Date(comment.createdAt) <= twoWeeksAgo
                )
            ).length;

            details.push({
              topic_name: item.name,
              contribution_count: contributionByTopic.length,
              unique_contributors: uniqueContributors.length,
              contributionsNoComments,
              contributionsNoRecentComments,
            });
          }
        }
        result.push({
          month: `Month ${month}`,
          sumOfContribution: contributionCount,
          percentTopic,
          details,
        });
      }

      return {
        EM: "Export DashBroad for coordinator by year successfully",
        EC: 0,
        DT: result,
      };
    }

    if (rawData.year && rawData.month) {
      const year = Number(rawData.year);
      const month = Number(rawData.month);
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, month, 1));

      const Contributions = await ContributionModel.aggregate([
        {
          $match: {
            submit_date: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
            faculty_id: faculty._id,
          },
        },
        {
          $addFields: {
            weekOfMonth: {
              $subtract: [{ $week: "$submit_date" }, { $week: startOfMonth }],
            },
          },
        },
        {
          $group: {
            _id: {
              week: "$weekOfMonth",
            },
            contributionCount: { $sum: 1 },
            contributions: { $push: "$$ROOT" },
          },
        },
        {
          $sort: {
            "_id.week": 1,
          },
        },
      ]);

      const topics = await TopicModel.find({ faculty_id: faculty._id });
      const result = {};

      for (const { _id, contributionCount, contributions } of Contributions) {
        const week = _id.week;
        const percentTopic = [];
        const details = [];

        for (const item of topics) {
          const contributionByTopic = contributions.filter(
            (contribution) =>
              contribution.topic_id.toString() === item._id.toString()
          );
          const percentage = (
            (contributionByTopic.length / contributionCount) *
            100
          ).toFixed(2);

          if (percentage && percentage !== "0.00") {
            percentTopic.push({
              topic_name: item.name,
              percent: percentage + "%",
            });
          }

          if (contributionByTopic.length > 0) {
            const uniqueContributors = [
              ...new Set(
                contributionByTopic.map((contribution) =>
                  contribution.user_id.toString()
                )
              ),
            ];
            const contributionsNoComments = contributionByTopic.filter(
              (contribution) => contribution.comments.length === 0
            ).length;
            const contributionsNoRecentComments = contributionByTopic.filter(
              (contribution) =>
                contribution.comments.length === 0 ||
                contribution.comments.every(
                  (comment) => new Date(comment.createdAt) <= twoWeeksAgo
                )
            ).length;

            details.push({
              topic_name: item.name,
              contribution_count: contributionByTopic.length,
              unique_contributors: uniqueContributors.length,
              contributionsNoComments,
              contributionsNoRecentComments,
            });
          }
        }
        result.push({
          week: `Week ${week}`,
          sumOfContribution: contributionCount,
          percentTopic,
          details,
        });
      }

      return {
        EM: "Export DashBroad for coordinator by week of month successfully",
        EC: 0,
        DT: result,
      };
    }
    const topics = await TopicModel.find({ faculty_id: decoded.faculty_id }); // get all topics of the faculty

    for (const item of topics) {
      const contributionByTopic = await ContributionModel.countDocuments({
        topic_id: item._id,
        faculty_id: faculty._id,
      });

      const percentage = (
        (contributionByTopic / contributionCount) *
        100
      ).toFixed(2);

      if (percentage && percentage !== "0.00") {
        percentTopic.push({
          topic_name: item.name,
          percent: percentage + "%",
        });
      }
    }

    if (contributionCount > 0) {
      const uniqueContributors = await ContributionModel.distinct("user_id", {
        faculty_id: faculty._id,
      });
      const contributionsNoComments = await ContributionModel.countDocuments({
        comments: { $size: 0 },
        faculty_id: faculty._id,
      });
      const contributionsNoRecentComments =
        await ContributionModel.countDocuments({
          "comments.createdAt": { $lte: twoWeeksAgo },
          comments: { $size: 0 },
          faculty_id: faculty._id,
        });
      details.push({
        faculty_name: faculty.faculty_name,
        contribution_count: contributionCount,
        unique_contributors: uniqueContributors.length,
        contributionsNoComments,
        contributionsNoRecentComments,
      });
    }
    result.push({
      sumOfContribution: contributionCount,
      percentTopic,
      details,
    });

    return {
      EM: "Export DashBroad for coordinator successfully",
      EC: 0,
      DT: result,
    };
  } catch (error) {
    console.log(">> Dash broad coordinator error (service): " + error);
    return { EM: "Export DashBroad for coordinator fail ", EC: 1 };
  }
};

module.exports = {
  dashBroadCoordinator,
  dashBroadAdminService,
};
