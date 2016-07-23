'use strict';
const got = require('got'),
      server = require('../config/server'),
      imagemin = require('imagemin'),
      imageminMozjpeg = require('imagemin-mozjpeg'),
      imageminPngquant = require('imagemin-pngquant'),
      imageminSvgo = require('imagemin-svgo'),
      imageminGifsicle = require('imagemin-gifsicle'),
      imageminOptions = [
                    imageminMozjpeg(),
                    imageminPngquant({speed: 10}),
                    imageminSvgo(),
                    imageminGifsicle()
                  ],
      pathResolve = require('./generalPurpose').resolve,
      buildLocation = server.protocol + '://' + server.hostname + ':' + server.port + server.buildPath,
      distDir = server.buildPath + server.buildDist;


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

    console.log(`Compressed and saved at location ${file[0].path}`);
    const fileName = file[0].path.split('\\').pop();
    stream.push(convertIntoServerLocation(fileName));
    next();

  })
  .catch(err => {
    
    stream.push("Error occured in converting image named "+ filePath.split('\\').pop() + '\n');
    next();

  });
  
}


//expose this file
module.exports = {
  compressWithFile: compressImage
}