'use strict';

const e = React.createElement;

function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}



function makeRequest(url, method, data=null){

    const csrftoken = getCookie('csrftoken');
    return fetch(url,{
            method: method,
            headers: {'X-CSRFToken': csrftoken, 'Content-Type': 'application/json'},
            mode: 'same-origin', // Do not send CSRF token to another domain.
            body: JSON.stringify(data)
        }
    )
}



function TextInput(props) {
    return (
        <div>
            <label htmlFor={props.id}>{props.label}:</label><br/>
            <input id={props.id} type="text" defaultValue={props.value} onChange={props.onChange}/>
        </div>
    );
}

function CheckboxInput(props) {
    return (
        <div>
            <label htmlFor={props.id}>{props.label}:</label><br/>
            <input id={props.id} type="checkbox" defaultChecked={props.value} onChange={props.onChange}/>
        </div>
    );
}

function SelectInput(props) {
    return (
        <div>
            <label htmlFor={props.id}>{props.label}:</label><br/>

            <select id={props.id} defaultValue={props.value} onChange={props.onChange}>
                {props.optionsList.map((option, key) => (
                    <option value={option.id}>{option.name}</option>
                ))}

            </select>
        </div>
    );
}


function addPanelButton(text, fieldType, fieldSubtype, addCallback) {
    return (
        <div data-field-type={fieldType} data-field-subtype={fieldSubtype} className={"btn btn-primary btn-add-field"}
             onClick={addCallback}>{text}</div>
    )
}

function addPanel(addCallback) {
    return (
        <div style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>


            {addPanelButton("TextField (Single Line)", "textfield", "text", addCallback)}
            {addPanelButton("TextField (Multi Line)", "textfield", "textarea", addCallback)}
            {addPanelButton("Dropdown List", "choicefield","select", addCallback)}
            {addPanelButton("Radio List", "choicefield","radio_select", addCallback)}
            {addPanelButton("Checkbox List", "choicefield","select_multiple", addCallback)}
            {addPanelButton("Checkbox", "booleanfield","checkbox", addCallback)}
            {addPanelButton("Multi-select List", "choicefield","checkbox_select_multiple", addCallback)}
            {/*{addPanelButton("Hidden Field", "textfield","text", addCallback)}*/}

            <hr style={{"opacity": "50%"}}/>

            {addPanelButton("Full Name", "textfield", "full_name", addCallback)}
            {addPanelButton("Email", "textfield", "email", addCallback)}
            {addPanelButton("Phone Number", "textfield", "phone_number", addCallback)}
            {addPanelButton("Integer", "textfield", "integer", addCallback)}

        </div>
    );
}


function formField(props, children){
    return (
        <form id={props.key}
                key={props.key}
                onSubmit={props.handleSet}
                data-pos={props.position}
                onDragOver={props.handleDragOver}
                style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>

            {children}
        </form>)
}


function TextField(props) {


    const children = [];

    // If the state of the field is deleted, just don't show anything.
    if (props.isDeleted) {
        return <div id={props.key} key={props.key}/>

    } else if (props.editActive) {
        children.push([
            <div><strong>Sub Type: </strong>{props.subtype}</div>,
            <TextInput label="Display Name" id="display_name" value={props.display_name} onChange={props.handleInputChange}/>,
            <CheckboxInput label="Required" id="required" value={props.required} onChange={props.handleInputChange}/>,
            <TextInput label="Data Column Name" id="data_name" value={props.data_name} onChange={props.handleInputChange}/>,
            <TextInput label="Slug" id="slug" value={props.slug} onChange={props.handleInputChange}/>,
            <TextInput label="Help Text" id="help_text" value={props.help_text} onChange={props.handleInputChange}/>,
            <TextInput label="CSS Class" id="css_class" value={props.css_class} onChange={props.handleInputChange}/>,
            <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}/>
    ]);

    } else {
        children.push([
            <div><strong>Type: </strong>{props.subtype}</div>,
            <div><strong>Display Name: </strong>{props.display_name}</div>,
            <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Default Checked: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Data Column Name: </strong>{props.default_checked}</div>,
            <div><strong>Slug: </strong>{props.slug}</div>,
            <div><strong>Help Text: </strong>{props.help_ext}</div>,
            <div><strong>CSS Class: </strong>{props.css_class}</div>,
            <div className={"btn btn-primary"} data-field-key={props.key} onClick={props.handleEdit}>Edit</div>,
            <div className={"btn btn-danger"} data-field-key={props.key} onClick={props.handleDelete}
                 data-django-id={props.djangoId}>Delete
            </div>,
            ])

    }
    return formField(props, children)
}


