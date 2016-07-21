'use strict';

const multer = require('multer'),
      fs = require('fs'),
      path = require('path'),
      cache = require('../helpers/generalPurpose').cacheLocations,
      storage = multer.diskStorage({
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
          cache(req, file);
          cb(null, file.originalname);
        }

    }),
    upload = multer({ storage: storage });

module.exports = {
  init: upload
}