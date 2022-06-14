import { parse } from 'url';
import { normalize, join } from 'path';
import { existsSync, statSync } from 'fs';
import serverConf from '../conf/server.conf.js';
import { hasIndex, getDirectory } from '../extensions/directory-indexing.js';

export function index(request, response) {
  const objUrl = parse(request.url, true),
    uri = decodeURI(normalize(objUrl.pathname)),
    filename = join(serverConf.DocumentRoot, uri);

  // console.log("Running index.js because of",request.url);

  const writeEntireResponse = function (intStatus, strContent, objOptions) {
    if (arguments.length === 1) {
      strContent = arguments[0];
      intStatus = 200;
    }
    if (!objOptions) {
      objOptions = { 'Content-Type': serverConf.DefaultContentType };
    }
    if (strContent === undefined) {
      strContent = '';
    }
    response.writeHead(intStatus, objOptions);
    response.write(strContent, 'binary');
    response.end();
  };

  const isServable = function (fi) {
    const fileExists = existsSync(fi);
    if (!fileExists) {
      return false;
    }
    const objFileInfo = statSync(fi);
    if (objFileInfo.isDirectory()) {
      return 'maybe';
    }
    return true;
  };

  const bitIsServable = isServable(filename);
  if (bitIsServable) {
    if (bitIsServable === 'maybe') {
      const bitHasIndex = hasIndex(filename);
      if (bitHasIndex) {
        response.sendFile(filename);
      } else {
        getDirectory(filename, (objFiles) => {
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
}
