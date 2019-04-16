var express = require('express');
var router = express.Router();

var User = require('../model/userModel');

/* GET results page. */
router.get('/', function (req, res) {
    if(req.query.search){
        User.getProviderByText(req.query.search, function (err, users) {
            if(err){
                throw err;
            }
            // res.json(users);
            res.render('search_machine',{
                search_text: req.query.search,
                users: users
            })
        });
    }else {
        res.send('U typed nothing!!');
    }
});

//Send search results to mobile app
router.post('/JSON', function (req, res) {
    if(req.body.search_text){
        User.getProviderByText(req.body.search_text, function (err, users) {
            if(err){
                throw err;
            }
            var provider_infos = [];
            users.forEach(function (user, index) {
                // var result = {
                //     provider_id: user._id,
                //     provider_info: user.provider_info
                // };
                provider_infos.push({
                    provider_info: user.provider_info,
                    provider_id: user._id
                });
            });
            console.log(provider_infos);
            res.json({
                search_text: req.body.search_text,
                provider_infos: provider_infos
            });
        });
    }
})

router.post('/', function (req, res) {
    if(req.body.data){
        console.log(req.body.data);
        res.json({ redirect:"/"});
        // res.end();
    }else{
        res.json({ redirect:"/"});
        // res.end();
    }
});


module.exports = router;