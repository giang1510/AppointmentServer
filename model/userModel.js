var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var ProviderAppSchema = mongoose.Schema({
    appointment_name: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    color: String,
    notification: String,
    user_info: {
        user_name: String,
        user_phone_number: String,
        user_email: String
    },
    answers: {}
});

var UserSchema = mongoose.Schema({
    username:{
        type: String,
        index: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    name:{
        type:String,
        required: true
    },
    is_provider: {
        type: Boolean,
        required: true
    },
    surveys: [{
        //not sure, if object reference would work
        survey_id: String,
        survey_name: String
    }],
    my_appointments: [{
        appointment_id: String,
        appointment_name: String,
        provider_name: String,
        provider_id: String,
        start_date: {
            type: Date,
            required: true
        },
        end_date: {
            type: Date,
            required: true
        }
    }],
    provider_info: {
        provider_name: String,
        provider_address: String,
        provider_email: String,
        provider_phone_number: String,
        slot_range_in_min: Number,
        days_till_next_pos_app: Number,
        pos_app_range_in_days: Number,
        start_work_time: Number,
        end_work_time: Number
    },
    provider_appointments: [ProviderAppSchema],
    groups:[{
        name: String,
        adresses: [String]
    }]
});


var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (error,hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.getUserByText = function (text, callback) {
    const regex = new RegExp(escapeRegex(text), 'gi');
    User.find({username: regex}, callback);
};

module.exports.getProviderByText = function (text, callback) {
    const regex = new RegExp(escapeRegex(text), 'gi');
    User.find({username: regex, is_provider:true}, callback);
};

module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if(err) throw  err;
        callback(null, isMatch);
    });
};

module.exports.addAppToProvider = function (id, app, callback) {
    User.findById(id, function (err, provider) {
        if(err) throw err;
        if(provider){
            console.log(app);
            provider.provider_appointments.push(app);
            provider.save(callback);
        }
    });
};

module.exports.addAppToUser = function (id, app, callback) {
    User.findById(id, function (err, user) {
        if(err) throw err;
        if(user){
            user.my_appointments.push(app);
            user.save(callback);
        }
    });
};

module.exports.addGroupToUser = function (id, group, callback) {
  User.findById(id, function (err, user) {
      if(err) throw err;
      if(user){
          user.groups.push(group);
          user.save(callback);
      }
  })
};

module.exports.addSurveyToUser = function (id, surv_info, callback) {
    User.findById(id, function (err, user) {
        if(err) throw err;
        if(user){
            user.surveys.push(surv_info);
            console.log(user.surveys[0]);
            user.save(callback);
        }
    });
};

module.exports.updateAppFromProvider = function (id, app, callback) {
    User.update({'provider_appointments._id': id}, {'$set': {
        'provider_appointments.$.appointment_name': app.appointment_name,
        'provider_appointments.$.notification': app.notification,
        'provider_appointments.$.user_info': app.user_info
    }},callback);
};

module.exports.deleteAppFromProvider = function (id, provider_id, callback) {
    User.update({_id: provider_id}, { $pull: {provider_appointments: {_id:id} } }, callback);
};
module.exports.deleteAppsFromProvider = function (time_ids, provider_id, callback) {
    User.update({_id: provider_id}, { $pull: {provider_appointments: {_id:{$in: time_ids}} } }, callback);
};

module.exports.deleteAppFromUser = function (id, user_id, callback) {
    User.update({_id: user_id}, { $pull: {my_appointments: {_id:id} } }, callback);
};

