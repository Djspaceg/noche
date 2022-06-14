import { readFile } from 'fs';
import { Parser } from 'xml2js';
import * as conf from '../conf/xml2json.conf.js';

// / From:
// / https://github.com/Leonidas-from-XIV/node-xml2js#options
// /

export function get(strProp) {
  return conf[strProp];
}

export function convertToJson(path, funSuccess) {
  const parser = new Parser(conf.Options);

  parser.on('end', (result) => {
    if (funSuccess) {
      funSuccess(result);
    }
  });

  readFile(path, (err, data) => {
    if (!err && data) {
      try {
        if (data.asciiSlice(0, 1) === '<') {
          // File is XML-ish
          parser.parseString(data);
        } else {
          // File is already JSON
          funSuccess(JSON.parse(data.toString()));
        }
      } catch {
        const error = `Converting "${path}" but it does not appear to be XML.`;
        console.log(error);
        funSuccess({ error }, 406);
      }
    } else {
      const error = `Error loading "${path}": ${err}`;
      console.log(error);
      funSuccess({ error }, 400);
    }
  });
  return true;
}
