var express = require('express');
var router = express.Router();



Player = require('../model/playerModel');

/* GET players page. */
router.get('/', function(req, res, next) {
    Player.getPlayers(function (err, players) {
        if(err){
            throw err;
        }
        res.json(players);
    })
});

/* GET players specific page. */
router.get('/:age', function(req, res, next) {
    Player.getPlayersByName(req.param('age'),function (err, players) {
        if(err){
            throw err;
        }
        res.json(players);
    })
});

router.post('/', function(req, res, next) {
    var player = req.body;
    Player.addPlayer(player, function (err, player) {
        if(err){
            throw err;
        }
        res.json(player);
    })
});

router.put('/:_id', function(req, res, next) {
    var id = req.params._id;
    var player = req.body;
    Player.updatePlayer(id, player, {}, function (err, player) {
        if(err){
            throw err;
        }
        res.json(player);
    })
});

router.delete('/:_id', function(req, res, next) {
    var id = req.params._id;
    Player.deletePlayer(id, function(err, player) {
        if(err){
            throw err;
        }
        res.json(player);
    });
});


module.exports = router;