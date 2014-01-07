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
		parser.parseString(data);
	});
	return true;
};
