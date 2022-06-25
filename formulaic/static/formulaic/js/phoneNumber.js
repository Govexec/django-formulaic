/*********** Phone Number Widget ***********/
$(document).ready(function () {
    // https://github.com/jackocnr/intl-tel-input
    // Assign the utilsScript to all phone inputs.
    let phoneElements = document.querySelectorAll("input[autocomplete='tel'][type='text']")
    for (let i = 0; i < phoneElements.length; ++i){
        let phoneElement = phoneElements[i]
        let iti = window.intlTelInput(phoneElement, {
            utilsScript: phoneElement.getAttribute("utilsScript"),
            hiddenInput: phoneElement.getAttribute("name") + phoneElement.getAttribute("full_suffix"),
            preferredCountries: ["us"]
        })

        // If intl-tel-input has troubles parsing the number then it does not
        // send the country code. This makes it very hard to retain what country
        // was selected if there is an error. Instead of resorting to heroics,
        // set the country code to the US. This should either be outright fixed
        // in the future, or atleast have the default country be configurable.
        if (Object.keys(iti.getSelectedCountryData()).length === 0 ){
            iti.setCountry("us");
        }


         phoneElement.addEventListener('blur', function() {
            // If blank, return early.
            if (phoneElement.value.trim().length === 0) return;

            // Nicely format the number if it is valid.
            if (iti.isValidNumber()) iti.setNumber(iti.getNumber());
        });
    }
});
