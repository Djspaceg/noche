import compression from 'compression';
import cookieParser from 'cookie-parser';
import errorhandler from 'errorhandler';
import express, { urlencoded } from 'express';
import { createServer } from 'http';
import methodOverride from 'method-override';
import morgan from 'morgan';
import { join } from 'path';
import favicon from 'serve-favicon';
// rfs = require('rotating-file-stream'),
// import ejs from 'ejs';
import { createWriteStream } from 'fs';
// import lessMiddleware from 'less-middleware';
import { index } from './routes/index.js';
// user = require('./routes/user'),
// import { fileURLToPath } from 'url';
import serverConf from './conf/server.conf.js';
import JsonResponse from './routes/json.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

// https://www.npmjs.com/package/morgan
// // create a rotating write stream
// var accessLogStream = rfs.createStream('access.log', {
//   interval: '1d', // rotate daily
//   path: path.join(__dirname, 'log'),
// });
// create a write stream (in append mode)
var accessLogStream = createWriteStream(join('access.log'), {
  flags: 'a',
});

// __dirname = Where the server is running from.
// console.log("__dirname: ", __dirname);

// all environments
app.set('title', serverConf.ServerName || 'Noche Server');
app.set('port', process.env.PORT || parseInt(serverConf.Listen) || 8888);
// app.set('views', join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(favicon(join('public', 'images', 'favicon.ico')));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(compression());
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
// app.use(express.session());
// app.use(app.router);
// app.use(lessMiddleware(join(__dirname, 'public', 'stylesheets')));
// app.use(express.static(__dirname + '/public'));

// development only
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler());
}

// index.html keeps being requested when a folder is asked for...
// app.use(express.static(path.join(__dirname, conf.DocumentRoot)));

// app.get("*", routes.index);
// app.get("/users", user.list);
app.get('/json*', (req, res) => {
  // console.log('Converting to JSON', req.url, req.params);
  req.url = req.params[0];
  req.query.f = 'json';
  new JsonResponse(req, res);
  // routes.index(req, res);
});

// index page
// app.get('/', function (req, res) {
//   res.render('index', {
//     title: app.get('title'),
//     directoryIndex: routes.index(req, res),
//   });
// });

app.get('*', index);
// app.use(express.directory( conf.DocumentRoot ));
// app.use(express.static(conf.DocumentRoot));

app.use(express.static('public'));

createServer(app).listen(app.get('port'), () => {
  /* server started */
  console.log(
    ` ## Noche server running ## ${new Date()} ##\n  => http://localhost:${app.get(
      'port'
    )}`
  );
});
