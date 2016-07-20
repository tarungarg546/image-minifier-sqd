"use strict";

const express = require("express");
const path = require('path');
const log = console.log.bind();
const app = require('./config/express').init(express);
const fs = require('fs');
const handleData = require('./routes/postData');

const multer = require('multer');
const upload = multer({ dest: 'static/tmp/' });
const csv = require('fast-csv');
const Transform = require('stream').Transform;
const got = require('got');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminOptions = [
                    imageminMozjpeg(),
                    imageminPngquant({speed: 10}),
                    imageminSvgo(),
                    imageminGifsicle()
                  ];
app.get('/',(req, res) => res.render('index'));
app.get('/image/:path',(req, res) => {
  const imagePath = path.resolve(__dirname,'static/images/' + decodeURIComponent(req.params.path));
  res.sendFile(imagePath,'binary');
});
function csvParser() {
  log(`\nCreating CSV Parser...`);
  const csvParser = csv();
  return csvParser;
}

function dataParser() {
  log(`\nCreating Data Parser...`);
  const parser = new Transform({objectMode: true});
  let count = 0;
  parser._transform = function(data, encoding, next) {
    const link = data[0];
    const date = new Date();
    const fileName = date.getTime()+ '.' +link.split( '/' ).pop(),
          filePath = path.resolve(__dirname,`build/src/${fileName}`);
    console.log(link)
    got.stream(link)
      .pipe(fs.createWriteStream(filePath,{flags: 'a'}))
      .on('close', _ => {
        compressImage(filePath,this,next)
        .then(_ => {
          log(count++);
        })
        .catch(console.error);
      })
      .on('error', err=> {
        log(`\n${JSON.stringify(err)}`);
        next();
      })
  }; 

  return parser; 
}

function compressImage(filePath, stream, next) {
  return imagemin([filePath], 'build/dest',{
    plugins: imageminOptions
  })
  .then(file => {
    log(`Compressed and saved at location ${file[0].path}`);
    stream.push(file[0].path);
    next();
  })
  .catch(console.error);
}


app.post('/submit/csv',upload.array('data'),(req, res) => {
  log(`\n Processing...`)
  var stream = fs.createReadStream(path.resolve(__dirname,req.files[0].path))
    .pipe(csvParser())
    .pipe(dataParser())
    .pipe(res)
    .on('finish',_ => {
      log(`\nFinished Processing!`);
      res.end();
    })

});
app.listen(app.get('port'), _ => {
  log(`\nServer is listening at ${app.get('port')}`);
});
