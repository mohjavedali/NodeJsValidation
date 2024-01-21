var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Joi = require("joi");
const AppError = require("./AppError");
const { INVALID_SUBSCRIPTION } = require("./constants/errorCodes");
const errorHandler = require("./middleware/errorHandler");
const { tryCatch } = require("./utils/tryCatch");
var app = express();
app.use(errorHandler);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const getUser = () => undefined;
const getSubscription = () => undefined;

app.get("/test", tryCatch(async (req, res) => {
  const user = getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return res.status(200).json({ success: true });
})
);

const schema = Joi.object({
  userId: Joi.number().required(),
});

app.post("/login", tryCatch(async (req, res) => {
  const { error, value } = schema.validate({});
  if (error) throw error;
  const subscription = getSubscription();
  if (!subscription) {
    throw new AppError(INVALID_SUBSCRIPTION, "Subscription not found", 400);
  }
})
);


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
