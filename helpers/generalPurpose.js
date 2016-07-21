'use strict';

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVXYZ',
      tags = [],
      fs = require('fs'),
      pResolve = require('path').resolve,
      validUrl = require('valid-url');

function init() {
  for(let i=0;i<25;i++) {
    tags.push(`tag${alphabets[i]}`);
  }
}

function getUniqueTag() {
  if(tags.length === 0) {
    init();
  }
  return tags[Math.floor(26*Math.random())] + '-' + Date.now();
}

function cacheLocations(req, file) {

  if(!req.file_locations) {
    req.file_locations = [];
  };
  req.file_locations.push(req.file_dir + '/' + file.originalname);

}

function mkdir(...dirs) {
  dirs.forEach(dir => {
    try {
      fs.mkdirSync(dir);
      console.log(`Making folder ${dir}`);
    } catch(e) {
      if ( e.code != 'EEXIST' ) console.error (e);
    }
  });
}

function decode(input) {
  return decodeURIComponent(input);
}


function resolve(target) {
  return pResolve(__dirname,target);
}

function checkCSV(source) {
  if(source.originalname.slice(-4) !== '.csv') {
      //dirty
      return true;
  }
  return false;
}

function checkImages(source) {
  const flag = source.every(location => location.match(/\.(jpg|jpeg|png|gif|svg)$/));
  if(!flag) {
    //dirty
    return true;
  }
  return false;
}

function checkURL(source) {
  const flag = source.every(url => {
    if(!validUrl.isWebUri(url)) {
      return false;
    } else {
      return true;
    }
  });

  if(!flag) {
    return true;
  }

  return false;

}

function dirtyCheck(source, base) {
  if(base === 'csv') {
    
    return checkCSV(source);

  } else if(base === 'img') {

    return checkImages(source);

  } else {
    return checkURL(source);
  }
  return true;
}

module.exports = {
  cacheLocations: cacheLocations,
  getUniqueTag: getUniqueTag,
  mkdir: mkdir,
  decode: decode,
  resolve: resolve,
  dirtyCheck: dirtyCheck
}