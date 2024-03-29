var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Auth0Strategy = require('passport-auth0');

var User = require('../model/userModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

//Register
router.get('/register', function(req, res, next) {
    res.render('register',{
        title: 'Register',
        errors: null
    });
});

//Login
router.get('/login', function(req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});



//Register User
router.post('/register', function(req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    console.log(req.body);

    //Validation
    // req.checkBody('name', 'Name is required').notEmpty();
    // req.checkBody('email','Email is required').notEmpty();
    // req.checkBody('email','Email is not valid').isEmail();
    // req.checkBody('username','Username is required').notEmpty();
    // req.checkBody('password','Password ist required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.render('register',{
            title: 'Register',
            errors:errors
        })
    }else{
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            is_provider: req.body.is_provider
        });

        User.createUser(newUser, function (err, user) {
            if(err) throw  err;
            console.log(user);
        });

        // req.flash('success_msg','You are registered and can now login')

        res.send('Register successful!!');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if(err) throw err;
            if(!user){
                return done(null, false, {
                    message:'Unknown User'
                });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if(err) throw  err;
                if(isMatch){
                    return done(null, user);
                } else{
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

router.get('/failure', function (req, res) {
    res.send('Failed!');
})

//Authentication
router.post('/login', function(req, res, next ){
    // console.log(req.body);
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        let response = {
            success: true,
            message: ""
        };
        if (!user) {
            response.success = false;
            response.message = info.message;
            return res.json(response);
        }

        response.message = "Login succeed!!";
        return res.json(response);
    })(req, res, next);
});
//Logout
router.get('/logout', function (req, res) {
    req.logOut();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});


module.exports = router;

