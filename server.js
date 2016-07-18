"use strict";

const express = require("express");
const log = console.log.bind();
const app = require('./config/express').init(express);

app.get('/',(req, res) => res.render('index'));

app.listen(app.get('port'), _ => {
  log(`Server is listening at ${app.get('port')}`);
});
