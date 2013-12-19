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

exports.getDirectory = function(p, funIn) {
	p = path.normalize(p);
	fs.readdir(p, function (err, files) {
		var arrFiles = [],
			strOut = "";
		if (err) {
			throw err;
		}

		// console.log("Root Ccceck comparison: ",p, serverconf.DocumentRoot);
		if (p != serverconf.DocumentRoot + "/" && (
				(exports.get("Format") === "json" && exports.get("IncludeParentDirJson"))
				||
				(exports.get("Format") === "html" && exports.get("IncludeParentDirHtml"))
			)) {
			files.unshift("..");
		}
		strOut+= '<table class="directory-indexing">';
		files.map(function (file) {
			return path.join(p, file);
		}).filter(function (file) {
			return !(path.basename(file).match(exports.get("Ignore")));
		// }).filter(function (file) {
		// 	return fs.statSync(file).isFile();
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
			// arrFiles = strOut;
			funIn(strOut);
			return;
		}
		// console.log("arrFiles: ", arrFiles);
		var strPath = exports.trimDocumentRoot(p);
		var objDirectory = {
			path: exports.trimDocumentRoot(p),
			name: (strPath === "/") ? strPath : path.basename(strPath),
			contents: arrFiles
		};
		funIn(objDirectory);
	});
};

exports.get = function(strProp) {
	return exports[strProp] || conf[strProp];
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
			isDir: objStats.isDirectory()
	};
	// var strDocRootRxRdy = serverconf.DocumentRoot.replace(/\//, "\/");
	// var re = new RegExp("^"+strDocRootRxRdy);
	// if (arrFiles instanceof Array) {
	// 	arrFiles = arrFiles.map(function (file) {
			// objFile.path = objFile.path.replace(re, "");
			// file.path = file.path.replace("/^" + conf.DocumentRoot + "/", "");
			// console.log("file.path", file.path);
	// 		return file;
	// 	});
	// }
	// if (file.match(/\.\.$/)) {
	// }
	if (objFile.path == "") {
		objFile.path = "/";
	}
	return objFile;
};

var buildHtmlRow = function(objFile) {
	var strOut = '<tr>';
	strOut+= '<td class="file-name"><a href="'+ encodeURI(objFile.path) +'">'+ objFile.name + (objFile.isDir ? "/" : "") +'</a></td>';
	strOut+= '<td class="file-size">'+ objFile.size +'</td>';
	strOut+= '<td class="file-date">'+ objFile.mtime.toIsoTimeString() +'</td>';
	strOut+= '</tr>';
	return strOut;
};
