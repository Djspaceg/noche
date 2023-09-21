import { readFileSync } from 'fs';
import { Parser } from 'xml2js';
import conf from '../configuration';

// / From:
// / https://github.com/Leonidas-from-XIV/node-xml2js#options
// /

type ConversionSuccess = Record<string, unknown>;
type ConversionError = Error | null;

export function convertToJson(
  path: string,
  cb: (
    status: ConversionSuccess | ConversionError,
    statusCode?: number,
  ) => void,
) {
  const parser = new Parser(conf.xml2json.Options);

  try {
    const value = readFileSync(path);
    try {
      if (value.slice(0, 1).toString() === '<') {
        // File is XML-ish
        parser.parseString(value, cb);
      } else {
        // File is already JSON
        return cb(JSON.parse(value.toString()) as ConversionSuccess);
      }
    } catch (err) {
      const error = `Converting "${path}" but it does not appear to be XML.`;
      console.log(error, err);
      return cb({ error }, 406);
    }
  } catch (err) {
    const reason = err as Error;
    const error = `Error loading "${path}": ${
      reason?.message || 'unknown error'
    }`;
    console.log(error);
    return cb({ error }, 400);
  }
}
