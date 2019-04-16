var express = require('express');
var router = express.Router();

var User = require('../model/userModel');
var Auth = require('../utility/authentication');
var Mail = require('../utility/node_email');
var ICS_Parser = require('../utility/ics_parser');

router.get('/admin', Auth.ensureAuthenticated, function (req, res) {

    User.getUserById(req.user._id, function (err, user) {
        if (err) {
            res.send(err);
        }
        if (user.is_provider) {
            res.render('provider_admin', {
                title: 'Provider Admin',
                provider_appointments: user.provider_appointments,
                provider_info: user.provider_info
            });
        } else {
            res.send('Your account does not support this feature!');
        }

    })
});

router.get('/download', function (req, res) {
    ICS_Parser.createAppICSFile(function (content) {
        res.setHeader('Content-disposition', 'attachment; filename=icsFile.ics');
        res.setHeader('Content-type', 'text/calendar');
        res.charset = 'UTF-8';
        res.write(content);
        res.end();
    });
});

router.get('/:_id', function (req, res, next) {
    User.getUserById(req.params._id, function (err, user) {
        if (err) {
            res.send(err);
        }
        if (user) {
            res.render('provider_public', {
                provider_appointments: user.provider_appointments,
                provider_info: user.provider_info
            });
        } else {
            next();
        }

    })
});

router.get('/JSON/:_id', function (req, res, next) {
    User.getUserById(req.params._id, function (err, user) {
        if (err) {
            res.send(err);
        }
        if (user) {
            res.json({
                provider_appointments: user.provider_appointments,
                provider_info: user.provider_info
            });
        } else {
            next();
        }

    })
});

router.post('/JSON/public/:_id', function (req, res) {
    var app_data = req.body;
    console.log(app_data);
    User.addAppToProvider(req.params._id, app_data, function (err, provider) {
        if (err) throw err;
        console.log(provider);
        var prov_apps = provider.provider_appointments;
        var new_app = prov_apps[prov_apps.length - 1];
        if (err) res.send(err);

        ICS_Parser.createAppICSFile(app_data, provider.provider_info, function (content) {
            var url = res.locals.baseURL + '/provider/' + req.params._id + '/appointment/' + new_app._id;
            var mailOptions = {
                from: 'richardmuster101@gmail.com',
                to: app_data.user_info.user_email,
                subject: 'Access to appointment ' + app_data.appointment_name,
                text: 'Click this link to cancel appointment: \n' + url,
                attachments: [{
                    filename: 'Appointment.ics',
                    content: content,
                    contentType: 'text/calendar'
                }]
            };
            Mail.sendMail(req, res, mailOptions, function (msg_type) {
                if (msg_type == 'error_msg') {
                    console.log('Send mail to user failed!');
                }
            });
        });

        res.send("Succesful");
    });
});


router.post('/public/:_id', function (req, res) {
    var app_data = req.body.data;
    console.log(app_data);
    User.addAppToProvider(req.params._id, app_data, function (err, provider) {
        if (err) throw err;
        console.log(provider);
        var prov_apps = provider.provider_appointments;
        var new_app = prov_apps[prov_apps.length - 1];
        if (err) res.send(err);
        if (req.user) {
            var user_app_data = {
                provider_name: provider.provider_info.provider_name,
                provider_id: provider._id,
                start_date: app_data.start_date,
                end_date: app_data.end_date,
                appointment_name: app_data.appointment_name,
                appointment_id: new_app._id
            };
            User.addAppToUser(req.user._id, user_app_data, function (err) {
                if (err) res.send(err);
            });
        } else {
            ICS_Parser.createAppICSFile(app_data, provider.provider_info, function (content) {
                var url = res.locals.baseURL + '/provider/' + req.params._id + '/appointment/' + new_app._id;
                var mailOptions = {
                    from: 'richardmuster101@gmail.com',
                    to: app_data.user_info.user_email,
                    subject: 'Access to appointment ' + app_data.appointment_name,
                    text: 'Click this link to cancel appointment: \n' + url,
                    attachments: [{
                        filename: 'Appointment.ics',
                        content: content,
                        contentType: 'text/calendar'
                    }]
                };
                Mail.sendMail(req, res, mailOptions, function (msg_type) {
                    if (msg_type == 'error_msg') {
                        console.log('Send mail to user failed!');
                    }
                });
            });

        }
        res.json({redirect: "/"});
    })
});

router.get('/:provider_id/appointment/:_id', function (req, res) {
    res.render('reservation_cancel', {
        title: "Reservation's cancel"
    });
});

//Cancelling appointment
router.post('/:provider_id/appointment/:_id', function (req, res) {
    if (req.params._id) {
        User.deleteAppFromProvider(req.params._id, req.params.provider_id, function (err) {
            if (err) res.send(err);

            if (req.user) {
                if (req.body.data) {
                    var data = req.body.data;
                    User.deleteAppFromUser(data.ele_id, req.user._id, function (err) {
                        if (err) throw err;
                        req.flash('success_msg', 'Cancelling appointment successfully!');
                        res.json({
                            redirect: "/users/profile"
                        });
                    });
                }

            } else {
                res.redirect('/');
            }

        })
    }
});

//Delete app from provider
router.post('/admin/delete', Auth.ensureAuthenticated, function (req, res) {
    //TODO
    if (req.user && req.body.data) {
        var time_ids = req.body.data.time_ids;
        if (time_ids.length > 0) {
            User.deleteAppsFromProvider(time_ids, req.user._id, function (err) {
                if (err) req.flash("error_msg", "Undefined error!");
                res.json({
                    redirect: 'provider/admin'
                });
            })
        } else {
            req.flash("error_msg", "You didn't choose any entry.");
            res.json({
                redirect: 'provider/admin'
            });
        }

    }
});

//Edit entry page
router.get('/admin/entry_edit/:_id', Auth.ensureAuthenticated, function (req, res) {
    if (req.params._id) {
        res.render('provider_entry_edit', {
            title: 'Edit appointment',
            is_new: false,
            date: new Date(),
            _id: req.params._id
        });
    }
});

router.get('/admin/entry_edit/date/:date', Auth.ensureAuthenticated, function (req, res) {
    if (req.params.date) {
        res.render('provider_entry_edit', {
            date: req.params.date,
            title: 'Add new appointment',
            is_new: true,
            _id: ''
        });
    } else {
        res.send('Something went wrong!');
    }

});

router.post('/admin/entry_edit', Auth.ensureAuthenticated, function (req, res) {
    if (req.body.data && req.user) {
        var app_data = req.body.data;
        User.addAppToProvider(req.user._id, app_data, function (err) {
            if (err) throw err;
            res.json({
                written: true
            });
        });
    }

});

router.post('/admin/entry_edit/:_id', Auth.ensureAuthenticated, function (req, res) {
    if (req.params._id && req.body.data) {
        User.updateAppFromProvider(req.params._id, req.body.data, function (err) {
            if (err) throw err;
            res.json({
                written: true
            });
        });
    }
});


module.exports = router;