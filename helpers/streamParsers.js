'use strict';

const csv = require('fast-csv'),
      Transform = require('stream').Transform,
      compressor = require('./imageCompressor'),
      got = require('got'),
      fs = require('fs'),
      path = require('path'),
      server = require('../config/server'),
      distDir = server.buildPath + server.buildDist,
      srcDir = server.buildPath + server.buildSrc;

function csvParser() {
  console.log(`\nCreating CSV Parser...`);
  const csvParser = csv();
  return csvParser;
}

function dataParser(tag) {
  console.log(`\nCreating Data Parser...`);
  const parser = new Transform({objectMode: true});
  
  parser._transform = function(data, encoding, next) {
    console.log(data)
    const link = data[0];
    const fileName = tag + '.' + link.split( '/' ).pop(),
          filePath = path.resolve(__dirname, `..${srcDir}/${fileName}`);

    got.stream(link)
      .pipe(fs.createWriteStream(filePath, {flags: 'a'}))
      .on('close', _ => {
        compressor.compressWithFile(filePath, tag, this, next)
        .catch(console.error);
      })
      .on('error', err=> {
        console.log(`\n${JSON.stringify(err)}`);
        next();
      })
  }; 

  return parser; 
}

module.exports = {
  csvParser: csvParser,
  dataParser: dataParser
}