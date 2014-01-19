#!/usr/bin/env node

// 
// Consider using this instead of Apache:
// `twistd -n web -p 8888 --path .`
// 

/// From:
/// https://github.com/Leonidas-from-XIV/node-xml2js#options
///

var fs = require("fs"),
	conf = require("../conf/xml2json.conf.js"),
	util = require("util"),
	xml2js = require("xml2js");

exports.get = function(strProp) {
	return exports[strProp] || conf[strProp];
};

exports.convertToJson = function(path, funSuccess) {
	var parser = new xml2js.Parser(conf.Options);

	parser.on('end', function(result) {
		// eyes.inspect(result);
		if (funSuccess) {
			funSuccess(result);
		}
	});

	fs.readFile(path, function(err, data) {
		if (!err && data) {
			if (data.asciiSlice(0,1) === "<") {
				parser.parseString(data);
			}
			else {
				util.puts("Converting '"+ path +"' but it does not appear to be XML.");
			}
		}
		else {
			util.puts("Error loading '"+ path +"': "+ err);
		}
	});
	return true;
};
