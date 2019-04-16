var mongoose = require('mongoose');

//define the schema
var teamSchema = new mongoose.Schema({
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
var Player = module.exports = mongoose.model('player',teamSchema);

//Get Players
module.exports.getPlayers = function (callback, limit) {
    Player.find(callback).limit(limit);
};

