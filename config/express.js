const init = express => {
  'use strict';

  var express = express || require('express');
  const bodyParser = require('body-parser');
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set('views', __dirname+'/../views');
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname+'/../static'));
  app.set('port', process.env.PORT || 8000);
  
  return app;

}

module.exports = {
  init: init
}