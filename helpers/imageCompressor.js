'use strict';
const got = require('got'),
      server = require('../config/server'),
      imagemin = require('imagemin'),
      imageminPngcrush = require('imagemin-pngcrush'),
      imageminSvgo = require('imagemin-svgo'),
      imageminGifsicle = require('imagemin-gifsicle'),
      imageminJpegtran = require('imagemin-jpegtran'),
      imageminOptions = [
                    imageminJpegtran(), //working
                    imageminPngcrush({reduce: true}), //working
                    imageminSvgo(), //working
                    imageminGifsicle() 
                  ],
      pathResolve = require('./generalPurpose').resolve,
      buildLocation = server.protocol + '://' + server.hostname + ':' + server.port + server.buildPath,
      distDir = server.buildPath + server.buildDist,
      errorLogger = require('./logger').error,
      infoLogger = require('./logger').info;


/**
 * [compressImage Function that takes filePath and compresses it]
 * @param  {String}   filePath [File path]
 * @param  {String}   tag      [Unique tag generated earlier]
 * @param  {Stream}   stream   [Stream that is coming from transform in streamLib]
 * @param  {Function} next     [NExt function which will be called after consuming current stream]
 */
function compressImage(filePath, tag, stream, next) {
  
  function convertIntoServerLocation(fileName) {
    return buildLocation + tag + '/' + fileName + '\n'
  }

  return imagemin([filePath], pathResolve('..' + distDir + tag),{
    plugins: imageminOptions
  })
  .then(file => {

    infoLogger(`Compressed and saved at location ${file[0].path}`);
    const fileName = file[0].path.split('\\').pop();
    stream.push(convertIntoServerLocation(fileName));
    next();

  })
  .catch(err => {
    
    errorLogger("Error occured in converting image named "+ filePath.split('\\').pop());
    stream.push("Error occured in converting image named "+ filePath.split('\\').pop() + '\n');
    next();

  });
  
}


//expose this file
module.exports = {
  compressWithFile: compressImage
}