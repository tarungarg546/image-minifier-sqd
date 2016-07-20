'use strict';
const express = require('express'),
      router = express.Router(),
      multer = require('multer'),
      streamLib = require('../helpers/streamParsers'),
      fs = require('fs'),
      path = require('path'),
      alphabets = 'ABCDEFGHIJKLMNOPQRSTUVXYZ',
      tags = [],
      server = require('../config/server'),
      buildDoc = server.buildPath + server.buildDoc;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    const dir = path.resolve(__dirname, `../static/tmp/${req.uniqueTag}`);
    try {
      fs.mkdirSync(dir);
    } catch(e) {
      if ( e.code != 'EEXIST' ) throw e;
    }
    cb(null, dir);
  
  },

  filename: function (req, file, cb) {
  
    cb(null, file.originalname);
  
  }
})
 
const upload = multer({ storage: storage })
for(let i=0;i<25;i++) {
  tags.push(`tag${alphabets[i]}`);
}

function getUniqueTag() {
  return tags[Math.floor(26*Math.random())] + '-' + Date.now();
}

router.use(function(req, res, next) {
  
  req.uniqueTag = getUniqueTag();
  next();

});

function handleMultipartFormData(key) {
  if(!key)
    return upload.any();
  return upload.array('data');
}

router.post('/csv', handleMultipartFormData('data'), (req, res) => {
  
  const tag = req.uniqueTag,
        csvFile = req.files[0];
        console.log(req.files[0]);
  const     stream = fs.createReadStream(csvFile.path);
  stream.pipe(streamLib.csvParser())
    .pipe(streamLib.dataParser(tag))
    .pipe(fs.createWriteStream(path.resolve(__dirname, `..${buildDoc}/${tag}_doc.csv`), {flags: 'a'}))
    .on('finish',_ => {
      res.json({target: `${tag}_doc`});
    });

});

router.post('/urls', handleMultipartFormData(), (req,res) => {

  const urls = req.body.data,
        tag = getUniqueTag(),
        readableStream = streamLib.getReadableStream();

  readableStream.pipe(streamLib.dataParser(tag))
    .pipe(fs.createWriteStream(path.resolve(__dirname, `..${buildDoc}/${tag}_doc.csv`), {flags: 'a'}))
    .on('finish',_ => {
      res.json({target: `${tag}_doc`});
    });

  urls.forEach(url =>  readableStream.push(url));
  readableStream.push(null);//no more data

});

router.post('/img', handleMultipartFormData('data'), (req, res) => {

  const images = req.files,
        tag = req.uniqueTag;
  console.log(req.files[0].buffer, tag);/*
        readableStream = streamLib.getReadableStream();*/

})

module.exports = router;
