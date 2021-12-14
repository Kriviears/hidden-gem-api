'use strict';
import router from './routes'

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// api router
app.use(keys.app.apiEndpoint, router)

//catch errors and foward to errorHandler
app.use((req, res, next) =>{
  next(createError(404, 'NotFound'))
})
app.use(errorHandler)

app.get('/', (req, res)=>{
  res.send('Hidden Gems API');
});

module.exports = app;