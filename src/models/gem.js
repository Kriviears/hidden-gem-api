import mongoose from 'mongoose'
const { ObjectId } = mongoose.Schema.Types

const gemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    author: {
      type: ObjectId,
      ref: 'User',
    },
    category: {
      type: [String]
    },
    location: {
      type: [{longitude: Number, latitude: Number}],
      required: true
    },
    created: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
  }
)

const Gem = mongoose.model('Gem', gemSchema)

export default Gem
