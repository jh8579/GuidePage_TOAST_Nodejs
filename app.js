var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');

// router settings
var indexRouter = require('./routes/index');
var guideRouter = require('./routes/guide');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(methodOverride('_method'));

const winston = require('winston');
const fs = require('fs');
const logDir = './log'; 
if (!fs.existsSync(logDir)) {
   fs.mkdirSync(logDir); 
} 
const tsFormat = () => (new Date()).toLocaleTimeString(); 
const logger1 = winston.createLogger({
   transports: [
      new (winston.transports.Console)({ timestamp: tsFormat, level: 'info' }),
      new (winston.transports.File)({
         level: 'info', 
         filename: `${logDir}/logs.log`, 
         timestamp: tsFormat, maxsize:1000000, 
         maxFiles:5 
        }
        ) 
      ] 
});

logger1.stream = {
  write: function(message, encoding){
      logger1.info(message);
  }
};

app.use(require("morgan")("combined", { "stream": logger1.stream }));

app.use('/', indexRouter);
app.use('/guide', guideRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
