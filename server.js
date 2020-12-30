#!/usr/bin/env node
'use strict';
//
// Based on rpflorence's Gist @ https://gist.github.com/rpflorence/701407
//

const http = require('http'),
	path = require('path'),
	express = require('express'),
	methodOverride = require('method-override'),
	routes = require('./routes'),
	json = require('./routes/json'),
	// user = require('./routes/user'),
	conf = require('./conf/server.conf.js');

const app = express();

// __dirname = Where the server is running from.
// console.log("__dirname: ", __dirname);

// all environments
app.set('title', conf.ServerName || 'Noche Server');
app.set('port', process.env.PORT || parseInt(conf.Listen) || 8888);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(methodOverride());
app.use(express.cookieParser('your secret here'));
// app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({src: path.join(__dirname, conf.DocumentRoot)}));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
	// console.log("process.env",process.env);
}

// index.html keeps being requested when a folder is asked for...
// app.use(express.static(path.join(__dirname, conf.DocumentRoot)));

// app.get("*", routes.index);
// app.get("/users", user.list);
app.get('/json*', (req, res) => {
	// console.log("Converting to JSON",req.url);
	req.url = req.param(0);
	req.query.f = 'json';
	json.index(req, res);
	// routes.index(req, res);
});

app.get('*', routes.index);
// app.use(express.directory( conf.DocumentRoot ));
// app.use(express.static(conf.DocumentRoot));

// app.use(express.static('public'))

http.createServer(app).listen(app.get('port'), () => {
	/* server started */
	console.log(` ## Noche server running ## ${new Date()} ##\n  => http://localhost:${conf.Listen}`);
});
