var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressValiditator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const Auth0Strategy = require('passport-auth0');
var mongo = require('mongodb');
var cors = require('cors');

//db setup
// mongoose.connect('mongodb://localhost/hockey');
mongoose.connect('mongodb://phiseoxhd:10101963@ds042527.mlab.com:42527/hockey');
var db = mongoose.connection;


//Import local JS-Files
var index = require('./routes/index');
var users = require('./routes/users');
var about = require('./routes/about');
var testJSON = require('./routes/testJSON');
var userJSON = require('./routes/userJSON');
var playersPage = require('./routes/players');
var calendarPage = require('./routes/calendar');
var search_machinePage = require('./routes/search_machine');
var provider_page = require('./routes/provider');
var survey_page = require('./routes/survey');

var app = express();

//Global variables
app.locals.points = "7,561";
app.locals.vData = require('./videodata.json');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Cross-Origin-Res-Sharing
app.use(cors());

//Express Validator
app.use(expressValiditator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
          formParam += '[' + namespace.shift() + ']';
        }
        return{
          param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Connect Flash
app.use(flash());

//Global Variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.logger = logger;
    res.locals.baseURL = req.protocol + '://' + req.get('host');
    next();
})



//Include links
app.use('/', index);
app.use('/users', users);
app.use('/about',about);
app.use('/testJSON',testJSON);
app.use('/players',playersPage);
app.use('/userJSON',userJSON);
app.use('/calendar',calendarPage);
app.use('/search_machine', search_machinePage);
app.use('/provider', provider_page);
app.use('/survey', survey_page);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
