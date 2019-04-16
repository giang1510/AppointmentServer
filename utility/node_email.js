var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'richardmuster101@gmail.com',
        pass: '10101963'
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports.sendMail = function (req, res, mailOptions, callback) {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            callback('error_msg');
        } else {
            console.log('Email sent: ' + info.response);
            callback('success_msg');
        }
    });
};

module.exports.sendMails = function (req, res, mail_opt_arr, callback) {
    var send_succ = true;
    mail_opt_arr.forEach(function (mailOptions) {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                send_succ = false;
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    });

    if(send_succ){
        callback('success_msg');
    } else{
        callback('error_msg');
    }
};