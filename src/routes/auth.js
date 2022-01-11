const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Gem = require("../models/gem");
const keys = require("../config/keys");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.route("/").get((req, res, next) => {
  res.send("auth endpoint");
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!password || !username || !email) {
    return res.status(422).json({ error: "please add all the fields" });
  }

  console.log(req.body);
  console.log(User);

  User.findOne({ email: email }).then((savedUser) => {
    if (savedUser) {
      return res
        .status(422)
        .json({ error: "That email is already registered" });
    }
  });
  User.findOne({ username: username })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "user already exists with that name" });
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          username,
          email,
          passwordHash: hashedpassword,
        });

        user
          .save()
          .then((user) => {
            res.json({ message: "saved successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "missing username or password" });
  }

  const user = await User.findOne({ email: email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, keys.jwt.secret);
  res.status(200).send({
    token,
    email,
    uid: user.id,
    username: user.username,
    // gems: user.gems,
    // gemLikes: user.gemLikes,
    // gemDislikes: user.gemDislikes,
    // bookmarks: user.bookmarks,
  });
});

module.exports = router;
