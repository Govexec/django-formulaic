'use strict';

const e = React.createElement;


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
            {/*{addPanelButton("Dropdown List", "textfield","text", addCallback)}*/}
            {/*{addPanelButton("Radio List", "textfield","text", addCallback)}*/}
            {/*{addPanelButton("Checkbox List", "textfield","text", addCallback)}*/}
            {/*{addPanelButton("Checkbox", "textfield","text", addCallback)}*/}
            {/*{addPanelButton("Multi-select List", "textfield","text", addCallback)}*/}
            {/*{addPanelButton("Hidden Field", "textfield","text", addCallback)}*/}

            <hr style={{"opacity": "50%"}}/>

            {addPanelButton("Full Name", "textfield", "full_name", addCallback)}
            {addPanelButton("Email", "textfield", "email", addCallback)}
            {addPanelButton("Phone Number", "textfield", "phone_number", addCallback)}
            {addPanelButton("Integer", "textfield", "integer", addCallback)}

        </div>
    );
}


function parseFieldData(fieldObj, handleDragStart) {
    if (fieldObj["model_class"] === "textfield") {
        return TextField(fieldObj)
    }

    return <div>Missing...</div>
}

function TextField(props) {

    // If the state of the field is deleted, just don't show anything.
    if (props.isDeleted) {
        return <div id={props.key} key={props.key}/>
    } else if (props.editActive) {
        return (
            <form
                id={props.key}
                key={props.key}
                onSubmit={props.handleSet}
                data-pos={props.position}
                onDragOver={props.handleDragOver}
                style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>
                <div><strong>Sub Type: </strong>{props.subtype}</div>
                <TextInput label="Display Name" id="display_name" value={props.display_name} onChange={props.handleInputChange}/>
                <CheckboxInput label="Required" id="required" value={props.required} onChange={props.handleInputChange}/>
                <TextInput label="Data Column Name" id="data_name" value={props.data_name} onChange={props.handleInputChange}/>
                <TextInput label="Slug" id="slug" value={props.slug} onChange={props.handleInputChange}/>
                <TextInput label="Help Text" id="help_text" value={props.help_text} onChange={props.handleInputChange}/>
                <TextInput label="CSS Class" id="css_class" value={props.css_class} onChange={props.handleInputChange}/>

                {/*<div className={"btn btn-warning"} data-field-key={props.key} onClick={props.handleEdit}>Cancel</div>*/}
                <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}/>
                {/*<div className={"btn btn-primary"} data-field-key={props.key} onClick={props.handleEdit}>Set</div>*/}
            </form>
        );

    } else {
        return (
            <div
                id={props.key}
                key={props.key}
                draggable={true}
                onDragStart={props.handleDragStart}
                data-pos={props.position}
                onDragOver={props.handleDragOver}
                style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>
                <div><strong>Type: </strong>{props.subtype}</div>
                <div><strong>Display Name: </strong>{props.display_name}</div>
                <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>
                <div><strong>Data Column Name: </strong>{props.data_name}</div>
                <div><strong>Slug: </strong>{props.slug}</div>
                <div><strong>Help Text: </strong>{props.help_ext}</div>
                <div><strong>CSS Class: </strong>{props.css_class}</div>

                <div className={"btn btn-primary"} data-field-key={props.key} onClick={props.handleEdit}>Edit</div>
                <div className={"btn btn-danger"} data-field-key={props.key} onClick={props.handleDelete}
                     data-django-id={props.djangoId}>Delete
                </div>
            </div>
        );
    }
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

        let initialData = this.getInitialData();

        let formFields = [...initialData["fields"]];
        formFields = formFields.sort((a, b) => a.position - b.position)

        formFields.forEach((fieldObj, i) => {
            fieldObj.key = "field-" + i;
            fieldObj.editActive = false;
            fieldObj.isDeleted = false;
            fieldObj.handleEdit = this.handleFieldEdit;
            fieldObj.handleSet = this.handleFieldSet;
            fieldObj.handleDelete = this.handleFieldDelete;
            fieldObj.handleInputChange = this.handleInputChange;
            fieldObj.handleDragStart = this.handleFieldDragStart;
            fieldObj.handleDragOver = this.handleFieldDragOver;

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
        const pos = event.target.getAttribute("data-pos");
        if(pos !== null) this.setState({dragPos: pos})
    }

    getInitialData() {
        // Reads from local state.
        // Todo: Use (conditionally) the API
        let dataDiv = document.querySelectorAll('#initial-data')
        let jsonData = dataDiv[0].getAttribute("data-initial-data")
        return JSON.parse(jsonData);
    }

    addField(event) {

        let newFields = [...this.state.fields];

        let fieldType = event.target.getAttribute("data-field-type")
        let fieldSubtype = event.target.getAttribute("data-field-subtype")


        let maxPos = 0;
        newFields.forEach((field) => {
                if (field.props.position > maxPos) maxPos = field.props.position;
            }
        )
        if (fieldType === "textfield") {
            newFields.push(
                <TextField
                    displayName="Default Display"
                    required={false}
                    dataColumnName="Default Column Name"
                    slug="slug"
                    helpText=""
                    cssClass=""

                    editActive={true} // By default have this be true.

                    djangoId={null}

                    position={maxPos + 1}
                    subtype={fieldSubtype}
                    key={"field-" + newFields.length}
                    id={"field-" + newFields.length}

                    handleDragStart={this.handleDragStart}
                />
            )
        }

        newFields = newFields.sort((a, b) => a.props.position - b.props.position)

        this.setState({fields: newFields});

    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-8">
                    <p>
                        dragPos: {this.state.dragPos} <br/>
                        dragId: {this.state.dragId}
                    </p>

                    <h3>Current Fields for {this.formName}</h3>

                    {Object.values(this.state.fields).map((fieldObj) => parseFieldData(fieldObj))}
                </div>

                <div className="col-xs-4">
                    <h3>Add Field</h3>
                    {addPanel(this.addField)}
                </div>
            </div>
        );
    }
}


const domContainer = document.querySelector('#react-fields');
ReactDOM.render(<Fields/>, domContainer);
