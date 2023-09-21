import { existsSync, readdir, readFileSync, statSync } from 'fs';
import { basename, extname, join, normalize } from 'path';
import conf from '../configuration';
import { humanFileSize, readableDuration } from '../util';
import { convertToJson } from './xml2json';

// From:
// http://nodeexamples.com/2012/09/28/getting-a-directory-listing-using-the-fs-module-in-node-js/
//

// Date.prototype.toIsoTimeString by: o-o from:
// http://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
//

const zeroPad = (num: number): string =>
  num < 10 ? `0${num}` : num.toString();

const toIsoTimeString = function (date = new Date()): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${zeroPad(m)}-${zeroPad(d)}`;
};

const readableDate = (date: Date): string => {
  if (conf.directoryIndexing.RelativeDates) {
    return readableDuration(Date.now() - date.getTime(), {
      base: 'millisecond',
      limit: 1,
      relative: true,
    });
  } else {
    return toIsoTimeString(date);
  }
};

const buildHtmlRow = function ({
  name,
  path,
  hasIndex,
  isDir,
  size,
  mtime,
}: FileInfo): string {
  return `<tr>
  <td class="file-name">
    <a href="${encodeURI(path)}">
      ${name}${isDir ? '/' + (hasIndex || '') : ''}
    </a>
  </td>
  <td class="file-size">${humanFileSize(size)}</td>
  <td class="file-date">${readableDate(mtime)}</td>
</tr>`;
};

export function hasIndex(path: string): string | false {
  const filename = join(path, conf.DirectoryIndex);
  if (!existsSync(filename)) {
    return false;
  }
  let title = '';
  let fileJson;
  convertToJson(filename, (err, json) => {
    if (err) {
      console.log('JSON conversion error on %s: %s', filename, err);
    }
    fileJson = json;
  });

  if (fileJson && !('error' in fileJson)) {
    const htmlJson = fileJson as { html?: { head?: { title?: string } } };
    // console.log('fileJson: ', fileJson, 'title:', htmlJson?.html?.head?.title);
    title = htmlJson?.html?.head?.title || '';
  }

  return title || conf.DirectoryIndex;
}

export function hasMedia(filename: string): string | false {
  const strBasename = basename(filename);
  const arrThumbnailNames =
    conf.directoryIndexing.MediaMetadataThumbnailExtension instanceof Array
      ? conf.directoryIndexing.MediaMetadataThumbnailExtension
      : [conf.directoryIndexing.MediaMetadataThumbnailExtension];
  let strThumbnailExt = '';
  let strThumbnailName = '';

  for (let i = 0; i < arrThumbnailNames.length; i++) {
    strThumbnailExt = arrThumbnailNames[i];
    strThumbnailName = strBasename + strThumbnailExt;
    // Exact match name
    if (existsSync(filename + '/' + strThumbnailName)) {
      return strThumbnailName;
    }
    // Article at the beginning of the title
    if (strBasename.match(/^\s*The\s/i)) {
      strThumbnailName =
        strBasename.replace(/^\s*(The)\s(.*)\s*(\(.*\))\s*$/i, '$2, $1 $3') +
        strThumbnailExt;
      if (existsSync(filename + '/' + strThumbnailName)) {
        return strThumbnailName;
      }
    }
    // Article at the end of the title
    if (strBasename.match(/,\s*The\s+\(/i)) {
      strThumbnailName =
        strBasename.replace(/^\s*(.*),\s*(The)\s*(\(.*\))\s*$/i, '$2 $1 $3') +
        strThumbnailExt;
      if (existsSync(filename + '/' + strThumbnailName)) {
        return strThumbnailName;
      }
    }
  }
  // No variations found...
  // return "NONE FOUND: " + strThumbnailName;
  return false;
}

type DirectoryInfo = {
  path: string;
  name: string;
  hasMedia: string | false;
  contents: FileInfo[];
};

export function getDirectory(
  p: string,
  funIn: (info: string | DirectoryInfo) => void,
  format = 'html',
) {
  p = normalize(p);
  readdir(p, (err, files) => {
    const arrFiles: FileInfo[] = [];
    let strOut = '';
    if (err) {
      throw err;
    }

    if (format === 'html') {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      strOut += getFile(conf.directoryIndexing.HeaderFilename);

      strOut +=
        '<table class="directory-indexing" cellspacing="0" cellpadding="0">';
    }

    if (
      p !== conf.DocumentRoot + '/' &&
      ((format === 'json' && conf.directoryIndexing.IncludeParentDirJson) ||
        (format === 'html' && conf.directoryIndexing.IncludeParentDirHtml))
    ) {
      files.unshift('..');
    }
    files
      .map((file) => {
        return join(p, file);
      })
      .filter((file) => {
        if (
          conf.directoryIndexing.HeaderFilename &&
          basename(file) === conf.directoryIndexing.HeaderFilename
        ) {
          return false;
        }
        if (
          conf.directoryIndexing.FooterFilename &&
          basename(file) === conf.directoryIndexing.FooterFilename
        ) {
          return false;
        }
        return !basename(file).match(conf.directoryIndexing.Ignore);
      })
      .forEach((file) => {
        // console.log("- file: ", file, "- p:", p);
        try {
          if (existsSync(file)) {
            // file exists
            const objFile = getFileInfo(file);
            if (file.length < p.length) {
              objFile.name = 'Parent Directory';
            }
            if (format === 'html') {
              strOut += buildHtmlRow(objFile);
            } else {
              arrFiles.push(objFile);
            }
          }
        } catch (err) {
          console.error(err);
        }
      });

    if (format === 'html') {
      strOut += '</table>';
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      strOut += getFile(conf.directoryIndexing.FooterFilename);
      funIn(strOut);
      return;
    }

    // Wrap up what we gathered into a neat little package.
    const strPath = trimDocumentRoot(p);
    const objDirectory: DirectoryInfo = {
      path: strPath,
      name: strPath === '/' ? strPath : basename(strPath),
      hasMedia: hasMedia(p),
      contents: arrFiles,
    };
    funIn(objDirectory);
  });
}

export function trimDocumentRoot(path: string) {
  const docRootRxRdy = conf.DocumentRoot.replace(/\//, '/');
  const re = new RegExp('^' + docRootRxRdy);
  return path.replace(re, '');
}

type FileInfo = {
  name: string;
  size: number;
  mtime: Date;
  path: string;
  ext: string;
  isDir: boolean;
  hasIndex: string | false;
  hasMedia: string | false;
};
export function getFileInfo(path: string): FileInfo {
  const rawStats = statSync(path);
  const isDir = rawStats.isDirectory();
  const stats: FileInfo = {
    name: basename(path),
    size: rawStats.size,
    mtime: rawStats.mtime,
    path: trimDocumentRoot(path) + (isDir ? '/' : ''),
    ext: isDir ? 'folder' : extname(path).replace(/^\./, ''),
    isDir,
    hasIndex: isDir ? hasIndex(path) : false,
    hasMedia: isDir ? hasMedia(path) : false,
  };
  if (stats.path === '') {
    stats.path = '/';
  }
  return stats;
}

export function getFile(path: string, currentDirectory = '') {
  if (path) {
    let fileFullPath = currentDirectory + path;
    if (path.match(/^\//)) {
      // Our file is on the root level
      fileFullPath = conf.DocumentRoot + path;
    }
    if (existsSync(fileFullPath)) {
      return readFileSync(fileFullPath);
    }
  }
  return '';
}
