import { parse } from 'url';
import { normalize, join } from 'path';
import { statSync } from 'fs';
import serverConf from '../conf/server.conf.js';
import { getDirectory } from '../extensions/directory-indexing.js';
import { get, convertToJson } from '../extensions/xml2json.js';

export default class JsonResponse {
  res = {};
  req = {};

  sendJson = function (json, status) {
    if (!status) {
      status = 200;
    }
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
      this.res.sendFile(status, json);
    }
    return true;
  };

  constructor(req, res) {
    this.req = req;
    this.res = res;

    const objUrl = parse(req.url, true),
      uri = decodeURI(normalize(objUrl.pathname)),
      filename = join(serverConf.DocumentRoot, uri),
      objFileInfo = statSync(filename);

    // If it's real, and it's a folder,
    if (objFileInfo && objFileInfo.isDirectory()) {
      // get a dir index, return true
      getDirectory(
        filename,
        (objDir) => {
          if (typeof objDir !== 'string') {
            objDir = { filesystem: [objDir] };
          }
          this.sendJson(objDir);
        },
        'json'
      );
      // return true;
    } else {
      try {
        if (get('Enabled')) {
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
    return true;
  }
}
