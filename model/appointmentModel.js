var mongoose = require('mongoose');

//define the schema
var appointmentSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: String,
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    provider_id: {
        type: String,
        required: true
    },
    provider_name: {
        type: String,
        required:true
    }
});

//create the model
var Appointment = module.exports = mongoose.model('appointment',appointmentSchema);

//Get Players
module.exports.getAppointments = function (callback, limit) {
    Appointment.find(callback).limit(limit);
};

module.exports.getAppointmentById = function (id, callback) {
    Appointment.findById(id, callback);
};

//Add Player
module.exports.addEvent = function (appointment,callback) {
    Appointment.create(appointment,callback);
};