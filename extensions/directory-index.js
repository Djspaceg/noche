#!/usr/bin/env node

// 
// Consider using this instead of Apache:
// `twistd -n web -p 8888 --path .`
// 

/// From:
/// http://nodeexamples.com/2012/09/28/getting-a-directory-listing-using-the-fs-module-in-node-js/
///

var conf = require("../conf/directory-index.conf.js"),
	fs = require("fs"),
	path = require("path");

// exports.IGNORE = /^\./;

exports.getDirectory = function(p, funIn) {
	p = path.normalize(p);
	fs.readdir(p, function (err, files) {
		var arrFiles = [];
		if (err) {
			throw err;
		}

		files.map(function (file) {
			return path.join(p, file);
		}).filter(function (file) {
			return !(path.basename(file).match(conf.IGNORE));
		// }).filter(function (file) {
		// 	return fs.statSync(file).isFile();
		}).forEach(function (file) {
			// console.log("- file: ", file, "- p:", p);
			var objFile = exports.getFileInfo(file);
			arrFiles.push(objFile);
		});
		// console.log("arrFiles: ", arrFiles);
		funIn(arrFiles);
	});
};
exports.getFileInfo = function(file) {
	var objStats = fs.statSync(file),
		objFile = {
			name: path.basename(file),
			size: objStats.size,
			mtime: objStats.mtime,
			path: file,
			ext: path.extname(file).replace(/^\./, ""),
			isDir: objStats.isDirectory()
	};
	return objFile;
};
