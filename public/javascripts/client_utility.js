function isTrue(myValue) {
    return (myValue == 'true');
}

function addZero(number) {
    if(number < 10){
        return '0'+number;
    }
    return ''+number;
}

function getDayStr(index) {
    var week_days = ['Mo', 'Tue', 'Wed', 'Thu', 'Fr', 'Sat', 'Sun'];
    return week_days[index];
}

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

function toStrWithoutSpaces(s) {
    return s.replace(/\s/g, "");
}

function timeFormat(time) {
    var timeStr = '';

    if (time.getHours() < 10) {
        timeStr += '0';
    }

    timeStr += time.getHours() + ':';
    if (time.getMinutes() < 10) {
        timeStr += '0'
    }
    timeStr += time.getMinutes();

    return timeStr;
}

