const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", async (req, res) => {
  const response = await User.find({}).exec();
  res.json({
    users: response,
  });
});

router.get("/:id", async (request, response) => {
  const user = await User.findOne({ _id: request.params.id })
    .populate("gems")
    .exec();

  if (user) {
    response.json(user.toJSON());
  } else {
    response.status(404).end();
  }
});

router.patch("/:id", async (request, response) => {
  const { oldPassword, newPassword } = request.body;
  const { id } = request.params;

  const hashedpassword = await bcrypt.hash(newPassword, 12);

  try {
    const user = await User.findOne({ _id: id });
    if (await bcrypt.compare(oldPassword, user.passwordHash)) {
      user.passwordHash = hashedpassword;
      user.save();
      return response.status(200).send("Set");
    } else {
      return response.status(400).send("Current password does not match");
    }
  } catch (err) {
    response.status(404).send(err.message);
  }
});

module.exports = router;
