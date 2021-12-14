import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models'
import { requireAuth } from '../middleware'

const router = express.Router()

router
  .route('/:id')
  .get(async (request, response) => {
    const populateQuery = [
      {
        path: 'posts',
        populate: { path: 'author', select: ['username', 'profile_image'] },
      },
    ]

    const user = await User.findOne({ username: request.params.id })
      .populate(populateQuery)
      .exec()
    if (user) {
      response.json(user.toJSON())
    } else {
      response.status(404).end()
    }
  })
  .put(requireAuth, async (request, response) => {
    const { current_password, password, profile_image } = request.body
    const { id } = request.params
    
    console.log(current_password, password, profile_image);

    if(current_password && password){
      const hashedpassword = await bcrypt.hash(password, 12)
      const currentHash = await bcrypt.hash(current_password, 12)
      const oldHash = await User.findById(id)
      console.log({hashedpassword, currentHash})
      console.log(oldHash.passwordHash)
      const matchedPasswords = await bcrypt.compare(
        current_password,
        oldHash.passwordHash
        
      );
      if(!matchedPasswords){
        return response.status(401).json({error: "Old password doesnt match"})
      }
      try {
        const userUpdate = await User.findByIdAndUpdate(
          {_id: id},
          {passwordHash: hashedpassword},
          {new: true}
        )

        response.json(userUpdate.toJSON())
      } catch (error) {
        response.status(404).end()
      }
    }

    if(profile_image){
      try{
        const userUpdate = await User.findByIdAndUpdate(
          {_id: id},
          {profile_image},
          {new: true}
        )

        response.json(userUpdate.toJSON())
      } catch(error){
        response.status(404).end()
      }
    }
  })

module.exports = router
