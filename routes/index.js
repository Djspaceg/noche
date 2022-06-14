/*
 * GET home page.
 */
'use strict';

const url = require('url'),
  path = require('path'),
  fs = require('fs'),
  conf = require('../conf/server.conf.js'),
  di = require('../extensions/directory-indexing.js');

exports.index = function (request, response) {
  const objUrl = url.parse(request.url, true),
    uri = decodeURI(path.normalize(objUrl.pathname)),
    filename = path.join(conf.DocumentRoot, uri);

  // console.log("Running index.js because of",request.url);

  const writeEntireResponse = function (intStatus, strContent, objOptions) {
    if (arguments.length === 1) {
      strContent = arguments[0];
      intStatus = 200;
    }
    if (!objOptions) {
      objOptions = { 'Content-Type': conf.DefaultContentType };
    }
    if (strContent === undefined) {
      strContent = '';
    }
    response.writeHead(intStatus, objOptions);
    response.write(strContent, 'binary');
    response.end();
  };

  const isServable = function (fi) {
    const fileExists = fs.existsSync(fi);
    if (!fileExists) {
      return false;
    }
    const objFileInfo = fs.statSync(fi);
    if (objFileInfo.isDirectory()) {
      return 'maybe';
    }
    return true;
  };

  const bitIsServable = isServable(filename);
  if (bitIsServable) {
    if (bitIsServable === 'maybe') {
      const bitHasIndex = di.hasIndex(filename);
      if (bitHasIndex) {
        response.sendFile(filename);
      } else {
        di.Format = 'html';
        di.getDirectory(filename, (objFiles) => {
          writeEntireResponse(objFiles);
        });
      }
    } else {
      response.sendFile(filename);
    }
  } else {
    writeEntireResponse(404, '404 Not Found\n' + uri, {
      'Content-Type': 'text/plain',
    });
  }
};
