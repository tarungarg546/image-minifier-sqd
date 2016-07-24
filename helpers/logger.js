'use strict';
const winston = require('winston');
const loggerFile = require('../config/logger');
winston.add(winston.transports.File, loggerFile);

module.exports ={
  info: winston.info,
  debug: winston.debug,
  warn: winston.warn,
  error: winston.error
}