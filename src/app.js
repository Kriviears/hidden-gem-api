'use strict';
require('dotenv').config();
const keys = require('./config/keys')
const router = require('./routes/index')
const express = require('express');
//const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const NODE_ENV = require('./config');
const errorHandler = require('./middleware/errorHandler');
const mongoose  = require('mongoose');
const {DATABASE_URL} = require('./config.js')
const { MongoClient } = require('mongodb');

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

mongoose.connection.on('connected', ()=>{
  console.log('connected to the Gems Database')
})

mongoose.connection.on('error', (err)=>{
  console.log('err connecting', err)
})

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


// api router
app.use(keys.app.apiEndpoint, router)

//catch errors and foward to errorHandler
app.use((req, res, next) =>{
  next(createError(404, 'NotFound'))
})
app.use(errorHandler)

module.exports = app;