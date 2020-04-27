var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var moment = require('moment');

var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/products');
var salesRouter = require('./routes/sales');
var catRouter = require('./routes/references');

var posRouter = require('./routes/pos');
var kitchenRouter = require('./routes/kitchen');

var app = express();
var sess = {
  secret : 'king',
  resave: true,
  saveUninitialized: false,
  cookies : {}
};

// Locals
app.locals.moment = moment;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'clients')));
app.use(fileUpload());
app.use(session(sess));

// Auth
app.use('/auth',authRouter);

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/products',productRouter);
app.use('/sales',salesRouter);
app.use('/references',catRouter);
app.use('/pos',posRouter);
app.use('/kitchen',kitchenRouter);

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
// S