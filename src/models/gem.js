const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const gemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 500,
  },
  author: {
    type: ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    default: "Other",
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  description: {
    type: String,
    maxLength: 250,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: ObjectId,
      ref: "User",
    },

  ],
  dislikes: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
});

gemSchema.index({ location: "2dsphere" });
const Gem = mongoose.model("Gem", gemSchema);

module.exports = Gem;
