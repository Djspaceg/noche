#!/usr/bin/env node

// 
// Consider using this instead of Apache:
// `twistd -n web -p 8888 --path .`
// 

/// From:
/// http://nodeexamples.com/2012/09/28/getting-a-directory-listing-using-the-fs-module-in-node-js/
///

/// Date.prototype.toIsoTimeString by: o-o from:
/// http://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
/// 

Date.prototype.toIsoTimeString = function() {
	var strY = this.getFullYear().toString();
	var strM = (this.getMonth()+1).toString();
	var strD  = this.getDate().toString();
	return strY + "-" + (strM[1] ? strM : "0" + strM[0]) + "-" + (strD[1] ? strD : "0" + strD[0]);
};

var fs = require("fs"),
	path = require("path"),
	serverconf = require("../conf/server.conf.js"),
	conf = require("../conf/directory-indexing.conf.js");
	
exports.get = function(strProp) {
	return exports[strProp] || conf[strProp] || serverconf[strProp];
};

exports.hasIndex = function(filename) {
	return fs.existsSync(filename + "/" + exports.get("DirectoryIndex")) ? exports.get("DirectoryIndex") : false;
};

exports.hasMedia = function(filename) {
	var strBasename = path.basename(filename),
		strThumbnailName = strBasename + exports.get("MediaMetadataThumbnailExtension");

	// Exact match name
	if ( fs.existsSync(filename + "/" + strThumbnailName) ) {
		return strThumbnailName;
	}
	// Article at the beginning of the title
	if ( strBasename.match(/^\s*The\s/i) ) {
		strThumbnailName = strBasename.replace(/^\s*(The)\s(.*)\s*(\(.*\))\s*$/i, "$2, $1 $3") + exports.get("MediaMetadataThumbnailExtension");
		if ( fs.existsSync(filename + "/" + strThumbnailName) ) {
			return strThumbnailName;
		}
	}
	// Article at the end of the title
	if ( strBasename.match(/,\s*The\s+\(/i) ) {
		strThumbnailName = strBasename.replace(/^\s*(.*),\s*(The)\s*(\(.*\))\s*$/i, "$2 $1 $3") + exports.get("MediaMetadataThumbnailExtension");
		if ( fs.existsSync(filename + "/" + strThumbnailName) ) {
			return strThumbnailName;
		}
	}
	// No variations found...
	// return "NONE FOUND: " + strThumbnailName;
	return false;
};

exports.getDirectory = function(p, funIn) {
	p = path.normalize(p);
	fs.readdir(p, function (err, files) {
		var arrFiles = [],
			strOut = "";
		if (err) {
			throw err;
		}

		if (exports.get("Format") === "html") {
			strOut+= exports.getFile( exports.get("HeaderFilename") );
			strOut+= '<table class="directory-indexing">';
		}

		// console.log("Root Ccceck comparison: ",p, serverconf.DocumentRoot);
		if (p != serverconf.DocumentRoot + "/" && (
				(exports.get("Format") === "json" && exports.get("IncludeParentDirJson"))
				||
				(exports.get("Format") === "html" && exports.get("IncludeParentDirHtml"))
			)) {
			files.unshift("..");
		}
		files.map(function (file) {
			return path.join(p, file);
		}).filter(function (file) {
			if (exports.get("HeaderFilename") && path.basename(file) == exports.get("HeaderFilename")) return false;
			if (exports.get("FooterFilename") && path.basename(file) == exports.get("FooterFilename")) return false;
			return !(path.basename(file).match(exports.get("Ignore")));
		}).forEach(function (file) {
			// console.log("- file: ", file, "- p:", p);
			var objFile = exports.getFileInfo(file);
			if (file.length < p.length) {
				objFile.name = "Parent Directory";
			}
			if (exports.get("Format") === "html") {
				strOut+= buildHtmlRow(objFile);
			}
			else {
				arrFiles.push(objFile);
			}
		});

		if (exports.get("Format") === "html") {
			strOut+= '</table>';
			strOut+= exports.getFile( exports.get("FooterFilename") );
			funIn(strOut);
			return;
		}

		// Wrap up what we gathered into a neat little package.
		var strPath = exports.trimDocumentRoot(p);
		var objDirectory = {
			path: strPath,
			name: (strPath === "/") ? strPath : path.basename(strPath),
			hasMedia: exports.hasMedia(p),
			contents: arrFiles
		};
		funIn(objDirectory);
	});
};

exports.trimDocumentRoot = function(strPath) {
	var strDocRootRxRdy = serverconf.DocumentRoot.replace(/\//, "\/"),
		re = new RegExp("^"+strDocRootRxRdy);
	return strPath.replace(re, "");
};
exports.getFileInfo = function(file) {
	var objStats = fs.statSync(file),
		objFile = {
			name: path.basename(file),
			size: objStats.size,
			mtime: objStats.mtime,
			path: exports.trimDocumentRoot(file) + (objStats.isDirectory() ? "/" : ""),
			ext: objStats.isDirectory() ? "folder" : path.extname(file).replace(/^\./, ""),
			isDir: objStats.isDirectory(),
			hasIndex: exports.hasIndex(file),
			hasMedia: exports.hasMedia(file)
	};
	if (objFile.path == "") {
		objFile.path = "/";
	}
	return objFile;
};
exports.getFile = function(strPath, strCurrentDirectory) {
	var strOut = "",
		strCurrentDirectory = strCurrentDirectory || "";
	if (strPath) {
		var fileFullPath = strCurrentDirectory + strPath;
		if (strPath.match(/^\//)) {
			// Our file is on the root level
			fileFullPath = serverconf.DocumentRoot + strPath;
		}
		if (fs.existsSync( fileFullPath )) {
			strOut+= fs.readFileSync( fileFullPath );
		}
	}
	return strOut;	
};

var buildHtmlRow = function(objFile) {
	var strOut = '<tr>';
	strOut+= '<td class="file-name"><a href="'+ encodeURI(objFile.path) +'">'+ objFile.name + (objFile.isDir ? "/" + (objFile.hasIndex ? exports.get("DirectoryIndex") : "") : "") +'</a></td>';
	strOut+= '<td class="file-size">'+ objFile.size +'</td>';
	strOut+= '<td class="file-date">'+ objFile.mtime.toIsoTimeString() +'</td>';
	strOut+= '</tr>';
	return strOut;
};
