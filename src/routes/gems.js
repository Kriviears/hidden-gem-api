import express from 'express'
const router = express.Router()
import jwt from 'jsonwebtoken'
import keys from '../config/keys'
import { User, Gem } from '../models'
import { requireAuth } from '../middleware'

router.get('/', async (request, response) => {
  const populateQuery = [
    { path: 'author', select: ['username', 'profile_image'] },
    {
      path: 'comments',
      populate: { path: 'author', select: ['username', 'profile_image'] }
    },
    {
      path: 'likes',
      populate: { path: 'user', select: ['username']}
    }
  ]
  const gems = await Gems.find({})
    .sort({ created: -1 })
    .populate(populateQuery)
    .exec()

  response.json(posts.map((post) => post.toJSON()))
})

router.post('/', requireAuth, async (request, response, next) => {
  const { text } = request.body
  const { user } = request

  const post = new Gem({
    text: text,
    author: user._id,
  })

  try {
    const savedGem = await gem.save()
    user.gems = user.gems.concat(savedGem._id)

    await user.save()

    response.json(savedGem.toJSON())
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (request, response) => {
  const populateQuery = [
    { path: 'author', select: ['username', 'profile_image'] },
    {
      path: 'comments',
      populate: { path: 'author', select: ['username', 'profile_image'] },
    },
  ]
  const gem = await Gem.findById(request.params.id)
    .populate(populateQuery)
    .exec()
  if (gem) {
    response.json(gem.toJSON())
  } else {
    response.status(404).end()
  }
})

router.delete('/:id', requireAuth, async (request, response, next) => {
  const { userId } = request.body
  const { id } = request.params
  const gem = await Gem.findOne({ _id: id })

  console.log(userId, id, post)
  

  if (!gem) {
    return response.status(422).json({ error: 'Cannot find post' })
  }
  if (gem.author._id.toString() === userId.toString()) {
    try {
      const removedGem = await gem.remove()

      const userUpdate = await User.updateOne(
        { _id: userId },
        { $pull: { gems: id } }
      )

      response.json(removedGem)
    } catch (err) {
      next(err)
    }
  }
})

router.all('/like/:gemId', requireAuth, async (request, response) => {
  const { gemId } = request.params
  const { user } = request
  const gem = await Gem.findOne({ _id: gemId })

  if (!gem) {
    return response.status(422).json({ error: 'Cannot find gem' })
  }
  try {
    if (gem.likes.includes(user.id)) {
      const result = await gem.updateOne({
        $pull: { likes: user.id },
      })

      response.json(result)
    } else {

      if(gem.dislikes.includes(user.id)){
        const result = await gem.updateOne({
          $pull: {likes: user.id}
        })
      }

      const result = await gem.updateOne({
        $push: { likes: user.id },
      })

      response.json(result)
    }
  } catch (err) {
    return response.status(422).json({ error: err })
  }
})


module.exports = router
