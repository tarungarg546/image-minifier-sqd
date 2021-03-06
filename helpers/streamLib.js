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
      pathResolve = require('./generalPurpose').resolve,
      infoLogger = require('./logger').info,
      errorLogger = require('./logger').error,
      getName = require('./generalPurpose').getName,
      join = require('./generalPurpose').join;

/**
 * [getReadableStream Function to create a readable stream]
 * @return {Stream} [Readable Stream]
 */
function getReadableStream() {
  return Readable();
}

/**
 * [pushIntoStream Push data into readable stream specified by 'this']
 * @param  {[String]} data [Data which needs to be pushed into readable stream]
 */
function pushIntoStream(data) {
  
  data.forEach(datum =>  {
    this.push(datum);
  });
  this.push(null);//no more data
}


function dispatchStream(source, res, tag) {

  const folder = pathResolve('..' + buildDoc + tag);
  mkdir(folder);
  source.pipe(fs.createWriteStream(join(folder, 'document.csv'), {flags: 'a'}))
    .on('finish',_ => {
      infoLogger(`Finished Compressing`);
      res.json({
        target: join(tag, 'document.csv')
      });
    })
    .on('error', err => {
      res.status(500).json({error: JSON.stringify(err)});
    });

}

/**
 * [csvParser Function that creates csv parsing stream]
 * @return {Stream} [Stream of csv parser]
 */
function csvParser() {

  infoLogger(`Creating CSV Parser...`);
  const csvParser = csv();
  return csvParser;

}

/**
 * [dataParser Kind of transform stream that transform stream data coming into something that is usable for ur]
 * @param  {String}  tag                [Unique tag for each request]
 * @param  {Boolean} isPhysicalLocation [Whether specified input is from a physical Location, eg in case of image uploads]
 * @return {Stream}                     [Modified stream]
 */
function dataParser(tag, isPhysicalLocation) {

  infoLogger(`Creating Data Parser...`);
  const parser = new Transform({objectMode: true});
  
  parser._transform = function(data, encoding, next) {

    const link = getData(data);
    
    const fileName = link.split( '/' ).pop(),
          folderPath = pathResolve('..' + srcDir + tag + '/'),
          filePath = join(folderPath,fileName);
    let stream,isError = false;
    
    mkdir(folderPath);

    infoLogger(`Fetching image named ${fileName}`);
    if(isPhysicalLocation) {
      stream = fs.createReadStream(link)
        .on('error',err => {
          isError = true;
          errorLogger(`Error occured in fetching image ${fileName}  Error :- ${JSON.stringify(err)}`);
        })
    } else {
      stream = got.stream(link)
        .on('error',err => {
          isError = true;
          errorLogger(`Error occured in fetching image ${fileName}  Error :- ${JSON.stringify(err)}`);
        })
    }

    stream
      .pipe(fs.createWriteStream(filePath, {flags: 'a'}))
      .on('close', _ => {
        infoLogger('Compressing.... ', getName(filePath))
        compressor.compressWithFile(filePath, tag, this, next, isError)
        .catch(console.error);
      })
      .on('error', err=> {
        errorLogger(err);
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

//expose this file
module.exports = {
  getReadableStream: getReadableStream,
  pushIntoStream: pushIntoStream,
  dispatchStream: dispatchStream,
  csvParser: csvParser,
  dataParser: dataParser
}