function BooleanField(props) {

    const children = [];
    // If the state of the field is deleted, just don't show anything.
    if (props.isDeleted) {
        return <div id={props.key} key={props.key}/>
    } else if (props.editActive) {
        children.push([
            <div><strong>Sub Type: </strong>{props.subtype}</div>,
            <TextInput label="Display Name" id="display_name" value={props.display_name} onChange={props.handleInputChange}/>,
            <CheckboxInput label="Required" id="required" value={props.required} onChange={props.handleInputChange}/>,
            <CheckboxInput label="Default Checked" id="default_checked" value={props.default_checked} onChange={props.handleInputChange}/>,
            <TextInput label="Data Column Name" id="data_name" value={props.data_name} onChange={props.handleInputChange}/>,
            <TextInput label="Slug" id="slug" value={props.slug} onChange={props.handleInputChange}/>,
            <TextInput label="Help Text" id="help_text" value={props.help_text} onChange={props.handleInputChange}/>,
            <TextInput label="CSS Class" id="css_class" value={props.css_class} onChange={props.handleInputChange}/>,
            <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}/>
    ]);

    } else {
        children.push([
            <div><strong>Type: </strong>{props.subtype}</div>,
            <div><strong>Display Name: </strong>{props.display_name}</div>,
            <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Default Checked: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Data Column Name: </strong>{props.default_checked}</div>,
            <div><strong>Slug: </strong>{props.slug}</div>,
            <div><strong>Help Text: </strong>{props.help_ext}</div>,
            <div><strong>CSS Class: </strong>{props.css_class}</div>,
            <div className={"btn btn-primary"} data-field-key={props.key} onClick={props.handleEdit}>Edit</div>,
            <div className={"btn btn-danger"} data-field-key={props.key} onClick={props.handleDelete}
                 data-django-id={props.djangoId}>Delete
            </div>,
            ])

    }
    return formField(props, children)
}


function HiddenField(props) {

    const children = [];

    // If the state of the field is deleted, just don't show anything.
    if (props.isDeleted) {
        return <div id={props.key} key={props.key}/>
    } else if (props.editActive) {
        children.push([
            <div><strong>Sub Type: </strong>{props.subtype}</div>,
            <TextInput label="Display Name" id="display_name" value={props.display_name} onChange={props.handleInputChange}/>,
            <CheckboxInput label="Required" id="required" value={props.required} onChange={props.handleInputChange}/>,
            <CheckboxInput label="Default Checked" id="default_checked" value={props.default_checked} onChange={props.handleInputChange}/>,
            <TextInput label="Data Column Name" id="data_name" value={props.data_name} onChange={props.handleInputChange}/>,
            <TextInput label="Slug" id="slug" value={props.slug} onChange={props.handleInputChange}/>,
            <TextInput label="Help Text" id="help_text" value={props.help_text} onChange={props.handleInputChange}/>,
            <TextInput label="CSS Class" id="css_class" value={props.css_class} onChange={props.handleInputChange}/>,
            <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}/>
    ]);

    } else {
        children.push([
            <div><strong>Type: </strong>{props.subtype}</div>,
            <div><strong>Display Name: </strong>{props.display_name}</div>,
            <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Default Checked: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Data Column Name: </strong>{props.default_checked}</div>,
            <div><strong>Slug: </strong>{props.slug}</div>,
            <div><strong>Help Text: </strong>{props.help_ext}</div>,
            <div><strong>CSS Class: </strong>{props.css_class}</div>,
            <div className={"btn btn-primary"} data-field-key={props.key} onClick={props.handleEdit}>Edit</div>,
            <div className={"btn btn-danger"} data-field-key={props.key} onClick={props.handleDelete}
                 data-django-id={props.djangoId}>Delete
            </div>,
            ])

    }
    return formField(props, children)
}


