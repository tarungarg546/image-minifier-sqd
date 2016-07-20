'use strict';
const express = require('express'),
      router = express.Router(),
      multer = require('multer'),
      upload = multer({ dest: '../static/tmp/' }),
      parserHelpers = require('../helpers/streamParsers'),
      fs = require('fs'),
      path = require('path'),
      alphabets = 'ABCDEFGHIJKLMNOPQRSTUVXYZ',
      tags = [],
      server = require('../config/server'),
      buildDoc = server.buildPath + server.buildDoc

for(let i=0;i<26;i++) {
  tags.push(`tag${alphabets[i]}`);
}

function getUniqueTag() {
  return tags[Math.floor(26*Math.random())] + '-' + (new Date()).getTime();
}

router.post('/csv', upload.array('data'), (req, res) => {
  
  const tag = getUniqueTag();
  const stream = fs.createReadStream(req.files[0].path)
    .pipe(parserHelpers.csvParser())
    .pipe(parserHelpers.dataParser(tag))
    .pipe(fs.createWriteStream(path.resolve(__dirname,`..${buildDoc}/${tag}_doc.csv`), {flags: 'a'}))
    .on('finish',_ => {
      res.json({target: `${tag}_doc`});
    });
    
});

router.post('/urls', (req,res) => {
  res.end('Helllo');
})

module.exports = router;
