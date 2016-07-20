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
      path = require('path'),
      buildLocation = server.protocol + '://' + server.hostname + ':' + server.port + server.buildPath,
      distDir = server.buildPath + server.buildDist;

function compressImage(filePath, tag, stream, next) {
  
  function convertIntoServerLocation(fileName) {
    return buildLocation + fileName + '\n'
  }

  return imagemin([filePath], path.resolve(__dirname,`..${distDir}`),{
    plugins: imageminOptions
  })
  .then(file => {
    console.log(`Compressed and saved at location ${file[0].path}`);
    const fileName = file[0].path.split('\\').pop();
    stream.push(convertIntoServerLocation(fileName));
    next();
  })
  .catch(console.error);
  
}

module.exports = {
  compressWithFile: compressImage
}