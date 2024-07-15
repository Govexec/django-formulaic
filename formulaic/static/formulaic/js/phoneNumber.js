/*********** Phone Number Widget ***********/
$(document).ready(function () {
    // https://github.com/jackocnr/intl-tel-input
    // Assign the utilsScript to all phone inputs.
    let phoneElements = document.querySelectorAll("input[autocomplete='tel'][type='text']")
    for (let i = 0; i < phoneElements.length; ++i){
        let phoneElement = phoneElements[i]
        let iti = window.intlTelInput(phoneElement, {
            utilsScript: phoneElement.getAttribute("utilsScript"),
            hiddenInput: phoneElement.getAttribute("name") + phoneElement.getAttribute("fullSuffix"),
            preferredCountries: ["us"],
            customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
    return selectedCountryPlaceholder + " ext. 4";
  },
        })

        // If intl-tel-input has troubles parsing the number then it does not
        // send the country code. This makes it very hard to retain what country
        // was selected if there is an error. Instead of resorting to heroics,
        // set the country code to the US. This should either be outright fixed
        // in the future, or atleast have the default country be configurable.
        if (Object.keys(iti.getSelectedCountryData()).length === 0 ){
            iti.setCountry("us");
        }

        // On clicking away, try and reformat the number.
         phoneElement.addEventListener('blur', function() {
            // If blank, return early.
            if (phoneElement.value.trim().length === 0) return;

            if (iti.isValidNumber()) {
               let extension = iti.getExtension()
               let formattedNumber;
               if (extension){
                   formattedNumber = iti.getNumber() + phoneElement.getAttribute("extensionPrefix") + iti.getExtension();
               }
               else {
                   formattedNumber = iti.getNumber();
               }

               iti.setNumber(formattedNumber);
               $(iti.hiddenInput).attr("value", formattedNumber);
             }
        });
    }
});
