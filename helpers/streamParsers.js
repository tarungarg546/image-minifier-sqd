'use strict';

const csv = require('fast-csv'),
      stream = require('stream'),
      compressor = require('./imageCompressor'),
      got = require('got'),
      fs = require('fs'),
      path = require('path'),
      server = require('../config/server'),
      distDir = server.buildPath + server.buildDist,
      srcDir = server.buildPath + server.buildSrc,
      Transform = stream.Transform,
      Readable = stream.Readable;


function getReadableStream() {
  return Readable();
}
function csvParser() {
  console.log(`\nCreating CSV Parser...`);
  const csvParser = csv();
  return csvParser;
}

function dataParser(tag) {
  console.log(`\nCreating Data Parser...`);
  const parser = new Transform({objectMode: true});
  
  parser._transform = function(data, encoding, next) {

    const link = getMeaningFull(data);
    
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

  function getMeaningFull(data) {
    if(Array.isArray(data)) {
      return data[0];
    } else {
      return data.toString();
    }
  }
  return parser; 
}

module.exports = {
  getReadableStream: getReadableStream,
  csvParser: csvParser,
  dataParser: dataParser
}