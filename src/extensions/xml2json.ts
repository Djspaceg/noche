import { readFile } from 'fs';
import { Parser } from 'xml2js';
import conf from '../configuration';

// / From:
// / https://github.com/Leonidas-from-XIV/node-xml2js#options
// /

export function convertToJson(
  path: string,
  funSuccess: (status: any, statusCode?: number) => void
) {
  const parser = new Parser(conf.xml2json.Options);

  parser.on('end', (result) => {
    if (funSuccess) {
      funSuccess(result);
    }
  });

  readFile(path, (err, data) => {
    if (!err && data) {
      try {
        if (data.slice(0, 1).toString() === '<') {
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
      const error = `Error loading "${path}": ${
        err?.message || 'unknown error'
      }`;
      console.log(error);
      funSuccess({ error }, 400);
    }
  });
  return true;
}
