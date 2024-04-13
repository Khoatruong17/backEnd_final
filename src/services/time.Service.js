const convertToGMT7 = (dateString) => {
  try {
    if (!dateString) {
      throw new Error("A date string is required.");
    }
    if (typeof dateString !== "string") {
      throw new Error("The date string must be a string.");
    }
    let date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string.");
    }
    let options = { timeZone: "Asia/Ho_Chi_Minh", hour12: false };
    let dateInGMT7 = new Date(date.toLocaleString("en-US", options));
    let formattedDate =
      dateInGMT7.toLocaleTimeString() + " _ " + dateInGMT7.toLocaleDateString();

    return formattedDate;
  } catch (error) {
    console.error(">>> Message from time Service: ", error);
    throw error;
  }
};

console.log("----------------------------------------------------------------");
console.log(
  convertToGMT7(new Date().toISOString()) + " --- Asia/Ho_Chi_Minh Time Zone"
);
console.log("Welcome to BackEnd System --- by Khoa Truong");
console.log("----------------------------------------------------------------");
console.log("Connecting to Database, please wait...");

module.exports = { convertToGMT7 };
