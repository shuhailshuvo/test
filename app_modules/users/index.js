const mongoose = require("mongoose");
const schema = require("./schema.json");
module.exports = async ctx => {
  // setting up user model
  if (!ctx.userModel) {
    ctx.userModel = mongoose.model(
      "users",
      new mongoose.Schema(schema.mongoose)
    );
  }
};
