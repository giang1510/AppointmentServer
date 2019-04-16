var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../model/userModel');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//Register
router.get('/register', function (req, res, next) {
    res.render('register', {
        title: 'Register',
        errors: null
    });
});

//Login
router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});

//Register User
router.post('/register', function (req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var user_type = req.body.user_type;
    var is_provider = false;
    if (user_type == 0) {
        is_provider = true;
    }

    //Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password ist required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    if (is_provider) {
        var provider_name = req.body.provider_name;
        var provider_email = req.body.provider_email;
        var provider_address = req.body.provider_address;
        var provider_phone_number = req.body.provider_phone_number;
        req.checkBody('provider_name', "Provider's name is required").notEmpty();
        req.checkBody('provider_email', "Provider's email is required").notEmpty();
        req.checkBody('provider_address', "Provider's address is required").notEmpty();
        req.checkBody('provider_phone_number', "Provider's phone number is required").notEmpty();
    }

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            title: 'Register',
            errors: errors
        })
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            is_provider: is_provider,
            provider_info: {
                provider_name: provider_name,
                provider_email: provider_email,
                provider_address: provider_address,
                provider_phone_number: provider_phone_number,
                slot_range_in_min: 30,
                days_till_next_pos_app: 1,
                pos_app_range_in_days: 90,
                start_work_time: 8,
                end_work_time: 17
            },
            provider_appointments: [],
            groups: []
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw  err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login')

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw  err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });


    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

//Authentication
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/profile/' );
    });

//Logout
router.get('/logout', function (req, res) {
    req.logOut();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

//User's profile site
router.get('/profile',ensureAuthenticated, function (req, res) {
    res.render('user_profile',{
        user_info: req.user
    });
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else{
        req.flash('error_msg','You are not logged in')
        res.redirect('/users/login');
    }
}

module.exports = router;
