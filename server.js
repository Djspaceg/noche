#!/usr/bin/env node
// 
// Based on rpflorence's Gist @ https://gist.github.com/rpflorence/701407
// 

var util = require("util"),
	http = require("http"),
	url  = require("url"),
	path = require("path"),
	fs   = require("fs"),
	conf = require("./conf/server.conf.js"),
	di   = require("./extensions/directory-indexing.js"),
	x2j  = require("./extensions/xml2json.js"),
	mime = require("mime");

http.createServer(function(request, response) {
	var objUrl = url.parse(request.url, true),
		uri = decodeURI(path.normalize(objUrl.pathname)),
		filename = path.join(conf.DocumentRoot, uri);
	// process.cwd()

	// console.log("process.cwd()", process.cwd(), "request.url", request.url, "uri", uri);
	
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
			objOptions["Content-Type"] = "application/json";
			strContent = JSON.stringify(strContent);
			if (objUrl.query["callback"]) {
				objOptions["Content-Type"] = "application/javascript";
				strContent = objUrl.query["callback"] + "(" + strContent + ");";
			}
		}
		response.writeHead(intStatus, objOptions);
		response.write(strContent, "binary");
		response.end();
	};

	var serveFile = function(filename) {
		// console.log("accessing:", filename);
		var strMime = mime.lookup(filename) || conf.DefaultContentType;

		fs.stat(filename, function(err, stat) {
			if (err) {
				writeEntireResponse(500, err + "\n", {"Content-Type": "text/plain"});
				return;
			}
			response.writeHeader(200,{"Content-Type": strMime, "Content-Length": stat.size});
			var fReadStream = fs.createReadStream(filename);
			fReadStream.pipe(response);
		});
		return true;
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
	// var hasIndex = function(filename) {
		// return fs.existsSync(filename + "/" + conf.DirectoryIndex) ? filename + "/" + conf.DirectoryIndex : false;
	// };

	var bitIsServable = isServable(filename);
	if (bitIsServable) {
		if (bitIsServable === "maybe") {
			var bitHasIndex = di.hasIndex(filename);
			if (bitHasIndex) {
				serveFile(bitHasIndex);
			}
			else {
				// console.log("di.Format", di.Format);
				di.Format = (objUrl.query["f"] === "json" || objUrl.query["f"] === "html") ? objUrl.query["f"] : "";
				// console.log("di.Format", di.Format);
				di.getDirectory(filename, function(objFiles) {
					// util.puts("filename", filename);
					if ( typeof objFiles !== "string") {
						writeEntireResponse({"filesystem": [objFiles]});
					}
					else {
						writeEntireResponse(objFiles);
					}
				});
			}
		}
		else {
			if (x2j.get("Enabled") && objUrl.query["f"] === "json" ) {
				// util.puts("Attempting to convert "+ filename +" to Json.");
				x2j.convertToJson(filename, function(json) {
					writeEntireResponse(json);
				});
			}
			else {
				serveFile(filename);
			}
		}
	}
	else {
		writeEntireResponse(404, "404 Not Found\n"+uri, {"Content-Type": "text/plain"});
	}
	return;
}).listen(parseInt(conf.Listen, 10));

// console.log(" ## Noche server running ##\n  => http://localhost:" + conf.Listen + "/\n [CTRL] + [C] to shutdown");
/* server started */  
util.puts(" ## Noche server running ####################################################\n  => http://localhost:" + conf.Listen + "/");
