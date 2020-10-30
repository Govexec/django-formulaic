$(function() {
    $.fn.filterByData = function(prop, val) {
        return this.filter(
            function() { return $(this).data(prop)==val; }
        );
    }

    var Formulaic = {
        nextID: 1
    };

    Formulaic.getNextID = function() {
        var nextID = Formulaic.nextID;
        Formulaic.nextID++;

        return "N" + nextID;
    }

    Formulaic.State = {
        NOT_LOADED: "not-loaded",
        LOADING: "loading",
        READY: "ready"
    };

    /*
    Example:
    Formulaic.optionsLists = {
        3: {
            state: "loading",
            options: [...],
            callbacks: {
                display_condition_2: inlineFunction,
                display_condition_5: inlineFunction,
                default_option_1: inlineFunction,
                default_option_3: inlineFunction
            }
        },
        ...
    };
     */
    Formulaic.optionLists = {};

    Formulaic.templates = {
        "text": $("#templates .field-text").eq(0),
        "select": $("#templates .field-select").eq(0),
        "checkbox": $("#templates .field-checkbox").eq(0),
        "default_option": $(document.createElement("option")).val("").text("Choose one..."),
        "display_condition": $("#templates .display-condition").eq(0),
        "option_lists": null
    }

    Formulaic.getElementFromTemplate = function(key) {
        if (key in Formulaic.templates && Formulaic.templates[key] != null) {
            return Formulaic.templates[key].clone(true);
        } else {
            return null;
        }
    }

    Formulaic.updateDisplayConditions = function() {
        var fieldElements = $("#container > div");

        var options = [];

        fieldElements.each(function() {
            options.push({
                value: $(this).data("id"),
                text: $(this).find(".name input").val() || "(unnamed)",
                field_type: $(this).data("field-type")
            });
        });

        var watchedFieldSelects = $(".watched-field");
        watchedFieldSelects.each(function() {
            if ($(this).val() != "" && $(this).val() != null) {
                $(this).data("selected-value", $(this).val());
            }
        });
        watchedFieldSelects.empty();

        var default_option = Formulaic.getElementFromTemplate("default_option");
        watchedFieldSelects.append(default_option);

        for (var i = 0; i < options.length; i++) {
            var option = options[i];

            var optionElement = $(document.createElement("option"));
            optionElement.val(option["value"]);
            optionElement.text(option["text"]);
            optionElement.data("field-type", option["field_type"]);
            //var optionElement = '<option value="' + option["value"] + '">' + option["text"] + '</option>';

            watchedFieldSelects.append(optionElement);
        }

        watchedFieldSelects.each(function() {
            // Select value if it exists in options
            $(this).find("option[value=" + $(this).data("selected-value") + "]").attr("selected", "selected");
        });

        // Add onchange event handler to watchedField selects to show/hide other fields
        $(".display-condition").each(function() {
            var displayConditionID = $(this).data("id");

            var watchedField = $(this).find(".watched-field");
            var selectValues = $(this).find(".select-values");
            var textValue = $(this).find(".text-value");
            var checkboxValue = $(this).find(".checkbox-value");

            Formulaic.updateDCValueSelect(displayConditionID, watchedField, selectValues, textValue, checkboxValue);

            watchedField.off("change.formulaic");
            watchedField.on("change.formulaic", function() {
                Formulaic.updateDCValueSelect(displayConditionID, watchedField, selectValues, textValue, checkboxValue);
            });
        });
    }

    Formulaic.updateDCValueSelect = function(displayConditionID, watchedField, selectValues, textValue, checkboxValue) {
        var callbackID = "condition_" + displayConditionID;

        var selectedOption = watchedField.find(":selected");
        var fieldType = selectedOption.data("field-type");

        // Get previous and remove from callbacks if necessary
        var previousFieldID = watchedField.data("selected-value");
        if (typeof previousFieldID != "undefined" && previousFieldID != "") {
            var previousWatchedFieldElement = $(".field-select").filterByData("id", previousFieldID);
            var previousOptionListElement = previousWatchedFieldElement.find(".option-list");

            // Maybe it was deleted
            if (previousOptionListElement.size() > 0) {
                var previousCallbacks = previousOptionListElement.data("callbacks");

                if (callbackID in previousCallbacks) {
                    delete callbackID[callbackID];
                }
            }
        }

        // Update "selected-value"
        watchedField.data("selected-value", selectedOption.val());


        selectValues.hide();
        textValue.hide();
        checkboxValue.hide();

        if (fieldType == "select") {

            var fieldID = selectedOption.val();
            var watchedFieldElement = $(".field-select").filterByData("id", fieldID);

            var optionListID = watchedFieldElement.find(".option-list select").val();
            var optionList = Formulaic.optionLists[optionListID];

            var optionListElement = watchedFieldElement.find(".option-list");

            // Add to callbacks on "Option List"
            optionListElement.data("callbacks")[callbackID] = function(newOptionListID) {
                Formulaic.renderDCValueSelect(selectValues, newOptionListID);
            };

            // Update select's options
            if (optionList.state == Formulaic.State.READY) {
                Formulaic.renderDCValueSelect(selectValues, optionListID);
            }

            selectValues.show();

        } else if (fieldType == "text") {
            textValue.show();
        } else if (fieldType == "checkbox") {
            checkboxValue.show();
        }
    }

    Formulaic.renderDCValueSelect = function(field, optionListID) {
        var options = Formulaic.optionLists[optionListID].options;

        field.empty();
        for (var i = 0; i < options.length; i++) {
            // TODO: suppress current field

            var option = options[i];

            var optionElement = $(document.createElement("option"));
            optionElement.val(option["id"]);
            optionElement.html(option["name"]);

            field.append(optionElement);
        }

        field.val(field.data("selected-values"));
    }

    Formulaic.fetchOptions = function(optionListID) {
        var optionList = Formulaic.optionLists[optionListID];

        optionList.state = Formulaic.State.LOADING;

        var params = { "option_list_id": optionListID };

        $.ajax({
            url: "/athena/formulaic/form/2/api/get-options/",
            data: params,
            success: function(data) {
                var options = data["options"];

                // cache options
                optionList.options = options;
                optionList.state = Formulaic.State.READY;

                // Callbacks
                var callbacks = optionList.callbacks;
                for (var key in callbacks) {
                    callbacks[key]();
                }
            },
            cache: false
        });
    }

    Formulaic.renderDefaultOptions = function(optionListContainer, optionListID) {
        var options = Formulaic.optionLists[optionListID].options;

        var defaultOptionElement = optionListContainer.siblings(".default-option");
        var defaultOptionSelect = defaultOptionElement.find("select");

        // Check if optionListID has changed & clear selected value if necessary
        var previousOptionListID = defaultOptionElement.data("option-list-id");
        if (previousOptionListID != optionListID) {
            defaultOptionElement.data("selected-value", "");
        } else {
            defaultOptionElement.data("option-list-id", optionListID);
        }

        var default_option = Formulaic.getElementFromTemplate("default_option");

        defaultOptionSelect.empty();
        defaultOptionSelect.append(default_option);

        for (var i = 0; i < options.length; i++) {
            var option = options[i];

            var optionElement = $(document.createElement("option"));
            optionElement.val(option["id"]);
            optionElement.html(option["name"]);

            defaultOptionSelect.append(optionElement);
        }

        // Set value
        var selectedValue = defaultOptionElement.data("selected-value");
        if (selectedValue != null && selectedValue != "") {
            defaultOptionSelect.val(selectedValue);
        } else {
            defaultOptionSelect.val("");
        }

        defaultOptionElement.removeClass("loading");
    }

    /**
     * Updates the "Default Option" field's options list based on the "Option List" field
     * @param fieldContainer
     */
    Formulaic.updateDefaultOptions = function(fieldContainer) {

        var fieldID = fieldContainer.data("id");

        var optionListContainer = fieldContainer.find(".option-list");
        var optionListSelectElement = optionListContainer.find("select");

        var defaultOptionElement = optionListContainer.siblings(".default-option");

        if (optionListSelectElement.val() != "") {
            defaultOptionElement.show();

            var optionListID = parseInt(optionListSelectElement.val());
            var optionList = Formulaic.optionLists[optionListID];

//            if (optionList.state == Formulaic.State.NOT_LOADED) {
//                Formulaic.fetchOptions(optionListID);
//            } else
            if (optionList.state == Formulaic.State.READY) {
                Formulaic.renderDefaultOptions(optionListContainer, optionListID);
            }
        } else {
            defaultOptionElement.hide();
            defaultOptionElement.addClass("loading");
        }
    }

    Formulaic.loadOptionLists = function() {
        // TODO: dynamic URL
        $.ajax({
            url: "/athena/formulaic/form/2/api/get-option-lists/",
            success: function(data) {
                var option_lists = data["option_lists"];

                var optionListElements = $(".option-list");
                var selectElements = optionListElements.find("select");

                var default_option = Formulaic.getElementFromTemplate("default_option");

                // empty and add default option
                selectElements.empty();
                selectElements.append(default_option);

                // add options from feed
                for (var i = 0; i < option_lists.length; i++) {
                    var option_list = option_lists[i];

                    // Add to optionLists dictionary
                    if (!(option_list["id"] in Formulaic.optionLists)) {
                        Formulaic.optionLists[option_list["id"]] = {
                            state: Formulaic.State.NOT_LOADED,
                            options: [],
                            callbacks: {}
                        }
                    }

                    // Create/append option
                    var optionElement = $(document.createElement("option"));
                    optionElement.val(option_list["id"]);
                    optionElement.html(option_list["name"]);

                    selectElements.append(optionElement);
                }

                // select option if previous value exists
                optionListElements.each(function() {
                    var currentElement = $(this);

                    var selectedValue = currentElement.data("selected-value");

                    if (selectedValue != null) {
                        currentElement.find("select").val(selectedValue);
                    }
                });

                optionListElements.removeClass("loading");
            },
            cache: false
        });
    }

    Formulaic.loadFields = function() {
        var container = $("#container");
        container.addClass("loading");

        var form_id = $("#container").data("form-id");

        var params = {
            "form_id": form_id
        }

        // TODO: dynamic URL
        $.ajax({
            url: "/athena/formulaic/form/2/api/get-fields/",
            data: params,
            success: function(data) {
                var fields = data["fields"];
                container.empty();

                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];

                    if (field["field_type"] in Formulaic.templates) {
                        var element = Formulaic.getElementFromTemplate(field["field_type"]);

                        element.data("id", field["id"]);
                        element.data("field-type", field["field_type"]);

                        element.find(".name input").val(field["name"]);
                        element.find(".slug input").val(field["slug"]);
                        element.find(".required input").prop("checked", field["required"]);
                        element.find(".help-text input").val(field["help_text"]);

                        var affectingConditionsUL = element.find(".display-conditions ul");
                        var affecting_conditions = field["affecting_conditions"];
                        for (var j = 0; j < affecting_conditions.length; j++) {
                            var condition = affecting_conditions[j];

                            var conditionElement = Formulaic.getElementFromTemplate("display_condition");

                            conditionElement.data("id", condition["id"]);

                            // Defer until field list is complete
                            conditionElement.find(".watched-field").data("selected-value", condition["watched_field_id"]);

                            if (condition["watched_field_type"] == "select") {
                                // Defer until select is populated
                                conditionElement.find(".select-values").data("selected-values", condition["values"]);
                            } else if (condition["watched_field_type"] == "text") {
                                conditionElement.find(".text-value").val(condition["values"]);
                            } else if (condition["watched_field_type"] == "checkbox") {
                                conditionElement.find(".checkbox-value").prop("checked", condition["values"]);
                            }

                            conditionElement.find(".value-option").val(condition["value_option"]);

                            Formulaic.initDisplayCondition(conditionElement);

                            // TODO: figure out last field(s)
                            //conditionElement.find("")

                            affectingConditionsUL.prepend(conditionElement);
                        }

                        if (field["field_type"] == "text") {
                            element.find(".multiline input").prop("checked", field["multiline"]);
                            element.find(".line-count input").val(field["line_count"]);

                            Formulaic.initText(element);
                        } else if (field["field_type"] == "select") {

                            // TODO: Left off here.  Refactor "select" init so it can be called on "new" selects

                            element.find(".multiselect input").prop("checked", field["multiselect"]);
                            element.find(".minimum-selections input").val(field["minimum_selections"]);
                            element.find(".maximum-selections input").val(field["maximum_selections"]);

                            var default_option = element.find(".default-option");
                            default_option.data("selected-value", field["default_option_id"]);
                            default_option.data("option-list-id", field["option_list_id"]);

                            var option_list = element.find(".option-list");
                            option_list.data("selected-value", field["option_list_id"]);

                            // Attempt to set value (if select is populated)
                            option_list.find("select").val(field["option_list_id"]);

                            // TODO: REFACTORED
                            Formulaic.initSelect(element);
                            Formulaic.optionListChangedHandler(option_list, field["id"]);
                        } else if (field["field_type"] == "checkbox") {
                            // TODO: checkbox
                        }

                        // Standard init
                        Formulaic.initField(element);

                        container.append(element);
                    } else {
                        alert("Template missing!");
                    }
                }

                container.removeClass("loading");

                Formulaic.updateDisplayConditions();
            },
            cache: false
        });
    }

    Formulaic.initDisplayCondition = function(conditionElement) {
        conditionElement.find(".delete").click(function(e) {
            e.preventDefault();

            conditionElement.remove();
        });
    }

    Formulaic.initField = function(element) {

        // Delete field
        element.find(".tools .delete").click(function(e) {
            e.preventDefault();

            if (window.confirm("Remove this field?")) {
                element.remove();
                Formulaic.updateDisplayConditions();
            }
        });

        // Move field up
        element.find(".tools .arrow-up").click(function(e) {
            e.preventDefault();

            var previousElement = element.prev();

            if (previousElement.size() > 0) {
                element.detach();
                element.insertBefore(previousElement);

                // animate
                element.css({ opacity: 0.0 });
                element.animate({
                    opacity:1
                }, 500)
            }
        });

        // Move field down
        element.find(".tools .arrow-down").click(function(e) {
            e.preventDefault();

            var nextElement = element.next();

            if (nextElement.size() > 0) {
                element.detach();
                element.insertAfter(nextElement);

                // animate
                element.css({ opacity: 0.0 });
                element.animate({
                    opacity:1
                }, 500)
            }
        });

        // Add Display Condition
        element.find(".display-conditions .add").click(function(e) {
            e.preventDefault();

            var conditionElement = Formulaic.getElementFromTemplate("display_condition");

            var id = Formulaic.getNextID();
            conditionElement.data("id", id);

            // Defer until field list is complete
            //conditionElement.find(".watched-field").data("selected-value", condition["watched_field_id"]);
            //conditionElement.find(".select-values").data("selected-values", condition["values"]);

            //conditionElement.find(".value-option").val(condition["value_option"]);

            // TODO: figure out last field(s)
            //conditionElement.find("")

            var watchedField = conditionElement.find(".watched-field");
            var selectValues = conditionElement.find(".select-values");
            var textValue = conditionElement.find(".text-value");
            var checkboxValue = conditionElement.find(".checkbox-value");

            // Rebuild change event for this clone
            watchedField.off("change.formulaic");
            watchedField.on("change.formulaic", function() {
                Formulaic.updateDCValueSelect(id, watchedField, selectValues, textValue, checkboxValue);
            });

            Formulaic.initDisplayCondition(conditionElement);

            conditionElement.insertBefore($(this).parent());
        });
    }

    Formulaic.initText = function(element) {
        // hide min/max selections if multiline is unchecked
        if (!element.find(".multiline input").is(":checked")) {
            element.find(".line-count").hide();
        }
        element.find(".multiline input").change(function() {
            if ($(this).is(":checked")) {
                element.find(".line-count").show();
            } else {
                element.find(".line-count").hide();
            }
        });
    }

    Formulaic.initSelect = function(element) {
        var fieldID = element.data("id");
        var option_list = element.find(".option-list");


        // hide min/max selections if multiselect is unchecked
        if (!element.find(".multiselect input").is(":checked")) {
            element.find(".minimum-selections, .maximum-selections").hide();
        }
        element.find(".multiselect input").change(function() {
            if ($(this).is(":checked")) {
                element.find(".minimum-selections, .maximum-selections").show();
            } else {
                element.find(".minimum-selections, .maximum-selections").hide();
            }
        });

        // Add default-options callback
        Formulaic.updateDefaultOptions(element);
        option_list.data("callbacks", {
            "default_options": (function(currentElement) {
                return function(newOptionListID) {
                    //Formulaic.updateDefaultOptions(currentElement);
                    Formulaic.updateDefaultOptions(currentElement);
                };
            })(element)
        });

        // Setup onchange handler to update "Default Option" and "Display Conditions"
        option_list.find("select").change((function(currentOptionList, currentFieldID) {
            return function() {
                //Formulaic.updateDefaultOptions(currentElement);
                Formulaic.optionListChangedHandler(currentOptionList, currentFieldID);
            };
        })(option_list, fieldID));
    }

    Formulaic.optionListChangedHandler = function(optionListContainer, fieldID) {
        // Get before/after & sync
        var previousValue = optionListContainer.data("selected-value");
        var newValue = optionListContainer.find("select").val();
        optionListContainer.data("selected-value", newValue);

        // Remove from callbacks in old optionList
        if (previousValue != newValue && typeof previousValue != "undefined") {
            var previousOptionList = Formulaic.optionLists[previousValue];
            delete previousOptionList.callbacks["optionList_" + fieldID];
        }

        // Only run these if an "Option List" is selected
        if (newValue != "") {
            // Add to callbacks in Formulaic.optionLists
            var optionList = Formulaic.optionLists[newValue];
            var callbackID = "optionList_" + fieldID;
            optionList.callbacks[callbackID] = function() {
                Formulaic.optionListChangedHandler(optionListContainer);
            };

            // Load optionList options
            if (optionList.state == Formulaic.State.NOT_LOADED) {
                Formulaic.fetchOptions(newValue);
            }
        }

        // Run callbacks for dependent fields
        var callbacks = optionListContainer.data("callbacks");
        for (var key in callbacks) {
            callbacks[key](newValue);
        }
    }

    Formulaic.save = function() {
        // TODO: Start loading/sending UI treatment

        var fields = $("#container > div");
        var data = [];

        fields.each(function(index) {
            var currentField = $(this);

            var fieldData = {
                id: currentField.data("id"),
                name: currentField.find(".name input").val(),
                slug: currentField.find(".slug input").val(),
                required: currentField.find(".required input").is(':checked'),
                help_text: currentField.find(".help-text input").val(),
                field_type: currentField.data("field-type"),
                affecting_conditions: [],
                position: index
            }

            // Field type specific fields
            if (fieldData["field_type"] == "text") {
                fieldData["multiline"] = currentField.find(".multiline input").is(':checked');
                fieldData["line_count"] = currentField.find(".line-count input").val();
            } else if (fieldData["field_type"] == "select") {
                fieldData["multiselect"] = currentField.find(".multiselect input").is(':checked');
                fieldData["minimum_selections"] = currentField.find(".minimum-selections input").val();
                fieldData["maximum_selections"] = currentField.find(".maximum-selections input").val();
                fieldData["option_list_id"] = currentField.find(".option-list select").val();
                fieldData["default_option_id"] = currentField.find(".default-option select").val();
            } else if (fieldData["field_type"] == "checkbox") {
                // No extra fields
            }

            var displayConditions = currentField.find(".display-condition");
            displayConditions.each(function(index) {
                var currentCondition = $(this);

                var displayConditionData = {
                    id: currentCondition.data("id"),
                    watched_field_id: currentCondition.find(".watched-field").val(),
                    value_option: currentCondition.find(".value-option").val(),
                    position: index
                };

                // Set value based on field type
                if (currentCondition.find(".select-values").is(":visible")) {
                    displayConditionData.values = currentCondition.find(".select-values").val();
                } else if (currentCondition.find(".text-value").is(":visible")) {
                    displayConditionData.values = currentCondition.find(".text-value").val();
                } else if (currentCondition.find(".checkbox-value").is(":visible")) {
                    displayConditionData.values = currentCondition.find(".checkbox-value").is(":checked");
                }

                fieldData.affecting_conditions.push(displayConditionData);
            });

            data.push(fieldData);
        });

        var params = { fields: JSON.stringify(data) };

        // Send data to server
        // TODO: set variable for url
        $.post("/athena/formulaic/form/2/api/update-fields/", params, function(responseData) {


            // TODO: End loading/sending treatment here

            // Reload form
            Formulaic.reload();
        });
    }

    Formulaic.reload = function() {
        $("#container").empty();
        Formulaic.load();
    }

    Formulaic.load = function() {
        Formulaic.loadOptionLists();
        Formulaic.loadFields();
    }

    Formulaic.init = function() {
        Formulaic.load();

        // Setup button handlers
        $("#save_fields").click(function() {
            Formulaic.save();
        });

        $(".add-field").click(function() {
            var fieldType = $(this).data("type");
            var element = Formulaic.getElementFromTemplate(fieldType);
            var elementID = Formulaic.getNextID();

            element.data("id", elementID);
            element.find(".default-option").hide();

            if (fieldType == "select") {
                Formulaic.initSelect(element);
            } else if (fieldType == "text") {
                Formulaic.initText(element);
            }

            var container = $("#container");

            // Standard init
            Formulaic.initField(element);

            container.append(element);

            // Scroll to element
            $("html,body").scrollTop($(document).height());

            // Update display conditions
            Formulaic.updateDisplayConditions();

            element.find(".name input").bind("keyup change", function() {
                var name = $(this).val();
                //elementID

                $(".watched-field option[value=" + elementID + "]").text(name);
            });

            return false;
        });
    }

    Formulaic.init();
});