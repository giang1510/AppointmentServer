var express = require('express');
var router = express.Router();

var Event = require('../model/eventModel');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('calendar');
});

router.post('/JSON', function (req, res) {
   if(req.body.data){
       for(var i = 0; i < req.body.data.length; i++){
           var eventData = req.body.data[i];
           var text = eventData.text;
           var start_date = eventData.start_date;
           var end_date = eventData.end_date;
           if(text && start_date && end_date){
               var eventToAdd = new Event({
                   text: text,
                   start_date: new Date(start_date),
                   end_date: new Date(end_date)
               });
               Event.addEvent(eventToAdd,function (err, event) {
                   if(err){
                       throw err;
                   }
                   // console.log(event);
               });

           }
       }
   }
    res.json({ redirect:"/calendar"});
});


router.get('/init', function (req, res) {
    var event2 = new Event({
        text: "Event 2",
        start_date: new Date("2013-08-06T14:00:00Z"),
        end_date: new Date("2013-08-06T15:00:00Z"),
        color: "#DD8616"
    });
    Event.addEvent(event2,function (err, event) {
        if(err) throw  err;
        // console.log(event);
    });

    /*... skipping similar code for other test events...*/

    res.send("Test events were added to the database")
});


router.get('/data', function (req, res) {
    // db.event.find().toArray(function (err, data) {
    //     //set id property for all records
    //     for (var i = 0; i < data.length; i++)
    //         data[i].id = data[i]._id;
    //
    //     //output response
    //     res.send(data);
    // });

    Event.getEvents(function (err, data) {
        console.log(data);
        //set id property for all records
        for (var i = 0; i < data.length; i++)
            data[i].id = data[i]._id;

        //output response
        res.send(data);
    });
});

router.get('/sorted_event', function (req, res) {
    Event.getEventsSorted(function (err, data) {
        res.json(data);
    });
});
module.exports = router;
