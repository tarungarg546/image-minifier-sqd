'use strict';

const multer = require('multer'),
      path = require('path'),
      cache = require('../helpers/generalPurpose').cacheLocations,
      mkdir = require('../helpers/generalPurpose').mkdir,
      storage = multer.diskStorage({
        destination: function (req, file, cb) {
    
          const dir = path.resolve(__dirname, `../static/tmp/${req.uniqueTag}`);
          mkdir(dir);
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