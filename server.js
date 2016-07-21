'use strict';

const express = require('express'),
      pathResolve = require('path').resolve,
      app = require('./config/express').init(express),
      mkdir = require('./helpers/generalPurpose').mkdir,
      decode = require('./helpers/generalPurpose').decode,
      serverConfig = require('./config/server'),
      buildDist = '.' + serverConfig.buildPath + serverConfig.buildDist,
      buildDoc = '.' + serverConfig.buildPath + serverConfig.buildDoc,
      requiredDir = [
                    './static/tmp',
                    '.' + serverConfig.buildPath,
                    buildDist,
                    '.' + serverConfig.buildPath + serverConfig.buildSrc,
                    buildDoc
                    ],
      handleData = require('./routes/postData');

//make required directories
mkdir(...requiredDir);

app.get('/',(req, res) => res.render('index'));

//Request a image on own server
app.get('/image/:name',(req, res) => {

  const filePath = pathResolve(__dirname, './static/images/' + decode(req.params.name));
  return res.sendFile(filePath);

});

//Request an build image
app.get('/build/:tag/:name',(req,res) => {

  const filePath = pathResolve(__dirname, buildDist + decode(req.params.tag) + '/' +decode(req.params.name));
  return res.sendFile(filePath);

});

//Request the final csv file of compressed image's url
app.get('/:tag/document.csv',(req, res) => {

  const filePath = pathResolve(__dirname, buildDoc + decode(req.params.tag) + '/document.csv');
  res.sendFile(filePath);

})

app.use('/submit',handleData);

app.listen(app.get('port'), _ => console.log(`\nServer is listening at ${app.get('port')}`));