function ChoiceField(props, options) {

    const children = [];


    const optionsListMap = {};
     for (const choice of options) {
          optionsListMap[choice.id] = choice;
     }

    const defaultOptions = props.option_list? optionsListMap[props.option_list].options : []

    const defaultOptionsMap = {};
     for (const option of defaultOptions) {
          defaultOptionsMap[option.id] = option;
     }


    // If the state of the field is deleted, just don't show anything.
    if (props.isDeleted) {
        return <div id={props.key} key={props.key}/>

    } else if (props.editActive) {

        children.push([
            <div><strong>Sub Type: </strong>{props.subtype}</div>,
            <TextInput label="Display Name" id="display_name" value={props.display_name} onChange={props.handleInputChange}/>,
            <CheckboxInput label="Required" id="required" value={props.required} onChange={props.handleInputChange}/>,
            <TextInput label="Data Column Name" id="data_name" value={props.data_name} onChange={props.handleInputChange}/>,
            <TextInput label="Slug" id="slug" value={props.slug} onChange={props.handleInputChange}/>,
            <SelectInput label="Option List" id="option_list" value={props.option_list} onChange={props.handleInputChange} optionsList={options}/>,

            <SelectInput label="Default Option" id="default_option" value={props.default_option} onChange={props.handleInputChange} optionsList={defaultOptions}/>,


            <TextInput label="Help Text" id="help_text" value={props.help_text} onChange={props.handleInputChange}/>,
            <TextInput label="CSS Class" id="css_class" value={props.css_class} onChange={props.handleInputChange}/>,
            <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}/>
    ]);

    } else {
        const defaultOption = defaultOptionsMap[props.default_option] ? defaultOptionsMap[props.default_option].name : "";


        children.push([
            <div><strong>Type: </strong>{props.subtype}</div>,
            <div><strong>Display Name: </strong>{props.display_name}</div>,
            <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Default Checked: </strong>{props.required ? "yes" : "no"}</div>,
            <div><strong>Data Column Name: </strong>{props.default_checked}</div>,
            <div><strong>Slug: </strong>{props.slug}</div>,
            <div><strong>Option List: </strong>{optionsListMap[props.option_list].name}</div>,
            <div><strong>Default Option: </strong>{defaultOption}</div>,
            <div><strong>Help Text: </strong>{props.help_text}</div>,
            <div><strong>CSS Class: </strong>{props.css_class}</div>,
            <div className={"btn btn-primary"} data-field-key={props.key} onClick={props.handleEdit}>Edit</div>,
            <div className={"btn btn-danger"} data-field-key={props.key} onClick={props.handleDelete}
                 data-django-id={props.djangoId}>Delete
            </div>,
            ])

    }
    return formField(props, children)
}


class Fields extends React.Component {

    constructor(props) {
        super(props);

        this.addField = this.addField.bind(this);
        this.handleFieldDragStart = this.handleFieldDragStart.bind(this);
        this.handleFieldDragOver = this.handleFieldDragOver.bind(this);
        this.handleFieldEdit = this.handleFieldEdit.bind(this);
        this.handleFieldSet = this.handleFieldSet.bind(this);
        this.handleFieldDelete = this.handleFieldDelete.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleFieldDrop = this.handleFieldDrop.bind(this);
        this.handleSave = this.handleSave.bind(this);

        let initialData = this.getInitialData();
        this.optionsLists = this.getOptionsLists();

        this.formId = initialData.id;

        let formFields = [...initialData["fields"]];
        formFields = formFields.sort((a, b) => a.position - b.position)

        formFields.forEach((fieldObj, i) => {
            this.addHandlers(fieldObj, i)
        });

        let keyedFormFields = formFields.reduce((obj, item) => {
            return {
                ...obj,
                [item.key]: item,
            };
        }, {});

        this.formName = initialData["name"]
        this.state = {
            fields: keyedFormFields,
            changedFields: {},
            dragId: null,
            dragPos: 0
        }
    }


    addHandlers(fieldObj, i) {
        fieldObj.key = "field-" + i;
        fieldObj.editActive = false;
        fieldObj.isDeleted = false;
        fieldObj.handleEdit = this.handleFieldEdit;
        fieldObj.handleSet = this.handleFieldSet;
        fieldObj.handleDelete = this.handleFieldDelete;
        fieldObj.handleInputChange = this.handleInputChange;
        fieldObj.handleDragStart = this.handleFieldDragStart;
        fieldObj.handleDragOver = this.handleFieldDragOver;
        fieldObj.handleDrop = this.handleFieldDrop;
    }


    handleFieldEdit(event) {
        // Changes the field to be in "edit" mode.

        let key = event.target.getAttribute("data-field-key")
        let newFields = {...this.state.fields}
        newFields[key]["editActive"] = !newFields[key]["editActive"];
        this.setState({fields: newFields})
    }

    handleFieldDelete(event) {
        // Changes the field to be "deleted".
        let key = event.target.getAttribute("data-field-key")
        let newFields = {...this.state.fields}
        newFields[key]["isDeleted"] = !newFields[key]["isDeleted"];
        this.setState({fields: newFields})
    }

    handleInputChange(event){
        // Store the changes to the form in an object. Later, on handleFieldSet,
        // commit the changes to the main store.
        let form = event.target.closest("form");
        let label = event.target.getAttribute("id")
        let value = event.target.value;
        let key = form.getAttribute("id")

        let newChangedFields = {...this.state.changedFields}

        let changed = key in newChangedFields ? {...newChangedFields[key]} : {};
        changed[label] = value;
        newChangedFields[key] = changed;
        this.setState({changedFields: newChangedFields})
    }

    handleFieldSet(event) {
        // Sets the values from the edit form to the parent state.
        event.preventDefault();

        let newChangedFields = {...this.state.changedFields}
        let newFields = {...this.state.fields}
        let key = event.target.getAttribute("id")

        let changedField = newChangedFields[key];
        // Delete the key out of the changed fields.
        delete newChangedFields[key];

        newFields[key] = {
            ...newFields[key],
            ...changedField,
            editActive: false
        }

        this.setState({
            fields: newFields,
            changedFields: newChangedFields
        })
    }

