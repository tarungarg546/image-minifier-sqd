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
      buildDoc = server.buildPath + server.buildDoc,
      upload = multer({ dest: path.resolve(__dirname, `../static/tmp`) });

for(let i=0;i<26;i++) {
  tags.push(`tag${alphabets[i]}`);
}

function getUniqueTag() {
  return tags[Math.floor(26*Math.random())] + '-' + (new Date()).getTime();
}

router.post('/csv', upload.array('data'), (req, res) => {
  
  const tag = getUniqueTag(),
        csvFile = req.files[0];
        console.log(csvFile);
  const     stream = fs.createReadStream(csvFile.path);
  stream.pipe(streamLib.csvParser())
    .pipe(streamLib.dataParser(tag))
    .pipe(fs.createWriteStream(path.resolve(__dirname,`..${buildDoc}/${tag}_doc.csv`), {flags: 'a'}))
    .on('finish',_ => {
      res.json({target: `${tag}_doc`});
    });

});

router.post('/urls', upload.any(), (req,res) => {

  const urls = req.body.data,
        tag = getUniqueTag(),
        readableStream = streamLib.getReadableStream();

  readableStream.pipe(streamLib.dataParser(tag))
    .pipe(fs.createWriteStream(path.resolve(__dirname,`..${buildDoc}/${tag}_doc.csv`), {flags: 'a'}))
    .on('finish',_ => {
      res.json({target: `${tag}_doc`});
    });

  urls.forEach(url =>  readableStream.push(url));
  readableStream.push(null);//no more data

});


module.exports = router;
