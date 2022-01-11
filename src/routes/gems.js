const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const User = require("../models/user");
const Gem = require("../models/gem");
const { generateRange } = require("../helperFunctions");
// const { response, request } = require("../app");

//const { requireAuth } = require('../middleware')

router.get("/close-gems", async (req, res) => {
  const userPos = req.body;

  try {
    const nearGems = await Gem.find({});
    console.log(req);
    res.status(200).json({
      status: "success",
      data: {
        nearGems,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

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
    response.status(200).json({ nearGems });
  } catch (err) {
    console.error(err);
  }
});

router.post("/", async (request, response, next) => {
  const { user, name, lat, long, category, description } = request.body;
  console.log(request.body);
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
  // const { userId } = request.body;
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

router.delete("/:id", async (request, response, next) => {
  const { userId } = request.body;
  const { id } = request.params;
  const gem = await Gem.findOne({ _id: id });

  console.log(userId, id, gem);

  if (!gem) {
    return response.status(422).json({ error: "Cannot find gem" });
  }
  if (gem.author._id.toString() === userId.toString()) {
    try {
      const removedGem = await gem.remove();

      const userUpdate = await User.updateOne(
        { _id: userId },
        { $pull: { gems: id } }
      );

      response.json(removedGem);
    } catch (err) {
      next(err);
    }
  }
});

router.all("/like/:gemId/:uid", async (req, response) => {
  const { gemId, uid } = req.params;
  // const { userId } = req.body;
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
      const updatedUser = await currentUser
        .updateOne({
          $pull: { gemLikes: gem },
        })
        .populate("gems")
        .exec();
      response.json({
        user: updatedUser,
        gem: result,
      });
      0;
    } else {
      if (gem.dislikes.includes(uid)) {
        const result = await gem.updateOne({
          $pull: { dislikes: uid },
          // $push: { likes: uid },
        });
        const updatedUser = await currentUser
          .updateOne({
            $pull: { gemDislikes: gem },
            // $push: { gemLikes: gemId },
          })
          .populate("gems")
          .exec();
        response.json({
          user: updatedUser,
          gem: result,
        });
      }
      const updatedUser = await currentUser
        .updateOne({
          $push: { gemLikes: gem },
        })
        .populate("gems")
        .exec();
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
  // const { user } = request.body;
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
      const updatedUser = await currentUser
        .updateOne({
          $pull: { gemDislikes: gemId },
        })
        .populate("gems")
        .exec();
      response.json({
        user: updatedUser,
        gem: result,
      });
    } else {
      if (gem.likes.includes(uid)) {
        const result = await gem.updateOne({
          $pull: { likes: uid },
        });
        const updatedUser = await currentUser
          .updateOne({
            $pull: { gemLikes: gem },
          })
          .populate("gems")
          .exec();
        response.json({
          user: updatedUser,
          gem: result,
        });
      }

      const updatedUser = await currentUser
        .updateOne({
          $push: { gemDislikes: gemId },
        })
        .populate("gems")
        .exec();
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
