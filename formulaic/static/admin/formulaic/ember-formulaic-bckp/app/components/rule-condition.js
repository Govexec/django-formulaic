import Ember from 'ember';

var FIELD_TYPE_TEXTFIELD = 'textfield';
var FIELD_TYPE_CHOICEFIELD = 'choicefield';
var FIELD_TYPE_BOOLEANFIELD = 'booleanfield';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    tagName: 'li',

    _previousFieldType: null,
    _fieldTypeInitialized: false,
    allOperators: [
        { value: "is", name: "is" },
        { value: "is_not", name: "is not" }
        //,  TODO: cut from initial scope
        // { value: "contains", name: "contains" },
        // { value: "does_not_contain", name: "does not contain" },
        // { value: "begins_with", name: "begins with" },
        // { value: "ends_with", name: "ends with" },
        // { value: "greater_than", name: "greater than" },
        // { value: "less_than", name: "less than" },
        // { value: "any_selected", name: "any selected" },
        // { value: "all_selected", name: "all selected" }
    ],

    availableOperators: function() {
        return this.allOperators;
    }.property(),

    fieldType: function() {
        let field = this.get('condition.field');

        if (field.get('isFulfilled')) {
            if (field.get('content.textfield')) {
                return FIELD_TYPE_TEXTFIELD;
            } else if (field.get('content.choicefield')) {
                return FIELD_TYPE_CHOICEFIELD;
            } else if (field.get('content.booleanfield')) {
                return FIELD_TYPE_BOOLEANFIELD;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }.property('condition.field.content', 'condition.field.isFulfilled'),


    allFieldsReady: function() {
        // TODO: find another way to look for updates other than length; as is this
        // will never be "ready" if there aren't any fields.
        return (this.get('allFields').get('length'));
    }.property('allFields.length'),

    fieldOptions: function() {
        return this.get('condition.field.content.choicefield.option_list.options');
    }.property('condition.field.content'),

    useTextWidget: function() {
        return (this.get('fieldType') === FIELD_TYPE_TEXTFIELD);
    }.property('fieldType'),

    useSelectWidget: function() {
        return (this.get('fieldType') === FIELD_TYPE_CHOICEFIELD);
    }.property('fieldType'),

    useNoWidget: function() {
        return (this.get('fieldType') === FIELD_TYPE_BOOLEANFIELD);
    }.property('fieldType'),

    // selectValue: function(key, value) {
    //     if (this.get('field.content.choicefield.option_list.isFulfilled')) {
    //         // setter
    //         if (typeof value !== 'undefined' && value !== this.get('value')) {
    //             this.set('value', value);
    //         }

    //         // getter
    //         return this.get('value');
    //     } else {
    //         return null;
    //     }
    // }.property('fieldOptions', 'field.content.choicefield.option_list.isFulfilled', 'value'),

    selectValue: Ember.computed(
        'fieldOptions', 
        'field.content.choicefield.option_list.isFulfilled', 
        'value', 
        {
            get() {
                return this.get('condition.value');
            }
        }
    ),

    watchFieldChanges: function() {
        if (this.get('field.isFulfilled')) {
            if (!this._fieldTypeInitialized) {
                // init fieldType
                this._previousFieldType = this.get('fieldType');
                this._fieldTypeInitialized = true;
            } else {
                if (this._previousFieldType !== this.get('fieldType')) {
                    this._previousFieldType = this.get('fieldType');
                    this.set('value', null);
                }
            }
        }
    }.observes('fieldType'),

    actions: {
        conditionFieldChanged: function(value) {
            this.set('condition.field', value);
        },
        conditionOperatorChanged: function(value) {
            this.set('condition.operator', value);
        },
        conditionSelectValueChanged: function(value) {
            this.set('condition.value', value);
        },
        clickedDeleteCondition: function(condition) {
            this.sendAction('onDeleteClick', condition);
        }
    }
});
