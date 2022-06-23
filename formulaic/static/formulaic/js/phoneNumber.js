/*********** Phone Number Widget ***********/
// let resetErrors = function(phoneElement){
//     // Remove all errors
//     let wrapperDiv = phoneElement.closest(".field-wrapper");
//     wrapperDiv.classList.remove("field-error");
//     wrapperDiv.classList.remove("formulaic-error");
//     wrapperDiv.classList.remove("has-error");
//
//     let span = wrapperDiv.querySelector(".error-message");
//     if(span) span.remove();
//
// }
//
// let addRemoveErrors = function(iti, phoneElement){
//     // Add or remove errors on the form.
//
//     let wrapperDiv = phoneElement.closest(".field-wrapper");
//     if (iti.isValidNumber()) {
//         // A Valid number gets reformatted.
//         resetErrors(phoneElement);
//         iti.setNumber(iti.getNumber());
//
//     } else {
//         // Add the error classes to the field.
//         wrapperDiv.classList.add("field-error");
//         wrapperDiv.classList.add("formulaic-error");
//         wrapperDiv.classList.add("has-error");
//
//         // Add an error span with message.
//         let span = document.createElement("span")
//         span.append("Enter a valid phone number.")
//         span.classList.add("error-message");
//         wrapperDiv.appendChild(span);
//     }
// }


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


        // Not sure we want to do this, as it does not generalize too well...

        // // On blur, check if it seems like it is a valid phone number.
        // phoneElement.addEventListener('blur', function() {
        //     // If blank, return early.
        //     if (phoneElement.value.trim().length === 0) return;
        //     addRemoveErrors(iti, phoneElement);
        // });
        //
        // // Clear errors on focus.
        // phoneElement.addEventListener('focus', function() {
        //     resetErrors(phoneElement);
        // });
        //
        // // if (phoneElement.value.trim()) addRemoveErrors(iti, phoneElement);
    }
});
