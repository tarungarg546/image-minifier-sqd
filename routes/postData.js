'use strict';
const express = require('express'),
      router = express.Router(),
      fs = require('fs'),
      path = require('path'),
      streamLib = require('../helpers/streamLib'),
      uniqueTag = require('../helpers/generalPurpose').getUniqueTag;
 
const upload = require('../config/multer').init;

router.use(function(req, res, next) {

  req.uniqueTag = uniqueTag();
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
  streamLib.dispatchStream(sourceStream, res, tag);

});

router.post('/urls', handleMultipartFormData(), (req,res) => {

  let urls = req.body.data,
        tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();

  const sourceStream = readableStream.pipe(streamLib.dataParser(tag));
  
  streamLib.dispatchStream(sourceStream, res, tag);
  //console.log(typeof urls);
  if(!Array.isArray(urls)) {
    urls = [urls];
  }
  
  streamLib.pushIntoStream.call(readableStream, urls);

});

router.post('/img', handleMultipartFormData('data'), (req, res) => {

  const locations = req.file_locations,
        tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();


  var sourceStream = readableStream.pipe(streamLib.dataParser(tag,true))
  
  streamLib.dispatchStream(sourceStream ,res, tag);

  streamLib.pushIntoStream.call(readableStream, locations);

});

module.exports = router;
