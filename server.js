"use strict";

const express = require("express");
const path = require('path');
const log = console.log.bind();
const app = require('./config/express').init(express);
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'static/uploads/' })
const csv = require('csv-streamify');
const Transform = require('stream').Transform;
const csvParser = csv();
const got = require('got');
app.get('/',(req, res) => res.render('index'));

var parser = new Transform({objectMode: true});
parser._transform = function(data, encoding, done) {
  link = data.toString().slice(1,-2);
  got.stream(link)
  .pipe(fs.createWriteStream(path.resolve(__dirname,'/uploads/src/link')))
  .on('close',_ => {
    this.push(link);
    done();  
  })
  
};

app.post('/submit/csv',upload.array('data'),(req, res) => {
  var stream = fs.createReadStream(path.resolve(__dirname,req.files[0].path));

  stream.pipe(csvParser)
    .pipe(parser)
    .pipe(res);

});
app.listen(app.get('port'), _ => {
  log(`Server is listening at ${app.get('port')}`);
});
