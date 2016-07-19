"use strict";

const express = require("express");
const log = console.log.bind();
const app = require('./config/express').init(express);
const multer = require('multer');

app.get('/',(req, res) => res.render('index'));

app.post('/submit',(req, res) => {
  res.write("send something");
  console.log(req.files);
  var stream = require('fs').createReadStream(req.body.data[0]);
  stream.on('open', function () {
    // This just pipes the read stream to the response object (which goes to the client)
    stream.pipe(res);
  });

  stream.on('end',_=>res.end('Done!'));
  stream.on('error', _ => res.end('Error'));
})
app.listen(app.get('port'), _ => {
  log(`Server is listening at ${app.get('port')}`);
});
