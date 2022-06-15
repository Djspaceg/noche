import e from 'express';
import { statSync } from 'fs';
import { join, normalize } from 'path';
import { parse } from 'url';
import conf from '../configuration';
import { getDirectory } from '../extensions/directory-indexing';
import { convertToJson } from '../extensions/xml2json';

export class JsonResponse {
  req: e.Request;
  res: e.Response;

  sendJson = (json: string | Record<string, any>, status = 200) => {
    // console.log("status: ", status, uri);
    if (typeof json !== 'string') {
      // console.log("resp: ", res, ", status: ", status);
      if (this.req.query['callback']) {
        // this.res.jsonp(status, json);
        this.res.status(status).jsonp(json);
      } else {
        // this.res.json(status, json);
        this.res.status(status).json(json);
      }
    } else {
      this.res.status(status).sendFile(json);
    }
    return true;
  };

  constructor(req: e.Request, res: e.Response) {
    this.req = req;
    this.res = res;

    const url = parse(req.url, true),
      uri = decodeURI(normalize(url.pathname || '')),
      filename = join(conf.DocumentRoot, uri),
      objFileInfo = statSync(filename);

    // If it's real, and it's a folder,
    if (objFileInfo && objFileInfo.isDirectory()) {
      // get a dir index, return true
      getDirectory(
        filename,
        (dirInfo) => {
          if (typeof dirInfo !== 'string') {
            this.sendJson({ filesystem: [dirInfo] });
          } else {
            this.sendJson(dirInfo);
          }
        },
        'json'
      );
      // return true;
    } else {
      try {
        if (conf.xml2json.Enabled) {
          // otherwise, attempt to convert the file to json, return true,
          // console.log("file isn't directory...");
          convertToJson(filename, this.sendJson.bind(this));
        } else {
          res.sendFile(filename);
        }
      } catch {
        res.sendFile(filename);
      }
    }
    // return false, and likely, try to run something else to get the file, since json didn't work.
    return this;
  }
}

export default JsonResponse;
