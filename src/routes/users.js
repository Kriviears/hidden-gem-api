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

  // res.send("This is stupid");
});

router.get("/:id", async (request, response) => {
  // const populateQuery = [
  //   {
  //     path: "gems",
  //     populate: { path: "author", select: ["username"] },
  //   },
  // ];

  const user = await User.findOne({ _id: request.params.id })
    .populate("gems")
    .exec();
  if (user) {
    response.json(user.toJSON());
  } else {
    response.status(404).end();
  }
});

router.put("/:id", requireAuth, async (request, response) => {
  const { password } = request.body;
  const { current_password } = request.body;
  const { id } = request.params;

  const hashedpassword = await bcrypt.hash(password, 12);

  try {
    if (password.length <= 7 || password.length >= 21) {
      console.log(password.length);
      return response.status(400).send("Password must be 8 to 20 characters.");
    }
    const user = await User.findOne({ _id: id });
    if (await bcrypt.compare(current_password, user.passwordHash)) {
      user.passwordHash = hashedpassword;
      user.save();
      return response.status(200).send("Set");
    } else {
      return response.status(400).send("Current password does not match");
    }
  } catch (err) {
    response.status(404).end();
  }
});

router.patch("/:id", requireAuth, async (request, response) => {
  const icon = request.body.profile_image;
  const { _id } = request.body;
  console.log(request.body);
  await User.updateOne({ _id }, { $set: { profile_image: icon } })
    .exec()
    .then((result) => {
      response.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      response.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
