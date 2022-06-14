#!/usr/bin/env node
'use strict';

const url = require('url'),
  path = require('path'),
  fs = require('fs'),
  conf = require('../conf/server.conf.js'),
  di = require('../extensions/directory-indexing.js'),
  x2j = require('../extensions/xml2json.js');

exports.index = function (req, res) {
  const objUrl = url.parse(req.url, true),
    uri = decodeURI(path.normalize(objUrl.pathname)),
    filename = path.join(conf.DocumentRoot, uri),
    objFileInfo = fs.statSync(filename),
    self = this;

  // console.log("Running json.js because of",req.url);

  di.Format = 'json';

  this.sendJson = function (json, status) {
    if (!status) {
      status = 200;
    }
    // console.log("status: ", status, uri);
    if (typeof json !== 'string') {
      // console.log("resp: ", res, ", status: ", status);
      if (req.query['callback']) {
        res.jsonp(status, json);
      } else {
        res.json(status, json);
      }
    } else {
      res.sendFile(status, json);
    }
    return true;
  };

  // If it's real, and it's a folder,
  if (objFileInfo && objFileInfo.isDirectory()) {
    // get a dir index, return true
    di.getDirectory(filename, (objDir) => {
      if (typeof objDir !== 'string') {
        objDir = { filesystem: [objDir] };
      }
      self.sendJson(objDir);
    });
    // return true;
  } else if (x2j.get('Enabled')) {
    // otherwise, attempt to convert the file to json, return true,
    // console.log("file isn't directory...");

    x2j.convertToJson(filename, self.sendJson);
    // x2j.convertToJson(filename, function(json, status) {
    // console.log(status, ": Attempting to convert "+ filename +" to Json.");
    // self.sendJson(json, status);
    // });
    // return true;
  } else {
    res.sendFile(filename);
    // return true;
  }
  // return false, and likely, try to run something else to get the file, since json didn't work.
  return true;
};
