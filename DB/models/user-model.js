const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const userModel = new mongoose.Schema({
  email: { type: String },

  password: { type: String },
});

module.exports = mongoose.model("userModel", userModel);
