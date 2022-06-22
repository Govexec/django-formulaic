/*********** Phone Number Widget ***********/
$(document).ready(function () {
    // https://github.com/jackocnr/intl-tel-input
    // Assign the utilsScript to all phone inputs.
    let phoneElements = document.querySelectorAll("input[autocomplete='tel']")
    for (let i = 0; i < phoneElements.length; ++i){
        window.intlTelInput(phoneElements[i], {
            utilsScript: phoneElements[i].getAttribute("utilsScript")
        })
    }
});
