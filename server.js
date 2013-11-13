#!/usr/bin/env node
// 
// Based on rpflorence's Gist @ https://gist.github.com/rpflorence/701407
// 

var http = require("http"),
	url  = require("url"),
	path = require("path"),
	fs   = require("fs"),
	conf = require("./conf/server.conf.js"),
	di   = require("./extensions/directory-index.js"),
	port = process.argv[2] || 8888;

// The base level of the server, nothing allowed below this.
// Do not end this in a "/". If you want the server's root, set this to empty-string: ""
// http.DOCUMENT_ROOT = "/Users/blake/Source";

http.createServer(function(request, response) {

	var uri = url.parse(request.url).pathname,
		filename = path.join(conf.DOCUMENT_ROOT, uri);
	// process.cwd()

	// console.log("process.cwd()", process.cwd(), "request.url", request.url, "uri", uri);
	
	var writeEntireResponse = function(intStatus, strContent, objOptions) {
		if (arguments.length == 1) {
			strContent = arguments[0];
			intStatus = 200;
		}
		if (!objOptions) objOptions = {"Content-Type": "text/html"};
		if (strContent === undefined) strContent = "";
		else if (!(strContent instanceof String)) {
			objOptions["Content-Type"] = "application/json";
			strContent = JSON.stringify(strContent);
		}
		response.writeHead(intStatus, objOptions);
		response.write(strContent, "binary");
		response.end();		
	};

	fs.exists(filename, function(exists) {
		if (!exists) {
			writeEntireResponse(404, "404 Not Found\n", {"Content-Type": "text/plain"})
			return;
		}

		if (fs.statSync(filename).isDirectory()) {
			fs.exists(filename + '/index.html', function(indexExists) {
				if (indexExists) {
					filename += '/index.html';
				}
				else {
					var directoryIndex = di.getDirectory(filename, function(arrFiles) {
						// console.log("filename", filename, "directoryIndex", arrFiles);
						var strDocRootRxRdy = conf.DOCUMENT_ROOT.replace(/\//, "\/");
						var re = new RegExp("^"+strDocRootRxRdy);
						arrFiles = arrFiles.map(function (file) {
							file.path = file.path.replace(re, "");
							// file.path = file.path.replace("/^" + conf.DOCUMENT_ROOT + "/", "");
							console.log("file.path", file.path);
							return file;
						});
						writeEntireResponse(arrFiles);						
					});
				}
			})
		}

		fs.readFile(filename, "binary", function(err, file) {
			if (err) {        
				writeEntireResponse(500, err + "\n", {"Content-Type": "text/plain"})
				return;
			}

			writeEntireResponse(file);
		});
	});
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
