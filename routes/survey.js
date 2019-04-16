var express = require('express');
var router = express.Router();

var User = require('../model/userModel');
var Survey = require('../model/surveyModel');
var Auth = require('../utility/authentication');
var Mail = require('../utility/node_email');

router.get('/create', function (req, res) {
    res.render('survey_create');
});

router.get('/:_id', function (req, res) {
    Survey.getSurveyById(req.params._id, function (err, survey) {
        if (err) throw err;
        if(!survey) res.send('Survey not found!');
        res.render('survey', {
            survey: survey,
            title: 'survey'
        });
    });
});

router.post('/create', function (req, res) {
    var data = req.body.data;
    var new_survey = new Survey({
        title: data.title,
        recurred: data.recurred,
        recur_start: data.recur_start,
        recur_end: data.recur_end,
        note: data.note,
        location: data.location,
        admin: data.admin,
        times: data.times,
        participants: [],
        final_options:[]
    });
    var admin = data.admin;

    Survey.addSurvey(new_survey, function (err, survey) {
        if (err) throw err;
        var url = "/survey/" + survey._id;
        url = res.locals.baseURL + url;
        var mailOptions = {
            from: 'richardmuster101@gmail.com',
            to: admin.email,
            subject: 'Access to survey ' + data.title,
            text: 'Click this link to access survey: \n' + url
        };

        //Send link to user
        Mail.sendMail(req, res, mailOptions, function (msg_type) {
            if (msg_type == 'error_msg') {
                console.log('Send mail to admin failed!');
            }
        });

        //Add survey to registered user
        if(req.user){
            var surv_info = {
                survey_name: survey.title,
                survey_id: survey._id
            };
            User.addSurveyToUser(req.user._id, surv_info, function (err) {
                if(err) throw err;
                res.json({redirect: url});
            })
        }else {
            res.json({redirect: url});
        }


    });

});

router.post('/:_id', function (req, res) {
    var answer_data = req.body.data;
    var participant = {
        user_name: answer_data.user_name,
        answers: answer_data.time_ids,
        priority: 'normal'
    };
    var survey_id = req.params._id;
    Survey.addParticipant(survey_id, participant, function (err) {
        if (err) throw err;
        res.json({redirect: "/survey/" + survey_id});
    })
});

router.post('/send_email/:_id', function (req, res, next) {
    var send_data = req.body.data;
    var participants = send_data.participants_data;
    var group = send_data.group_data;
    var emails = [];
    participants.forEach(function (pa) {
        emails.push(pa.email);
    });
    var url = send_data.url;
    var admin = send_data.admin;
    var survey_id = req.params._id;
    console.log(emails);
    var mail_opt_arr = [];
    emails.forEach(function (email) {
        var spec_url = url+'/'+email;
        mail_opt_arr.push({
            from: 'richardmuster101@gmail.com',
            to: email,
            subject: ' survey invitation(' + admin.email + ')',
            text: 'Click this link to join: \n' + spec_url
        });
    });

    console.log('after mailoptions');
    if (emails.length > 0) {

        Mail.sendMails(req, res, mail_opt_arr, function (msg_type) {
            if (msg_type == 'error_msg') {
                res.json({
                    message: {
                        msg_type: msg_type,
                        text: 'Not all mails could be sent!'
                    }
                });
            } else {
                Survey.addInvitedParticipants(survey_id, participants, function () {
                    res.json({
                        // redirect:"/survey/"+req.params._id
                        message: {
                            msg_type: msg_type,
                            text: 'Sending invitation succeeded!'
                        }
                    });
                });
                if(req.user){
                    User.addGroupToUser(req.user.id, group, function (err) {
                        if(err) throw err;
                    });
                }


            }
        });
        console.log('after sending mail!');


        console.log('done');
    }

});

router.post('/set_final_options/:_id', function (req, res) {
    if(req.params._id && req.body.data){
        Survey.setFinalOptions(req.params._id, req.body.data.final_options, function (err) {
           if(err){
               throw err;
           }else{
               res.json({
                   redirect:'/survey/'+req.params._id
               });
           }

        });

    }
});

router.get('/:_id/:email', function (req, res) {
    if(req.params._id && req.params.email){
        Survey.getSurveyById(req.params._id, function (err, survey) {
            if (err) throw err;
            if(!survey) res.send('Survey not found!');
            res.render('survey', {
                survey: survey,
                title: 'survey',
                email: req.params.email
            });
        });
    }

});

router.post('/:_id/:email', function (req, res) {
    console.log('post the right one');
    if(req.body.data && req.params._id && req.params.email){
        Survey.getSurveyById(req.params._id, function (err, survey) {
            if (err) throw err;
            if(!survey) res.send('Survey not found!');
            var answer_data = req.body.data;
            var priority = 'normal';
            survey.invited_participants.forEach(function (par) {
               if(par.email == req.params.email) {
                   priority = par.priority;
               }
            });
            var participant = {
                user_name: answer_data.user_name,
                answers: answer_data.time_ids,
                priority: priority
            };
            var survey_id = req.params._id;
            Survey.addParticipant(survey_id, participant, function (err) {
                if (err) throw err;
                res.json({redirect: "/survey/" + survey_id});
            });
        });
    }
});

module.exports = router;