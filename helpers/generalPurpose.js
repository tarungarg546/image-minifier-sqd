'use strict';

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
const tags = [];

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

module.exports = {
  cacheLocations: cacheLocations,
  getUniqueTag: getUniqueTag
}