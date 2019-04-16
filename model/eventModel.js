var mongoose = require('mongoose');

//define the schema
var eventSchema = new mongoose.Schema({
    text: String,
    start_date: Date,
    end_date: Date,
    color: String,
    id: String
});

//create the model
var Event = module.exports = mongoose.model('event',eventSchema);

//Get Players
module.exports.getEvents = function (callback, limit) {
    Event.find(callback).limit(limit);
};

module.exports.getEventsSorted = function (callback, limit) {
    Event.find(callback);
};

module.exports.getEventById = function (id, callback) {
    Event.findById(id, callback);
};

//Add Player
module.exports.addEvent = function (event,callback) {
    Event.create(event,callback);
};