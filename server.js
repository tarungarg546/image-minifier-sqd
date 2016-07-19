"use strict";

const express = require("express");
const path = require('path');
const log = console.log.bind();
const app = require('./config/express').init(express);
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'static/uploads/' })
const csv = require('csv-streamify');
const Transform = require('stream').Transform;
const csvParser = csv();
const got = require('got');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');

app.get('/',(req, res) => res.render('index'));
app.get('/image/:name',(req,res)=> {
  const name=decodeURIComponent(req.params.name);
  res.sendFile(path.resolve(__dirname,'static/images/'+name));
});

var parser = new Transform({objectMode: true});
parser._transform = function(data, encoding, done) {
  const link = data.toString().slice(2,-3);
  const date = new Date();
  console.log(link.split('\\'))
  const fileName = date.getTime()+ '.' +link.split( '/' ).pop(),
        filePath = path.resolve(__dirname,`uploads/src/${fileName}`);
  got.stream(link)
  .pipe(fs.createWriteStream(filePath,{flags:'a'}))
  .on('close',_ => {
    imagemin([filePath],'static/build',{
      plugins: [
        imageminMozjpeg(),
        imageminPngquant(),
        imageminSvgo(),
        imageminGifsicle()
      ]
    }).then(file => {
      console.log(file);
      this.push(link);
      done(); 
    }); 
  });
  
};

app.post('/submit/csv',upload.array('data'),(req, res) => {
  var stream = fs.createReadStream(path.resolve(__dirname,req.files[0].path));

  stream.pipe(csvParser)
    .pipe(parser)
    .pipe(res);

});
app.listen(app.get('port'), _ => {
  log(`Server is listening at ${app.get('port')}`);
});
