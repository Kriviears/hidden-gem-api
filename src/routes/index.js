const express = require('express');
const authRouter = require('./auth');
const userRouter = require('./users');
const gemRouter = require('./gems');


const router = express.Router()

router.get('/', (req, res, next) => {
  res.status(200).send('Gems API')
})

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/gems', gemRouter)

module.exports = router
