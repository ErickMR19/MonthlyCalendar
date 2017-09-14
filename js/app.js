function crearCalendario(form) {
    "use strict";
    calendar_generator(document.getElementById("calendar-container"), new Date(form.date.value), parseInt(form["number-days"].value), form["country-code"].value);
    form.getElementsByTagName("button")[0].disabled = true;
    return false;
}