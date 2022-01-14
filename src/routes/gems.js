const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const User = require("../models/user");
const Gem = require("../models/gem");

router.get("/:uLong/:uLat", async (request, response, next) => {
  const { uLong, uLat } = request.params;

  try {
    const nearGems = await Gem.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [uLong * 1, uLat * 1] },
          spherical: true,
          maxDistance: 8045,
          distanceField: "dist.calculated",
        },
      },
    ]);
    console.log(nearGems);
    response.status(200).json({ nearGems });
  } catch (err) {
    console.error(err);
  }
});

router.post("/filter/:uLong/:uLat", async (request, response, next) => {
  const { uLong, uLat } = request.params;
  const { distance, categories } = request.body;
  try {
    const nearGems = await Gem.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [uLong * 1, uLat * 1] },
          spherical: true,
          maxDistance: distance,
          query: { category: { $in: categories } },
          distanceField: "dist.calculated",
        },
      },
    ]);
    response.status(200).json({ nearGems });
  } catch (err) {
    console.error(err);
  }
});

router.post("/", async (request, response, next) => {
  const { user, name, lat, long, category, description } = request.body;

  const gem = new Gem({
    name,
    author: user.uid,
    category,
    location: {
      type: "Point",
      coordinates: [long, lat],
    },
    description,
  });

  try {
    const savedGem = await gem.save();
    const currentUser = await User.findOne({ _id: user.uid })
      .populate("gems")
      .exec();

    currentUser.gems = [...currentUser.gems, savedGem._id];
    currentUser.save();

    response.json(savedGem.toJSON());
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (request, response) => {
  const populateQuery = [{ path: "author", select: ["username"] }];
  const gem = await Gem.findById(request.params.id)
    .populate(populateQuery)
    .exec();
  if (gem) {
    response.json(gem.toJSON());
  } else {
    response.status(404).end();
  }
});

router.patch("/bookmark/:gemId/:uid", async (request, response) => {
  const { gemId, uid } = request.params;
  const gem = await Gem.findOne({ _id: gemId });
  const user = await User.findOne({ _id: uid });
  try {
    if (user.bookmarks.includes(gemId)) {
      const updatedUser = await user.updateOne({
        $pull: { bookmarks: gemId },
      });
      response.json({
        user: updatedUser,
      });
    } else {
      const updatedUser = await user.updateOne({
        $push: { bookmarks: gemId },
      });

      response.json({
        user: updatedUser,
      });
    }
  } catch (err) {
    return response.status(422).json({ error: err });
  }
});

router.delete("/:id/:userId", async (request, response, next) => {
  const { id, userId } = request.params;
  const gem = await Gem.findOne({ _id: id });
  const currentUser = await User.findOne({ _id: userId });

  if (!gem) {
    return response.status(422).json({ error: "Cannot find gem" });
  }
  if (gem.author._id.toString() === userId.toString()) {
    try {
      const removedGem = await gem.remove();

      const userUpdate = await currentUser.updateOne({ $pull: { gems: id } });

      userUpdate.save();

      response.json(removedGem);
    } catch (err) {
      next(err);
    }
  }
});

router.all("/like/:gemId/:uid", async (req, response) => {
  const { gemId, uid } = req.params;
  const gem = await Gem.findOne({ _id: gemId });
  const currentUser = await User.findOne({ _id: uid });

  if (!gem) {
    return response.status(422).json({ error: "Cannot find gem" });
  }
  try {
    if (gem.likes.includes(uid)) {
      const result = await gem.updateOne({
        $pull: { likes: uid },
      });
      const updatedUser = await currentUser.updateOne({
        $pull: { gemLikes: gemId },
      });
      response.json({
        user: updatedUser,
        gem: result,
      });
      0;
    } else {
      const updatedUser = await currentUser.updateOne({
        $push: { gemLikes: gemId },
      });
      const result = await gem.updateOne({
        $push: { likes: uid },
      });

      response.json({
        user: updatedUser,
        gem: result,
      });
    }
  } catch (err) {
    return response.status(422).json({ error: err });
  }
});

router.all("/dislike/:gemId/:uid", async (request, response) => {
  const { gemId, uid } = request.params;
  const gem = await Gem.findOne({ _id: gemId });
  const currentUser = await User.findOne({ _id: uid });

  if (!gem) {
    return response.status(422).json({ error: "Cannot find gem" });
  }
  try {
    if (gem.dislikes.includes(uid)) {
      const result = await gem.updateOne({
        $pull: { dislikes: uid },
      });
      const updatedUser = await currentUser.updateOne({
        $pull: { gemDislikes: gemId },
      });
      response.json({
        user: updatedUser,
        gem: result,
      });
    } else {
      const updatedUser = await currentUser.updateOne({
        $push: { gemDislikes: gemId },
      });
      const result = await gem.updateOne({
        $push: { dislikes: uid },
      });
      response.json({
        user: updatedUser,
        gem: result,
      });
    }
  } catch (err) {
    return response.status(422).json({ error: err });
  }
});

module.exports = router;
