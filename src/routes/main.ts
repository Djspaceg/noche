import e from 'express';
import { existsSync, statSync } from 'fs';
import { parse } from 'url';
import conf from '../configuration';
import { getDirectory, hasIndex } from '../extensions/directory-indexing';
import path from 'path';

const getClosestMatchingDirectory = function (filePath: string): string {
  const pathParts = path.parse(filePath);

  if (!existsSync(pathParts.dir)) {
    return getClosestMatchingDirectory(pathParts.dir);
  }
  return pathParts.dir;
};

const isServable = function (filePath: string) {
  const fileExists = existsSync(filePath);
  if (!fileExists) {
    const nearestPath = getClosestMatchingDirectory(filePath);
    if (nearestPath) {
      console.log(
        `File "${filePath}" not found. Nearest resolvable path to be used is "${nearestPath}".`
      );
      return nearestPath;
    }
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
  const uri = decodeURI(path.normalize(objUrl.pathname || ''));
  const filename = path.join(conf.DocumentRoot, uri);

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

  const fileIsServable = isServable(filename);
  if (fileIsServable) {
    if (typeof fileIsServable === 'string') {
      let probablyServableFolder = filename;
      if (fileIsServable !== 'maybe') {
        probablyServableFolder = fileIsServable;
      }
      const bitHasIndex = hasIndex(probablyServableFolder);
      if (bitHasIndex) {
        res.sendFile(probablyServableFolder);
      } else {
        getDirectory(probablyServableFolder, (files) => {
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
