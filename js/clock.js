// clock.js
function displayTime() {
    var now = new Date(),
        hour = now.getHours(),
        minute = now.getMinutes();

    if (minute < 10) {
        minute = '0' + minute;
    }

    $('#clock').html(hour + ':' + minute);
    setTimeout(displayTime, 1000);
}
displayTime();