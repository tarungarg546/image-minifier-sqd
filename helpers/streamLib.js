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
      buildDoc = server.buildPath + server.buildDoc,
      Transform = stream.Transform,
      Readable = stream.Readable,
      mkdir = require('./generalPurpose').mkdir,
      pathResolve = require('./generalPurpose').resolve;


function getReadableStream() {
  return Readable();
}

function pushIntoStream(data) {

  data.forEach(datum =>  this.push(datum));
  this.push(null);//no more data

}

function dispatchStream(source, res, tag) {

  const folder = pathResolve('..' + buildDoc + tag);
  mkdir(folder);
  console.log(folder + '/document.csv');
  source.pipe(fs.createWriteStream(folder + '/document.csv', {flags: 'a'}))
    .on('finish',_ => {
      console.log(`\nFinished Compressing`);
      res.json({
        target: tag + '/document.csv',
      });
    })
    .on('error', err => {
      res.status(500).json({error: JSON.stringify(err)});
    })
;
}
function csvParser() {

  console.log(`\nCreating CSV Parser...`);
  const csvParser = csv();
  return csvParser;

}

function dataParser(tag, isPhysicalLocation) {

  console.log(`\nCreating Data Parser...`);
  const parser = new Transform({objectMode: true});
  
  parser._transform = function(data, encoding, next) {

    const link = getData(data);
    
    const fileName = link.split( '/' ).pop(),
          folderPath = pathResolve('..' + srcDir + tag),
          filePath = folderPath + '/' + fileName;
    let stream;

    mkdir(folderPath);

    if(isPhysicalLocation) {
      stream = fs.createReadStream(link);
    } else {
      stream = got.stream(link);
    }

    stream
      .pipe(fs.createWriteStream(filePath, {flags: 'a'}))
      .on('close', _ => {
        compressor.compressWithFile(filePath, tag, this, next)
        .catch(console.error);
      })
      .on('error', err=> {
        console.log(`\n${JSON.stringify(err)}`);
        next();
      });

  }; 

  function getData(data) {
    if(Array.isArray(data)) {
      //case of CSV
      return data[0];
    } else {
      return data.toString();
    }
  }

  return parser; 
}

module.exports = {
  getReadableStream: getReadableStream,
  pushIntoStream: pushIntoStream,
  dispatchStream: dispatchStream,
  csvParser: csvParser,
  dataParser: dataParser
}