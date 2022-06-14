import { existsSync, readdir, readFileSync, statSync } from 'fs';
import { basename, extname, join, normalize } from 'path';
import conf from '../conf/directory-indexing.conf.js';
import serverConf from '../conf/server.conf.js';

// From:
// http://nodeexamples.com/2012/09/28/getting-a-directory-listing-using-the-fs-module-in-node-js/
//

// Date.prototype.toIsoTimeString by: o-o from:
// http://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
//

Date.prototype.toIsoTimeString = function () {
  const strY = this.getFullYear().toString();
  const strM = (this.getMonth() + 1).toString();
  const strD = this.getDate().toString();
  return (
    strY +
    '-' +
    (strM[1] ? strM : '0' + strM[0]) +
    '-' +
    (strD[1] ? strD : '0' + strD[0])
  );
};

const buildHtmlRow = function (objFile) {
  let strOut = '<tr>';
  strOut +=
    '<td class="file-name"><a href="' +
    encodeURI(objFile.path) +
    '">' +
    objFile.name +
    (objFile.isDir
      ? '/' + (objFile.hasIndex ? get('DirectoryIndex') : '')
      : '') +
    '</a></td>';
  strOut += '<td class="file-size">' + objFile.size + '</td>';
  strOut +=
    '<td class="file-date">' + objFile.mtime.toIsoTimeString() + '</td>';
  strOut += '</tr>';
  return strOut;
};

export function get(strProp) {
  return conf[strProp] || serverConf[strProp];
}

export function hasIndex(filename) {
  return existsSync(filename + '/' + get('DirectoryIndex'))
    ? get('DirectoryIndex')
    : false;
}

export function hasMedia(filename) {
  const strBasename = basename(filename),
    arrThumbnailNames =
      get('MediaMetadataThumbnailExtension') instanceof Array
        ? get('MediaMetadataThumbnailExtension')
        : [get('MediaMetadataThumbnailExtension')];
  let strThumbnailExt = '',
    strThumbnailName = '';

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

export function getDirectory(p, funIn, format = 'html') {
  p = normalize(p);
  readdir(p, (err, files) => {
    const arrFiles = [];
    let strOut = '';
    if (err) {
      throw err;
    }

    if (format === 'html') {
      strOut += getFile(get('HeaderFilename'));
      strOut += '<table class="directory-indexing">';
    }

    if (
      p !== serverConf.DocumentRoot + '/' &&
      ((format === 'json' && get('IncludeParentDirJson')) ||
        (format === 'html' && get('IncludeParentDirHtml')))
    ) {
      files.unshift('..');
    }
    files
      .map((file) => {
        return join(p, file);
      })
      .filter((file) => {
        if (get('HeaderFilename') && basename(file) === get('HeaderFilename')) {
          return false;
        }
        if (get('FooterFilename') && basename(file) === get('FooterFilename')) {
          return false;
        }
        return !basename(file).match(get('Ignore'));
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
      strOut += getFile(get('FooterFilename'));
      funIn(strOut);
      return;
    }

    // Wrap up what we gathered into a neat little package.
    const strPath = trimDocumentRoot(p);
    const objDirectory = {
      path: strPath,
      name: strPath === '/' ? strPath : basename(strPath),
      hasMedia: hasMedia(p),
      contents: arrFiles,
    };
    funIn(objDirectory);
  });
}

export function trimDocumentRoot(strPath) {
  const strDocRootRxRdy = serverConf.DocumentRoot.replace(/\//, '/'),
    re = new RegExp('^' + strDocRootRxRdy);
  return strPath.replace(re, '');
}

export function getFileInfo(file) {
  const objStats = statSync(file),
    bitIsDir = objStats.isDirectory(),
    objFile = {
      name: basename(file),
      size: objStats.size,
      mtime: objStats.mtime,
      path: trimDocumentRoot(file) + (bitIsDir ? '/' : ''),
      ext: bitIsDir ? 'folder' : extname(file).replace(/^\./, ''),
      isDir: bitIsDir,
      hasIndex: bitIsDir ? hasIndex(file) : false,
      hasMedia: bitIsDir ? hasMedia(file) : false,
    };
  if (objFile.path === '') {
    objFile.path = '/';
  }
  return objFile;
}

export function getFile(strPath, strCurrentDirectory) {
  let strOut = '';
  strCurrentDirectory = strCurrentDirectory || '';
  if (strPath) {
    let fileFullPath = strCurrentDirectory + strPath;
    if (strPath.match(/^\//)) {
      // Our file is on the root level
      fileFullPath = serverConf.DocumentRoot + strPath;
    }
    if (existsSync(fileFullPath)) {
      strOut += readFileSync(fileFullPath);
    }
  }
  return strOut;
}
