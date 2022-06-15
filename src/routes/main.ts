import e from 'express';
import { existsSync, statSync } from 'fs';
import { OutgoingHttpHeader, OutgoingHttpHeaders } from 'http';
import { join, normalize } from 'path';
import { parse } from 'url';
import conf from '../configuration';
import { getDirectory, hasIndex } from '../extensions/directory-indexing';

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

export function main(req: e.Request, res: e.Response) {
  const objUrl = parse(req.url, true);
  const uri = decodeURI(normalize(objUrl.pathname || ''));
  const filename = join(conf.DocumentRoot, uri);

  // console.log("Running index.js because of",req.url);

  type Headers = Parameters<e.Response['writeHead']>[1];

  const writeEntireResponse = function (
    strContent = '',
    statusCode = 200,
    headers: Headers = {
      'Content-Type': conf.DefaultContentType,
    }
  ) {
    res.writeHead(statusCode, headers);
    res.write(strContent, 'binary');
    res.end();
  };

  const bitIsServable = isServable(filename);
  if (bitIsServable) {
    if (bitIsServable === 'maybe') {
      const bitHasIndex = hasIndex(filename);
      if (bitHasIndex) {
        res.sendFile(filename);
      } else {
        getDirectory(filename, (files) => {
          if (typeof files === 'string') {
            // writeEntireResponse(files);
            res.render('index', {
              title: conf.ServerName,
              directoryIndex: files,
            });
          }
        });
      }
    } else {
      res.sendFile(filename);
    }
  } else {
    writeEntireResponse('404 Not Found\n' + uri, 404, {
      'Content-Type': 'text/plain',
    });
  }
}

export default main;
