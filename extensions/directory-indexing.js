#!/usr/bin/env node
'use strict';

//
// Consider using this instead of Apache:
// `twistd -n web -p 8888 --path .`
//

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
	return strY + '-' + (strM[1] ? strM : '0' + strM[0]) + '-' + (strD[1] ? strD : '0' + strD[0]);
};

const fs = require('fs'),
	path = require('path'),
	serverconf = require('../conf/server.conf.js'),
	conf = require('../conf/directory-indexing.conf.js');

const buildHtmlRow = function (objFile) {
	let strOut = '<tr>';
	strOut +=
		'<td class="file-name"><a href="' +
		encodeURI(objFile.path) +
		'">' +
		objFile.name +
		(objFile.isDir ? '/' + (objFile.hasIndex ? exports.get('DirectoryIndex') : '') : '') +
		'</a></td>';
	strOut += '<td class="file-size">' + objFile.size + '</td>';
	strOut += '<td class="file-date">' + objFile.mtime.toIsoTimeString() + '</td>';
	strOut += '</tr>';
	return strOut;
};

exports.get = function (strProp) {
	return exports[strProp] || conf[strProp] || serverconf[strProp];
};

exports.hasIndex = function (filename) {
	return fs.existsSync(filename + '/' + exports.get('DirectoryIndex')) ? exports.get('DirectoryIndex') : false;
};

exports.hasMedia = function (filename) {
	const strBasename = path.basename(filename),
		arrThumbnailNames =
			exports.get('MediaMetadataThumbnailExtension') instanceof Array
				? exports.get('MediaMetadataThumbnailExtension')
				: [exports.get('MediaMetadataThumbnailExtension')];
	let strThumbnailExt = '',
		strThumbnailName = '';

	for (let i = 0; i < arrThumbnailNames.length; i++) {
		strThumbnailExt = arrThumbnailNames[i];
		strThumbnailName = strBasename + strThumbnailExt;
		// Exact match name
		if (fs.existsSync(filename + '/' + strThumbnailName)) {
			return strThumbnailName;
		}
		// Article at the beginning of the title
		if (strBasename.match(/^\s*The\s/i)) {
			strThumbnailName = strBasename.replace(/^\s*(The)\s(.*)\s*(\(.*\))\s*$/i, '$2, $1 $3') + strThumbnailExt;
			if (fs.existsSync(filename + '/' + strThumbnailName)) {
				return strThumbnailName;
			}
		}
		// Article at the end of the title
		if (strBasename.match(/,\s*The\s+\(/i)) {
			strThumbnailName = strBasename.replace(/^\s*(.*),\s*(The)\s*(\(.*\))\s*$/i, '$2 $1 $3') + strThumbnailExt;
			if (fs.existsSync(filename + '/' + strThumbnailName)) {
				return strThumbnailName;
			}
		}
	}
	// No variations found...
	// return "NONE FOUND: " + strThumbnailName;
	return false;
};

exports.getDirectory = function (p, funIn) {
	p = path.normalize(p);
	fs.readdir(p, (err, files) => {
		const arrFiles = [];
		let strOut = '';
		if (err) {
			throw err;
		}

		if (exports.get('Format') === 'html') {
			strOut += exports.getFile(exports.get('HeaderFilename'));
			strOut += '<table class="directory-indexing">';
		}

		// console.log("Root Ccceck comparison: ",p, serverconf.DocumentRoot);
		if (
			p !== serverconf.DocumentRoot + '/' &&
			((exports.get('Format') === 'json' && exports.get('IncludeParentDirJson')) ||
				(exports.get('Format') === 'html' && exports.get('IncludeParentDirHtml')))
		) {
			files.unshift('..');
		}
		files
			.map(file => {
				return path.join(p, file);
			})
			.filter(file => {
				if (exports.get('HeaderFilename') && path.basename(file) === exports.get('HeaderFilename')) {
					return false;
				}
				if (exports.get('FooterFilename') && path.basename(file) === exports.get('FooterFilename')) {
					return false;
				}
				return !path.basename(file).match(exports.get('Ignore'));
			})
			.forEach(file => {
				// console.log("- file: ", file, "- p:", p);
				try {
					if (fs.existsSync(file)) {
						// file exists
						const objFile = exports.getFileInfo(file);
						if (file.length < p.length) {
							objFile.name = 'Parent Directory';
						}
						if (exports.get('Format') === 'html') {
							strOut += buildHtmlRow(objFile);
						} else {
							arrFiles.push(objFile);
						}
					}
				} catch (err) {
					console.error(err)
				}
			});

		if (exports.get('Format') === 'html') {
			strOut += '</table>';
			strOut += exports.getFile(exports.get('FooterFilename'));
			funIn(strOut);
			return;
		}

		// Wrap up what we gathered into a neat little package.
		const strPath = exports.trimDocumentRoot(p);
		const objDirectory = {
			path: strPath,
			name: strPath === '/' ? strPath : path.basename(strPath),
			hasMedia: exports.hasMedia(p),
			contents: arrFiles
		};
		funIn(objDirectory);
	});
};

exports.trimDocumentRoot = function (strPath) {
	const strDocRootRxRdy = serverconf.DocumentRoot.replace(/\//, '/'),
		re = new RegExp('^' + strDocRootRxRdy);
	return strPath.replace(re, '');
};

exports.getFileInfo = function (file) {
	const objStats = fs.statSync(file),
		bitIsDir = objStats.isDirectory(),
		objFile = {
			name: path.basename(file),
			size: objStats.size,
			mtime: objStats.mtime,
			path: exports.trimDocumentRoot(file) + (bitIsDir ? '/' : ''),
			ext: bitIsDir ? 'folder' : path.extname(file).replace(/^\./, ''),
			isDir: bitIsDir,
			hasIndex: bitIsDir ? exports.hasIndex(file) : false,
			hasMedia: bitIsDir ? exports.hasMedia(file) : false
		};
	if (objFile.path === '') {
		objFile.path = '/';
	}
	return objFile;
};

exports.getFile = function (strPath, strCurrentDirectory) {
	let strOut = '';
	strCurrentDirectory = strCurrentDirectory || '';
	if (strPath) {
		let fileFullPath = strCurrentDirectory + strPath;
		if (strPath.match(/^\//)) {
			// Our file is on the root level
			fileFullPath = serverconf.DocumentRoot + strPath;
		}
		if (fs.existsSync(fileFullPath)) {
			strOut += fs.readFileSync(fileFullPath);
		}
	}
	return strOut;
};
