#!/usr/bin/env node
// 
// Based on rpflorence's Gist @ https://gist.github.com/rpflorence/701407
// 

var express = require("express"),
	routes = require("./routes"),
	user = require("./routes/user"),
	util = require("util"),
	http = require("http"),
	// url  = require("url"),
	path = require("path"),
	// fs   = require("fs"),
	conf = require("./conf/server.conf.js");
	// di   = require("./extensions/directory-indexing.js"),
	// x2j  = require("./extensions/xml2json.js"),
	// mime = require("mime");

var app = express();

// all environments
app.set("title", conf.ServerName || "Noche Server");
app.set("port", process.env.PORT || parseInt(conf.Listen, 10) || 8888);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser("your secret here"));
app.use(express.session());
app.use(app.router);
app.use(require("less-middleware")({ src: path.join(__dirname, conf.DocumentRoot) }));

// development only
if ("development" == app.get("env")) {
	app.use(express.errorHandler());
}

// app.get("/", routes.index);
app.get("/users", user.list);
app.get("/json*", function(req, res){
	// var url = req.params[0];
	console.log("req",req);
	req.url = req.param(0);
	req.query.f = "json";
	routes.index(req, res);
});
app.get("*", function(req, res){
	// var file = req.params.file;
	var file = req.param(0);
	console.log("file: ", conf.DocumentRoot + file);
	res.sendfile(conf.DocumentRoot + file);
	// req.user.mayViewFilesFrom(uid, function(yes) {
		// if (yes) {
		// }
		// else {
			// res.send(403, 'Sorry! But no, you cant see that.');
		// }
	// });
});
// app.get('/user:id', function() { console.log("user ACTUALLY ran...") }, function(){
	// console.log("Oh fuck you man...");
// });
// app.get('/company/:id*', function(req, res, next) {
//     res.json({
//         id: req.param('id'),
//         path: req.param(0)
//     });    
// });
// app.get('/companies*', function(req, res, next) {
//     res.json({
//         // id: req.param('id'),
//         path: req.param(0)
//     });    
// });

app.use(express.directory( conf.DocumentRoot ));
// app.use(express.static(path.join(__dirname, conf.DocumentRoot)));

// app.use(express.static('public'))

http.createServer(app).listen(app.get("port"), function() {
	/* server started */  
	util.puts(" ## Noche server running ## \n  => http://localhost:" + conf.Listen + "/");
});
