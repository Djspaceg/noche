
/*
 * GET home page.
 */

var url  = require("url"),
	path = require("path"),
	fs   = require("fs"),
	conf = require("../conf/server.conf.js"),
	di   = require("../extensions/directory-indexing.js");

exports.index = function(request, response) {
	var objUrl = url.parse(request.url, true),
		uri = decodeURI(path.normalize(objUrl.pathname)),
		filename = path.join(conf.DocumentRoot, uri);

	// console.log("Running index.js because of",request.url);
	
	var writeEntireResponse = function(intStatus, strContent, objOptions) {
		if (arguments.length == 1) {
			strContent = arguments[0];
			intStatus = 200;
		}
		if (!objOptions) {
			objOptions = {"Content-Type": conf.DefaultContentType};
		}
		if (strContent === undefined) {
			strContent = "";
		}
		else if ( typeof strContent !== "string") {
			if (request.query["callback"]) {
				response.jsonp(strContent);
			}
			else {
				response.json(strContent);
			}
			return;
		}
		response.writeHead(intStatus, objOptions);
		response.write(strContent, "binary");
		response.end();
	};

	var isServable = function(filename) {
		var fileExists = fs.existsSync(filename);
		if (!fileExists) {
			return false;
		}
		var objFileInfo = fs.statSync(filename);
		if (objFileInfo.isDirectory()) {
			return "maybe";
		}
		return true;
	};

	var bitIsServable = isServable(filename);
	if (bitIsServable) {
		if (bitIsServable === "maybe") {
			var bitHasIndex = di.hasIndex(filename);
			if (bitHasIndex) {
				response.sendfile(filename);
			}
			else {
				di.getDirectory(filename, function(objFiles) {
					writeEntireResponse(objFiles);
				});
			}
		}
		else {
			response.sendfile(filename);
		}
	}
	else {
		writeEntireResponse(404, "404 Not Found\n"+uri, {"Content-Type": "text/plain"});
	}
	return;
};
