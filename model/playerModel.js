var mongoose = require('mongoose');

//define the schema
var playerSchema = new mongoose.Schema({
    position: String,
    id: Number,
    weight: Number,
    height: String,
    imageUrl: String,
    birthplace: String,
    age: Number,
    name: String,
    number: Number
});

//create the model
var Player = module.exports = mongoose.model('player',playerSchema);

//Get Players
module.exports.getPlayers = function (callback, limit) {
    Player.find(callback).limit(limit);
};

module.exports.getPlayersByName = function (age, callback) {
    Player.find({age : age},callback);
};

//Add Player
module.exports.addPlayer = function (player,callback) {
    Player.create(player,callback);
};

//Update Player
module.exports.updatePlayer = function (id, player, options,callback) {
    var query = {_id: id};
    var update = {
        position: player.position
    }
    Player.findOneAndUpdate(query,update,options,callback);
};

//Delete Player
module.exports.deletePlayer = function (id,callback) {
    var query = {_id: id};
    Player.remove(query,callback);
};