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
	mime = require("./lib/node-mime/mime.js"),
	port = process.argv[2] || 8888;

// The base level of the server, nothing allowed below this.
// Do not end this in a "/". If you want the server's root, set this to empty-string: ""
// http.DOCUMENT_ROOT = "/Users/blake/Source";

http.createServer(function(request, response) {
	var objUrl = url.parse(request.url, true),
		uri = path.normalize(objUrl.pathname),
		filename = path.join(conf.DocumentRoot, uri);
	// process.cwd()

	// console.log("process.cwd()", process.cwd(), "request.url", request.url, "uri", uri);
	
	var writeEntireResponse = function(intStatus, strContent, objOptions) {
		if (arguments.length == 1) {
			strContent = arguments[0];
			intStatus = 200;
		}
		if (!objOptions) objOptions = {"Content-Type": conf.DefaultContentType};
		if (strContent === undefined) strContent = "";
		else if ( typeof strContent !== "string") {
			objOptions["Content-Type"] = "application/json";
			strContent = JSON.stringify({"filesystem": [strContent]});
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
		fs.readFile(filename, "binary", function(err, file) {
			if (err) {
				writeEntireResponse(500, err + "\n", {"Content-Type": "text/plain"});
				return;
			}

			writeEntireResponse(200, file, {"Content-Type": strMime});
		});
		return true;
	};

	fs.exists(filename, function(exists) {
		if (!exists) {
			writeEntireResponse(404, "404 Not Found\n"+uri, {"Content-Type": "text/plain"});
			return;
		}
		var objFileInfo = fs.statSync(filename);
		if (objFileInfo.isDirectory()) {
			filename+= "/";
			fs.exists(filename + conf.DirectoryIndex, function(indexExists) {
				if (indexExists) {
					// filename += "/" + conf.DirectoryIndex;
					serveFile(filename + conf.DirectoryIndex);
				}
				else {
					// console.log("di.Format", di.Format);
					di.Format = (objUrl.query["f"] === "json" || objUrl.query["f"] === "html") ? objUrl.query["f"] : "";
					// console.log("di.Format", di.Format);
					var directoryIndex = di.getDirectory(filename, function(objFiles) {
						// console.log("filename", filename, "directoryIndex", objFiles);
						writeEntireResponse(objFiles);
					});
				}
			})
		}
		else {
			serveFile(filename);
		}
	});
}).listen(parseInt(conf.Listen, 10));

// console.log(" ## Noche server running ##\n  => http://localhost:" + conf.Listen + "/\n [CTRL] + [C] to shutdown");
/* server started */  
util.puts(" ## Noche server running ####################################################\n  => http://localhost:" + conf.Listen + "/");
