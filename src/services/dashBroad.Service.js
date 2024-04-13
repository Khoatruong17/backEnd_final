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
};
