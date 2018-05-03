#!/usr/bin/env node

//
// Consider using this instead of Apache:
// `twistd -n web -p 8888 --path .`
//

// / From:
// / https://github.com/Leonidas-from-XIV/node-xml2js#options
// /

const fs = require('fs'),
	xml2js = require('xml2js'),
	conf = require('../conf/xml2json.conf.js');

exports.get = function(strProp) {
	return exports[strProp] || conf[strProp];
};

exports.convertToJson = function(path, funSuccess) {
	const parser = new xml2js.Parser(conf.Options);

	parser.on('end', result => {
		// eyes.inspect(result);
		if (funSuccess) {
			funSuccess(result);
		}
	});

	fs.readFile(path, (err, data) => {
		if (!err && data) {
			if (data.asciiSlice(0, 1) === '<') {
				// console.log("Converting '"+ path +"'.");
				parser.parseString(data);
			} else {
				console.log("Converting '" + path + "' but it does not appear to be XML.");
				funSuccess({error: "Converting '" + path + "' but it does not appear to be XML."}, 406);
			}
		} else {
			console.log("Error loading '" + path + "': " + err);
			funSuccess({error: "Error loading '" + path + "': " + err}, 400);
		}
	});
	return true;
};
