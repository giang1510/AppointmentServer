var mongoose = require('mongoose');

//define the schema
var surveySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    recurred: Boolean,
    recur_start: Date,
    recur_end: Date,
    note: String,
    location: String,
    admin: {
        name: String,
        email: {
            type: String,
            required: true
        }
    },
    participants:[{
        user_id: String,
        user_name: String,
        priority: String,
        answers: [String]
    }],
    invited_participants:[{
        email: String,
        priority: String
    }],
    times:[{
        start_time: Date,
        end_time: Date,
        day_index: Number,
        all_day: Boolean,
        answers: [String]
    }],
    final_options:[String]
});

//create the model
var Survey = module.exports = mongoose.model('survey',surveySchema);

module.exports.getSurveys = function (callback, limit) {
    Survey.find(callback).limit(limit);
};

module.exports.getSurveyById = function (id, callback) {
    Survey.findById(id, callback);
};

module.exports.addSurvey = function (survey,callback) {
    Survey.create(survey,callback);
};

module.exports.addParticipant = function (id, pa, callback) {
    Survey.findById(id, function (err, survey) {
        if(err) throw err;
        if(survey){
            survey.participants.push(pa);
            survey.save(callback);
        }
    });
};

module.exports.addInvitedParticipants = function (id, participants, callback) {
    Survey.findById(id, function (err, survey) {
        if(err) throw err;
        if(survey){
            participants.forEach(function (pa) {
                survey.invited_participants.push(pa);
            });
            survey.save(callback);
        }
    });
};

module.exports.setFinalOptions = function (id, final_options, callback) {
    Survey.findById(id, function (err, survey) {
        if(err) throw err;
        if(survey){
            survey.final_options = final_options;
            survey.save(callback);
        }
    });
};

