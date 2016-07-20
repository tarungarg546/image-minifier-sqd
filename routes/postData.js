'use strict';
const express = require('express'),
      router = express.Router(),
      multer = require('multer'),
      streamLib = require('../helpers/streamLib'),
      fs = require('fs'),
      path = require('path'),
      tags = [],
      handlers = require('../helpers/generalPurpose');

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
    handlers.cacheLocations(req, file);
    cb(null, file.originalname);
  }

});
 
const upload = multer({ storage: storage });

router.use(function(req, res, next) {
  req.uniqueTag = handlers.getUniqueTag();
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

  const urls = req.body.data,
        tag = req.uniqueTag,
        readableStream = streamLib.getReadableStream();

  const sourceStream = readableStream.pipe(streamLib.dataParser(tag));
  
  streamLib.dispatchStream(sourceStream, res, tag);
  
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
