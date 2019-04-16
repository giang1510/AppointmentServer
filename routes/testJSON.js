var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require('express-jwt');



var obj2 = { "foo" : "bar" };
var obj = JSON.parse(fs.readFileSync('./videodata.json', 'utf8'));
/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
    res.contentType('application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(obj2);
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else{
        res.send('Username or Password incorrect!');
    }
}


module.exports = router;
