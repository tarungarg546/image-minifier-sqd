'use strict';
const express = require('express'),
      router = express.Router(),
      fs = require('fs'),
      path = require('path'),
      streamLib = require('../helpers/streamLib'),
      uniqueTag = require('../helpers/generalPurpose').getUniqueTag,
      dirtyCheck = require('../helpers/generalPurpose').dirtyCheck;
 
const upload = require('../config/multer').init;

/**
 * [middleware that appends a uniqueTag to every request coming on '/submit']
 * @param  {Object} req   [Request object]
 * @param  {Object} res   [Response object]
 * @param  {function} next [Next function in routing chain
 */
router.use(function middleware(req, res, next) {

  req.uniqueTag = uniqueTag();
  next();

});

/**
 * [handleMultipartFormData Middleware to handle multipart/form-encoded data]
 * @param  {String} key [Key at which files are present in reequest]
 * @return {Middleware}
 */
function handleMultipartFormData(key) {

  if(!key)
    return upload.any();
  return upload.array('data');

}

router.post('/csv', handleMultipartFormData('data'), (req, res) => {
  
  const file = req.files[0];

  if(dirtyCheck(file, 'csv')) {
      return res.status(422).json({
        cause: 'Please upload CSV file'
      });
  }

  const tag = req.uniqueTag,
        stream = fs.createReadStream(file.path);

  const sourceStream = stream.pipe(streamLib.csvParser())
    .pipe(streamLib.dataParser(tag));
  streamLib.dispatchStream(sourceStream, res, tag);

});

router.post('/urls', handleMultipartFormData(), (req,res) => {

  let urls = req.body.data;
  if(!Array.isArray(urls)) {
    urls = [urls];
  }
  
  if(dirtyCheck(urls, 'url')){
    return res.status(422).json({
      cause: 'Please enter valid web uri'
    })
  }
  const tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();

  const sourceStream = readableStream.pipe(streamLib.dataParser(tag));
  
  streamLib.dispatchStream(sourceStream, res, tag);
  //console.log(typeof urls);
  
  streamLib.pushIntoStream.call(readableStream, urls);

});

router.post('/img', handleMultipartFormData('data'), (req, res) => {

  const file_locations = req.file_locations;

  if(dirtyCheck(file_locations, 'img')) {
    return res.status(422).json({
      cause: 'Please upload valid images'
    });
  }

  const tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();


  var sourceStream = readableStream.pipe(streamLib.dataParser(tag, true))
  
  streamLib.dispatchStream(sourceStream ,res, tag);

  streamLib.pushIntoStream.call(readableStream, file_locations);

});

module.exports = router;
