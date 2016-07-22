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

/**
 * [getUniqueTag Generates a unique tag for each request coming on '/submit']
 * @return {Tag} [Unique tag which is combination of tag${alphabet} - currentTime which will be unique]
 */
function getUniqueTag() {
  if(tags.length === 0) {
    init();
  }
  return tags[Math.floor(26*Math.random())] + '-' + Date.now();
}


/**
 * [cacheLocations Cache the location on which files are stored on disk]
 * @param  {Object} req  [Request Object]
 * @param  {FileObject} file [File]
 */
function cacheLocations(req, file) {

  if(!req.file_locations) {
    req.file_locations = [];
  };
  req.file_locations.push(req.file_dir + '/' + file.originalname);

}

/**
 * [mkdir Make directory specified and if directory exist it skips it]
 * @param {[Array]} dirs [Array of directories]
 */
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

/**
 * [decode Decode URL params]
 * @param  {String} Input [Input which is url encoded]
 * @return {String} [Output which is url decoded]
 */
function decode(input) {
  return decodeURIComponent(input);
}


function resolve(target) {
  return pResolve(__dirname,target);
}

/**
 * [checkCSV Checks if user supplied file is csv or not]
 * @param  {String} source [Name of file specified with extension]
 * @return {Boolean}        [False if csv or true if not]
 */
function checkCSV(source) {
  if(source.originalname.slice(-4) !== '.csv') {
      //dirty
      return true;
  }
  return false;
}


/**
 * [checkImages Checks if user supplied things are images or not]
 * @param  {[String]} source [Array of image locations]
 * @return {Boolean}    [True is they are not images else false]
 */
function checkImages(source) {
  const flag = source.every(location => location.match(/\.(jpg|jpeg|png|gif|svg)$/));
  if(!flag) {
    //dirty
    return true;
  }
  return false;
}


/**
 * [checkURL Checks if user supplied thing are valid Web uri OR not]
 * @param  {[String]} source [Array of urls]
 * @return {Boolean}  [True is they are invalid else valid]
 */
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

/**
 * [dirtyCheck DirtyCheck if the source specified is valid or not]
 * @param  {[String]} source [Array of input]
 * @param  {String} base   [Base against which we'll verify if given input is valid..Possible values :- csv,img,urls]
 * @return {Boolean}        [description]
 */
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


//Expose this file
module.exports = {
  cacheLocations: cacheLocations,
  getUniqueTag: getUniqueTag,
  mkdir: mkdir,
  decode: decode,
  resolve: resolve,
  dirtyCheck: dirtyCheck
}