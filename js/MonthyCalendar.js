/*jslint es6 devel browser*/
/* Misc Functions */

function _add_days(date, number_days) {
    "use strict";
    var new_date = new Date(date);
    new_date.setDate(new_date.getDate() + number_days);
    return new_date;
}

function _next_month_first_day(date) {
    "use strict";
    var new_date = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    return new_date;
}

function _number_days_week_before(date) {
    "use strict";
    return date.getUTCDay();
}

function _number_days_week_after(date) {
    "use strict";
    return 6 - date.getUTCDay();
}

function _days_in_month(year, month) {
    "use strict";
    return new Date(year, month, 0).getUTCDate();
}

var holidays = {};


function getHolidays(country_code, callbackFunction) {
    "use strict";
    var httpRequest;
    
    function handleRequest() {
        var errorMessage = false;
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                callbackFunction(httpRequest.responseText);
            } else if (httpRequest.status === 401) {
                errorMessage = "Unauthorized. Please let the owner know that there is problem with the Holiday API key";
            } else if (httpRequest.status === 402) {
                errorMessage = "Please let the owner know that there is problem with the payment of Holiday API";
            } else {
                errorMessage = "There was a unidentified problem with the request.";
            }
            
            if (errorMessage !== false) {
                console.error(errorMessage);
            }
        }
    }
    
    function makeRequest() {
        httpRequest = new XMLHttpRequest();
        var key = "0f882491-824c-4cf9-a16a-4b3fdd9e840e";
        var year = 2008;
        var url = "https://holidayapi.com/v1/holidays?key=" + key + "&country=" + country_code + "&year=" + year;
        if (!httpRequest) {
            return false;
        }

        httpRequest.onreadystatechange = handleRequest;
        httpRequest.open("GET", url);
        httpRequest.send();
    }

    makeRequest();
}

/* Calendar Generator */


function Week(start, offset, number_days, week_dom) {
    "use strict";
    week_dom.className = "week";
    var array = new Array(7);
    array = Array.from(array, () => (week_dom.appendChild(document.createElement("DIV"))));
    var dayStart = start.getUTCDate();
    var month = ("0" + (start.getUTCMonth() + 1)).slice(-2);
    var year = start.getUTCFullYear();
    array.forEach(function (day, i) {
        if (i < offset || i >= offset + number_days) {
            day.className = "day empty";
        } else {
            day.className = "day";
            day.textContent = dayStart;
            if (holidays[year + "-" + month + "-" + ("0" + dayStart).slice(-2)] !== undefined) {
                day.title = holidays[year + "-" + month + "-" + ("0" + dayStart).slice(-2)][0].name;
                day.className += " holiday";
            }
            dayStart += 1;
        }
    });
    return week_dom;
}


function month(start, days_remaining_total) {
    "use strict";
    var days_valid_month;
    var days_remaining;
    var days_offset;
    var weeks;
    var weeks_array;
    var number_days;
    // number of days valid in the month afther the given date
    days_valid_month = _days_in_month(start.getUTCFullYear(), start.getUTCMonth() + 1) - start.getUTCDate() + 1;

    // min of the value of days valid on month or the remaining days paramenter
    days_remaining = (days_remaining_total < days_valid_month)
        ? days_remaining_total
        : days_valid_month;
    days_remaining_total = days_remaining_total - days_remaining;
    days_offset = _number_days_week_before(start);

    // number of weeks that will be rendered in this month
    weeks = Math.ceil((days_remaining + days_offset) / 7);



    // array where will be place the weeks
    weeks_array = [];
    weeks_array.length = weeks;
    var month_dom = document.createElement("DIV");
    month_dom.className = "month";
    weeks_array = Array.from(weeks_array, () => (month_dom.appendChild(document.createElement("DIV"))));

    number_days = 7 - days_offset;
    weeks_array.forEach(function (week_dom, i) {
        if (i === weeks - 1) {
            number_days = days_remaining;
        }
        new Week(start, days_offset, number_days, week_dom);
        days_remaining -= number_days;
        start = _add_days(start, number_days);
        days_offset = 0;
        number_days = 7;
    });
    
    return {
        month_dom,
        days_remaining_total
    };

}
function calendar_generator_handler(dom_parent, start_date, number_days) {
    "use strict";
    return function (response) {
        holidays = (JSON.parse(response)).holidays;
        var current_date = start_date;
        while (number_days > 0) {
            const {
                month_dom,
                days_remaining_total
            } = month(current_date, number_days);
            number_days = days_remaining_total;
            current_date = _next_month_first_day(current_date);
            dom_parent.appendChild(month_dom);
        }
    };
}

function calendar_generator(dom_parent, start_date, number_days, country_code) {
    "use strict";
    getHolidays(country_code, calendar_generator_handler(dom_parent, start_date, number_days));
}