    handleFieldDragStart(event) {
        const key = event.target.getAttribute("id")
        this.setState({dragId: key})
    }

    handleFieldDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        const pos = event.target.getAttribute("data-pos");
        if(pos !== null) this.setState({dragPos: pos})
    }

    handleFieldDrop(event) {
        // todo, make this approximately a million times better.
        let key = this.state.dragId;
        let newFields = {...this.state.fields}

        newFields[key]["position"] = this.state.dragPos - 0.5;

        Object.values(newFields)
            .sort((a, b) => a.position - b.position)
            .forEach((field, pos) => field.position = pos)

        this.setState({fields: newFields})
    }

    handleSave(event) {
        // todo, make this approximately a million times better.

        let fields = this.state.fields

        Object.values(fields).forEach((field) =>{
            if(field.isDeleted){
                let url = "/formulaic/api/" + field.model_class + "s/" + field.id + "/"
                makeRequest(url, "DELETE", field)
            }
            else if(field.id){
                let url = "/formulaic/api/" + field.model_class + "s/" + field.id + "/"
                makeRequest(url, "PUT", field)
            }else{
                let url = "/formulaic/api/" + field.model_class + "s/"
                makeRequest(url, "POST", field)
            }
        })
    }


    parseFieldData(fieldObj) {

        if (fieldObj.model_class === "textfield") {
            return TextField(fieldObj)
        }

        if(fieldObj.model_class === "booleanfield"){
           return BooleanField(fieldObj)
        }

        if(fieldObj.model_class === "choicefield"){
           return ChoiceField(fieldObj, this.optionsLists)
        }

        return <div>Missing...</div>
    }

    getInitialData() {
        // Reads from local state.
        // Todo: Use (conditionally) the API
        let dataDiv = document.querySelectorAll('#initial-data')
        let jsonData = dataDiv[0].getAttribute("data-initial-data")
        return JSON.parse(jsonData);
    }

    getOptionsLists() {
        // Reads from local state.
        // Todo: Use (conditionally) the API
        let dataDiv = document.querySelectorAll('#option-lists-data')
        let jsonData = dataDiv[0].getAttribute("data-options-lists")
        return JSON.parse(jsonData);
    }

    addField(event) {

        let newFields = {...this.state.fields};

        let fieldType = event.target.getAttribute("data-field-type")
        let fieldSubtype = event.target.getAttribute("data-field-subtype")

        let numFields = Object.values(newFields).length;
        let maxPos = 0;

        for (const key in newFields) {
            if (newFields[key].position > maxPos) maxPos = newFields[key].position;
        }

        let newFieldObj = {
                display_name:"Default Display",
                model_class: fieldType,
                required: false,
                data_name: "Default Data Name",
                slug: "slug",
                help_text: "",
                css_class: "",
                djangoId: null,
                position: maxPos + 1,
                subtype: fieldSubtype,
                form: this.formId
                }

        // textfield
        // HiddenField
        // BooleanField
        // ChoiceField, select, select_multiple, radio_select, checkbox_select_multiple


        if (fieldType === "textfield") {
            console.log("Do something custom with textfield")
        }

        if (fieldType === "hiddenfield") {
            console.log("Do something custom with textfield")
        }

        if (fieldType === "booleanfield") {
            console.log("Do something custom with textfield")
        }

        if (fieldType === "choicefield") {
            console.log("Do something custom with textfield")
        }


        this.addHandlers(newFieldObj, numFields);
        newFieldObj.editActive = true;
        newFields[newFieldObj.key] = newFieldObj;

        this.setState({fields: newFields});
    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-8">


                    <h3>Current Fields for {this.formName}</h3>

                    {Object.values(this.state.fields)
                        .sort((a, b) => a.position - b.position)
                        .map((fieldObj) => this.parseFieldData(fieldObj))}
                </div>

                <div className="col-xs-4">
                    <h3>Add Field</h3>
                    {addPanel(this.addField)}
                </div>

                <div className="col-xs-4" style={{marginTop: "5px"}}>
                    <div className={"btn btn-primary"} onClick={this.handleSave}>Save</div>
                </div>

                <div className="col-xs-4" style={{marginTop: "5px"}}>
                    <p>
                        dragPos: {this.state.dragPos} <br/>
                        dragId: {this.state.dragId} <br/>
                        Fields: {JSON.stringify(this.state.fields)}
                    </p>
                </div>
            </div>

        );
    }
}


const domContainer = document.querySelector('#react-fields');
ReactDOM.render(<Fields/>, domContainer);
