import e from 'express';
import { existsSync, statSync } from 'fs';
import { join, normalize } from 'path';
import { parse } from 'url';
import conf from '../conf';
import { getDirectory, hasIndex } from '../extensions/directory-indexing';

export function index(request: e.Request, response: e.Response) {
  const objUrl = parse(request.url, true),
    uri = decodeURI(normalize(objUrl.pathname || '')),
    filename = join(conf.DocumentRoot, uri);

  // console.log("Running index.js because of",request.url);

  const writeEntireResponse = function (
    strContent = '',
    intStatus = 200,
    objOptions: Record<string, string> = {
      'Content-Type': conf.DefaultContentType,
    }
  ) {
    response.writeHead(intStatus, objOptions);
    response.write(strContent, 'binary');
    response.end();
  };

  const isServable = function (filePath: string) {
    const fileExists = existsSync(filePath);
    if (!fileExists) {
      return false;
    }
    const rawStats = statSync(filePath);
    if (rawStats.isDirectory()) {
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
        getDirectory(filename, (files) => {
          if (typeof files === 'string') {
            writeEntireResponse(files);
          }
        });
      }
    } else {
      response.sendFile(filename);
    }
  } else {
    writeEntireResponse('404 Not Found\n' + uri, 404, {
      'Content-Type': 'text/plain',
    });
  }
}
