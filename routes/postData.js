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
      handlers = require('../helper/generalPurpose')

function cacheLocations(req, file) {

  if(!req.file_locations) {
    req.file_locations = [];
  };
  req.file_locations.push(req.file_dir + '/' + file.originalname);

}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    const dir = path.resolve(__dirname, `../static/tmp/${req.uniqueTag}`);
    try {
      fs.mkdirSync(dir);
    } catch(e) {
      if ( e.code != 'EEXIST' ) throw e;
    }
    req.file_dir = dir;
    cb(null, dir);
  
  },

  filename: function (req, file, cb) {
    cacheLocations(req, file);
    cb(null, file.originalname);
  }

});
 
const upload = multer({ storage: storage });

for(let i=0;i<25;i++) {
  tags.push(`tag${alphabets[i]}`);
}

function getUniqueTag() {
  return tags[Math.floor(26*Math.random())] + '-' + Date.now();
}


function dispatch(source, res, tag) {
  source.pipe(fs.createWriteStream(path.resolve(__dirname, `..${buildDoc}/${tag}_doc.csv`), {flags: 'a'}))
    .on('finish',_ => {
      res.json({target: `${tag}_doc`});
    });
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
        csvFile = req.files[0],
        stream = fs.createReadStream(csvFile.path);
  const sourceStream = stream.pipe(streamLib.csvParser())
    .pipe(streamLib.dataParser(tag));
  dispatch(sourceStream, res, tag);

});

router.post('/urls', handleMultipartFormData(), (req,res) => {

  const urls = req.body.data,
        tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();

  const sourceStream = readableStream.pipe(streamLib.dataParser(tag));
  dispatch(sourceStream, res, tag);
  
  streamLib.pushIntoStream.call(readableStream, urls);

});

router.post('/img', handleMultipartFormData('data'), (req, res) => {

  const locations = req.file_locations,
        tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();


  var sourceStream = readableStream.pipe(streamLib.dataParser(tag,true))
  
  dispatch(sourceStream ,res, tag);

  streamLib.pushIntoStream.call(readableStream, locations);

});

module.exports = router;
