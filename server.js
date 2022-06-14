#!/usr/bin/env node
'use strict';
//
// Based on rpflorence's Gist @ https://gist.github.com/rpflorence/701407
//

const http = require('http'),
  path = require('path'),
  express = require('express'),
  methodOverride = require('method-override'),
  favicon = require('serve-favicon'),
  morgan = require('morgan'),
  compression = require('compression'),
  cookieParser = require('cookie-parser'),
  errorhandler = require('errorhandler'),
  ejs = require('ejs'),
  fs = require('fs'),
  lessMiddleware = require('less-middleware'),
  // rfs = require('rotating-file-stream'),
  routes = require('./routes'),
  json = require('./routes/json'),
  // user = require('./routes/user'),
  conf = require('./conf/server.conf.js');

const app = express();

// https://www.npmjs.com/package/morgan
// // create a rotating write stream
// var accessLogStream = rfs.createStream('access.log', {
//   interval: '1d', // rotate daily
//   path: path.join(__dirname, 'log'),
// });
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});

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
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
// app.use(express.session());
// app.use(app.router);
app.use(lessMiddleware(path.join(__dirname, 'public', 'stylesheets')));
app.use(express.static(__dirname + '/public'));

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler());
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

// index page
// app.get('/', function (req, res) {
//   res.render('index', {
//     title: app.get('title'),
//     directoryIndex: routes.index(req, res),
//   });
// });

app.get('*', routes.index);
// app.use(express.directory( conf.DocumentRoot ));
// app.use(express.static(conf.DocumentRoot));

// app.use(express.static('public'))

http.createServer(app).listen(app.get('port'), () => {
  /* server started */
  console.log(
    ` ## Noche server running ## ${new Date()} ##\n  => http://localhost:${
      conf.Listen
    }`
  );
});
