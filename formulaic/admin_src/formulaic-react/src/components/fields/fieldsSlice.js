import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchCount} from './fieldsAPI';


function getOptionsLists() {
    // Reads from DOM.
    // Todo: Use (conditionally) the API

    let dataDiv = document.querySelectorAll('#option-lists-data')
    let jsonData = dataDiv[0].getAttribute("data-options-lists")
    return JSON.parse(jsonData);
}


function getInitialData() {
    // Reads from DOM.
    // Todo: Use (conditionally) the API
    let dataDiv = document.querySelectorAll('#initial-data')
    let jsonData = dataDiv[0].getAttribute("data-initial-data")
    return JSON.parse(jsonData);
}

function reassignFieldIds(fields){


    const knownKeys = fields.map((fieldObj, idx) => {
        fieldObj.key
    })
    console.log("reassigning...")


    return fields.map((fieldObj, idx) => {

        if(!knownKeys.includes(fieldObj.key)){
            knownKeys.push(fieldObj.key)
        }else{
            fieldObj.key = "field-" + idx
        }
        return fieldObj
    })
}


function initializeFields(rawData) {
    console.log("initializing?");
    const fields = rawData.fields
        .sort((a, b) => a.position - b.position)
        .map((fieldObj, idx) => {

            const newFieldObj = {
                key: "field-" + idx,
                css_class: fieldObj.css_class,
                data_name: fieldObj.data_name,
                display_name: fieldObj.display_name,
                help_text: fieldObj.help_text,
                model_class: fieldObj.model_class,
                position: fieldObj.position,
                required: fieldObj.required,
                slug: fieldObj.slug,
                subtype: fieldObj.subtype,
                djangoId: fieldObj.id,
                editActive: false,
                isDeleted: false,

            }

            // Work around due to serializer being bad.
            if(fieldObj.model_class === "booleanfield"){
                newFieldObj.default_checked = fieldObj.booleanfield.default_checked
            }

            if(fieldObj.model_class === "choicefield"){
                newFieldObj.default_option = fieldObj.choicefield.default_option
                newFieldObj.default_options = fieldObj.choicefield.default_options
                newFieldObj.default_text = fieldObj.choicefield.default_text
                newFieldObj.maximum_selections = fieldObj.choicefield.maximum_selections
                newFieldObj.minimum_selections = fieldObj.choicefield.minimum_selections
                newFieldObj.option_list = fieldObj.choicefield.option_list
                newFieldObj.option_group = fieldObj.choicefield.option_group
            }

            return newFieldObj
        })

    return fields
    // return reassignFieldIds(fields)
}

function getFieldByKey(fields, key) {
    return fields.find(item => item.key === key)
}

const initialState = {
    confirmedFields: initializeFields(getInitialData()),
    provisionedFields: initializeFields(getInitialData()),
    initialData: getInitialData(),
    optionsLists: getOptionsLists()
};

export const fieldsSlice = createSlice({
    name: 'fields',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        toggleEditActive: (state, action) => {
            let fieldObj = getFieldByKey(state.provisionedFields, action.payload.fieldId)
            fieldObj.editActive = !fieldObj.editActive;

            //todo: Handle invalid submission. Auto fill/clean slug?

            // Update the confirmed object with the provisioned object.
            if(!fieldObj.editActive){
                let confirmFieldObj = getFieldByKey(state.confirmedFields, action.payload.fieldId)
                Object.assign(confirmFieldObj, fieldObj)
            }
        },

        handleDelete: (state, action) => {
            let fieldObj = getFieldByKey(state.provisionedFields, action.payload.fieldId)
            fieldObj.isDeleted = true;
        },

        changeInput: (state, action) => {
            let fieldObj = getFieldByKey(state.provisionedFields, action.payload.fieldId)
            fieldObj[action.payload.inputId] = action.payload.value;
        },

        addField: (state, action) => {
            const newFieldObj = {
                key: "field-" + state.provisionedFields.length,
                css_class: null,
                data_name: "data_name",
                display_name: "Display Name",
                help_text: "",
                model_class: action.payload.fieldType,
                position: state.provisionedFields.length,
                required: false,
                slug: "new-slug",
                subtype: action.payload.fieldSubtype,
                djangoId: null,
                editActive: true

            }

            // Work around due to serializer being bad.
            if(action.payload.fieldType === "booleanfield"){
                newFieldObj.default_checked = false;
            }

            if(action.payload.fieldType === "choicefield"){
                newFieldObj.default_option = null;
                newFieldObj.default_options = [];
                newFieldObj.default_text = null;
                newFieldObj.maximum_selections = null;
                newFieldObj.minimum_selections = null;
                newFieldObj.option_list = null;
                newFieldObj.option_group = null;
            }

            state.provisionedFields.push(newFieldObj);
            // reassignFieldIds(state.provisionedFields);
        },

        setFieldOrder: (state, action) => {

            const dragIndex = action.payload.dragIndex;
            const hoverIndex = action.payload.hoverIndex;

            // const fields = [...state.provisionedFields];


            const draggedPosition = state.provisionedFields[dragIndex].position;
            const hoverPosition = state.provisionedFields[hoverIndex].position;

            state.provisionedFields[dragIndex].position = hoverPosition;
            state.provisionedFields[hoverIndex].position = draggedPosition;

            // state.provisionedFields.sort((a, b) => a.position - b.position)

            console.log("Triggering the set field order", state.provisionedFields[dragIndex]["fieldId"])
        }
    },
});

export const {toggleEditActive, handleDelete, changeInput, addField, setFieldOrder} = fieldsSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const initialData = (state) => state.fields.initialData;
export const provisionedFields = (state) => state.fields.provisionedFields;
export const confirmedFields = (state) => state.fields.confirmedFields;
export const optionsLists = (state) => state.fields.optionsLists;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const incrementIfOdd = (amount) => (dispatch, getState) => {
    const currentValue = selectCount(getState());
    if (currentValue % 2 === 1) {
        dispatch(incrementByAmount(amount));
    }
};

export default fieldsSlice.reducer;
