"use strict";

const express = require("express"),
      path = require('path'),
      app = require('./config/express').init(express),
      handleData = require('./routes/postData');

app.get('/',(req, res) => res.render('index'));


//Request a image on own server
app.get('/image/:path',(req, res) => res.sendFile(path.resolve(__dirname,'static/images/' + decodeURIComponent(req.params.path))));
//Request an build image
app.get('/build/:name',(req,res) => res.sendFile(path.resolve(__dirname,'build/dist/' + decodeURIComponent(req.params.name))));
//Request the final csv file of compressed image's url
app.get('/:name',(req, res) => res.sendFile(path.resolve(__dirname,'build/tmp/' + decodeURIComponent(req.params.name))))

app.use('/submit',handleData);

app.listen(app.get('port'), _ => console.log(`\nServer is listening at ${app.get('port')}`));
