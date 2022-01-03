const express = require('express');
const router = express.Router()
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const User = require('../models/user')
const Gem = require('../models/gem')
const generateRange = require('../helperFunctions');
const { response } = require('../app');

//const { requireAuth } = require('../middleware')


router.get('/', async (req, res) => {
  // const {range, user} = request.body;
  console.log("A new try")
  let gems


  // const gemRangeLat = generateRange(user.location[0], range)
  // const gemRangeLong = generateRange(user.location[1], range)
  const populateQuery = [
    { 
      path: 'author', 
      select: ['username', 'profile_image'] },
    {
      path: 'likes',
      populate: { path: 'user', select: ['username']}
    },
    {
      path: 'dislikes',
      populate: { path: 'user', select: ['username']}
    }
  ]
  console.log("Before the find")

  //getting all to test connection
  try{
    gems = await Gem.findOne()
    console.log(gems)
    if(!gems){
      return res.status(202).json({ error: 'Cannot find gems in your area' })
    }
    res.json(gems.map((gem) => gem.toJSON()))
  } catch(err){
    return res.status(422).json({ err: err.message})
  }

  // const gems = await Gem.find({
  //   location: {
  //     latitude:  {$in: gemRangeLat}, 
  //     longitude: {$in: gemRangeLong}
  //   },
  // })
  //   .sort({ likes: -1 })
  //   .populate(populateQuery)
  //   .exec()

    console.log("Got our gems")
    if(!gems){
      return res.status(202).json({ error: 'Cannot find gems in your area' })
    }
  

  //res.json(gems.map((gem) => gem.toJSON()))
})

router.post('/', async (request, response, next) => {
  
  const { user } = request

  const gem = new Gem({
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

router.delete('/:id', async (request, response, next) => {
  const { userId } = request.body
  const { id } = request.params
  const gem = await Gem.findOne({ _id: id })

  console.log(userId, id, gem)
  

  if (!gem) {
    return response.status(422).json({ error: 'Cannot find gem' })
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

router.all('/like/:gemId', async (request, response) => {
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
          $pull: {dislikes: user.id}
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

router.all('/dislike/:gemId', async (request, responce)=> {
  const { gemId } = request.params
  const { user } = request
  const gem = await Gem.findOne({ _id: gemId })

  if(!gem){
    return response.status(422).json({ error: 'Cannot find gem' })
  }
  try {
    if (gem.dislikes.includes(user.id)){
      const result = await gem.updateOne({
        $pull: { dislikes: user.id }
      })

      response.json(result)
    } else {
      if(gem.likes.includes(user.id)){
        const result = await gem.updateOne({
          $pull: { likes: user.id }
        })
      }

      const result = await gem.updateOne({
        $push: { dislikes: user.id }
      })

      response.json(result)
    }
  } catch(err){
    return response.status(422).json({ error: err })
  }
})


module.exports = router
