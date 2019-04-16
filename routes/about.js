var express = require('express');
var router = express.Router();
var videodata = require('../videodata.json');

/* GET about page. */
router.get('/', ensureAuthenticated,function(req, res, next) {
    res.render('about', {
        title: 'Info' ,
        videodata: videodata
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