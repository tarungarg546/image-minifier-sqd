"use strict";

const express = require('express'),
      path = require('path'),
      app = require('./config/express').init(express),
      mkdir = require('./helpers/generalPurpose').mkdir,
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

requiredDir.map(dir => {
  return path.resolve(__dirname,dir);
});
//make required directories
mkdir(...requiredDir);

app.get('/',(req, res) => res.render('index'));

//Request a image on own server
app.get('/image/:path',(req, res) => res.sendFile(path.resolve(__dirname,'static/images/' + decodeURIComponent(req.params.path))));
//Request an build image
app.get('/build/:name',(req,res) => res.sendFile(path.resolve(__dirname, buildDist + decodeURIComponent(req.params.name))));
//Request the final csv file of compressed image's url
app.get('/:tag/document.csv',(req, res) => res.sendFile(path.resolve(__dirname, buildDoc + decodeURIComponent(req.params.tag) + '/document.csv')))

app.use('/submit',handleData);

app.listen(app.get('port'), _ => console.log(`\nServer is listening at ${app.get('port')}`));
