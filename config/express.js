const init = express => {
  'use strict';

  var express = express || require('express');
  const bodyParser = require('body-parser');
  const app = express();
  const serverConfig = require('./server');

  app.use(bodyParser.json()); //application/json
  app.use(bodyParser.urlencoded({ extended: true }));// application/xxx-form-encoded
  app.set('views', __dirname+`/..${serverConfig.views}`);
  app.set('view engine', `${serverConfig.renderEngine}`);
  app.use(express.static(__dirname+`/..${serverConfig.static}`));
  app.set('port', serverConfig.port || 8000);
  
  return app;

}

module.exports = {
  init: init
}