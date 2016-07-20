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
      serverLocation = server.protocol + '://' + server.hostname + ':' + server.port + server.buildPath,
      distDir = server.buildPath + server.buildDist;

function compressImage(filePath, tag, stream, next) {
  return imagemin([filePath], path.resolve(__dirname,`..${distDir}`),{
    plugins: imageminOptions
  })
  .then(file => {
    console.log(`Compressed and saved at location ${file[0].path}`);
    const fileName = file[0].path.split('\\').pop();
    stream.push(serverLocation + fileName + '\n');
    next();
  })
  .catch(console.error);
}

module.exports = {
  compressWithFile: compressImage
}