// import * as ICS from 'ics-js';
var ICS = require('ics-js');

module.exports.createAppICSFile = function (event, info, callback) {
    var cal = new ICS.VCALENDAR();

    cal.addProp('VERSION', 2) // Number(2) is converted to '2.0'
    cal.addProp('PRODID', 'ManaApp');

    var ics_event = new ICS.VEVENT();
    ics_event.addProp('UID');
    ics_event.addProp('DTSTAMP', new Date(), { VALUE: 'DATE-TIME' });
    ics_event.addProp('DTSTART', new Date(event.start_date), { VALUE: 'DATE-TIME' });
    ics_event.addProp('DTEND', new Date(event.end_date), { VALUE: 'DATE-TIME' });
    ics_event.addProp('SUMMARY',info.provider_name+' - '+event.appointment_name);
    ics_event.addProp('LOCATION',info.provider_address);


    cal.addComponent(ics_event);

    callback(cal.toString());
};