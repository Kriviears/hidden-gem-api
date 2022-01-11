const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  // city: {
  //   type: String,
  //   required: true,
  // },
  // state: {
  //   type: String,
  //   required: true,
  // },
  gems: [
    {
      type: ObjectId,
      ref: "Gem",
    },
  ],
  gemLikes: [
    {
      type: ObjectId,
      ref: "Gem",
    },
  ],
  gemDislikes: [
    {
      type: ObjectId,
      ref: "Gem",
    },
  ],
  bookmarks: [
    {
      type: ObjectId,
      ref: "Gem",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
