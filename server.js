#!/usr/bin/env node
//
// Based on rpflorence's Gist @ https://gist.github.com/rpflorence/701407
//

var express = require("express"),
	routes = require("./routes"),
	json = require("./routes/json"),
	user = require("./routes/user"),
	util = require("util"),
	http = require("http"),
	path = require("path"),
	conf = require("./conf/server.conf.js");

var app = express();

// __dirname = Where the server is running from.
// console.log("__dirname: ", __dirname);

// all environments
app.set("title", conf.ServerName || "Noche Server");
app.set("port", process.env.PORT || parseInt(conf.Listen, 10) || 8888);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.favicon(__dirname + "/public/images/favicon.ico"));
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
	// console.log("process.env",process.env);
}

/// index.html keeps being requested when a folder is asked for...
// app.use(express.static(path.join(__dirname, conf.DocumentRoot)));

// app.get("*", routes.index);
// app.get("/users", user.list);
app.get("/json*", function(req, res){
	// console.log("Converting to JSON",req.url);
	req.url = req.param(0);
	req.query.f = "json";
	json.index(req, res);
	// routes.index(req, res);
});

app.get("*", routes.index);
// app.use(express.directory( conf.DocumentRoot ));
// app.use(express.static(conf.DocumentRoot));

// app.use(express.static('public'))

http.createServer(app).listen(app.get("port"), function() {
	/* server started */
	util.puts(" ## Noche server running ## \n  => http://localhost:" + conf.Listen + "/");
});
