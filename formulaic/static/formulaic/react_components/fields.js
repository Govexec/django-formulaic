'use strict';

const e = React.createElement;

class TextField extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displayName: props.displayName,
            required: props.required,
            dataColumnName: props.dataColumnName,
            slug: props.slug,
            helpText: props.helpText,
            cssClass: props.cssClass,

            position: props.position,
            djangoId: props.djangoId,

            subtype: props.subtype,
            editActive: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleChange(event) {
        let stateName = event.target.getAttribute("data-state-name")
        // console.log(event.target.value);

        // console.log(event.target);

        if(event.target.getAttribute("type") === "checkbox"){
            console.log("Setting the state to be",  event.target.checked)
            this.setState({[stateName]: event.target.checked})
        }else {
            this.setState({[stateName]: event.target.value})
        }
    }

    handleEdit(event) {
        this.setState({editActive: !this.state.editActive})
    }

    handleDelete(event) {
        console.log("delete delete delete...")
    }

    render() {
        if(this.state.editActive){
            return (
                <div style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>
                    <div><strong>Sub Type: </strong>{this.state.subtype}</div>

                    <TextInput label="Display Name" stateName="displayName" value={this.state.displayName} onChange={this.handleChange}/>
                    <CheckboxInput label="Required" stateName="required" value={this.state.required} onChange={this.handleChange}/>
                    <TextInput label="Data Column Name" stateName="dataColumnName" value={this.state.dataColumnName} onChange={this.handleChange}/>
                    <TextInput label="Slug" stateName="slug" value={this.state.slug} onChange={this.handleChange}/>
                    <TextInput label="Help Text" stateName="helpText" value={this.state.helpText} onChange={this.handleChange}/>
                    <TextInput label="CSS Class" stateName="cssClass" value={this.state.cssClass} onChange={this.handleChange}/>

                    <div className={"btn btn-primary"} onClick={this.handleEdit}>Set</div>
                </div>
            );

        }else{
            return (
                <div style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>
                    <div><strong>Type: </strong>{this.state.subtype}</div>
                    <div><strong>Display Name: </strong>{this.state.displayName}</div>
                    <div><strong>Required: </strong>{this.state.required ? "yes" : "no"}</div>
                    <div><strong>Data Column Name: </strong>{this.state.dataColumnName}</div>
                    <div><strong>Slug: </strong>{this.state.slug}</div>
                    <div><strong>Help Text: </strong>{this.state.helpText}</div>
                    <div><strong>CSS Class: </strong>{this.state.cssClass}</div>

                    <div className={"btn btn-primary"} onClick={this.handleEdit}>Edit</div>
                    <div className={"btn btn-danger"} onClick={this.handleDelete}>Delete</div>
                </div>
            );
        }
    }
}


function TextInput(props) {
    return (
        <div>
            <label>{props.label}:</label><br/>
            <input type="text" defaultValue={props.value} onChange={props.onChange} data-state-name={props.stateName}/>
        </div>
    );
}

function CheckboxInput(props) {
    return (
        <div>
            <label>{props.label}:</label><br/>
            <input type="checkbox" checked={props.value} onChange={props.onChange} data-state-name={props.stateName}/>
        </div>
    );
}


function addPanelButton(text, fieldType, fieldSubtype, addCallback){
    return(
        <div data-field-type={fieldType} data-field-subtype={fieldSubtype} className={"btn btn-primary btn-add-field"} onClick={addCallback}>{text}</div>
    )

}

function addPanel(addCallback){
    return (
            <div style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>


                {addPanelButton("TextField (Single Line)", "textfield","text", addCallback)}
                {addPanelButton("TextField (Multi Line)", "textfield","textarea", addCallback)}
                {/*{addPanelButton("Dropdown List", "textfield","text", addCallback)}*/}
                {/*{addPanelButton("Radio List", "textfield","text", addCallback)}*/}
                {/*{addPanelButton("Checkbox List", "textfield","text", addCallback)}*/}
                {/*{addPanelButton("Checkbox", "textfield","text", addCallback)}*/}
                {/*{addPanelButton("Multi-select List", "textfield","text", addCallback)}*/}
                {/*{addPanelButton("Hidden Field", "textfield","text", addCallback)}*/}

                <hr style={{"opacity": "50%"}}/>

                {addPanelButton("Full Name", "textfield","full_name", addCallback)}
                {addPanelButton("Email", "textfield","email", addCallback)}
                {addPanelButton("Phone Number", "textfield","phone_number", addCallback)}
                {addPanelButton("Integer", "textfield","integer", addCallback)}

            </div>
        );
}


function parseFieldData(fieldObj){

    if (fieldObj["model_class"] === "textfield"){
        return <TextField
            displayName={fieldObj.display_name}
            required={fieldObj.required}
            dataColumnName={fieldObj.data_name}
            slug={fieldObj.slug}
            helpText={fieldObj.help_text}
            cssClass={fieldObj.css_class}
            editActive={false}

            djangoId={fieldObj.id}

            position={fieldObj.position}

            subtype={fieldObj.subtype}

            />

    }

    return <div>Missing...</div>
}


class Fields extends React.Component {
    constructor(props) {
        super(props);

        let initialData = this.getInitialData();

        let formFields = [];
        initialData["fields"].map((element) => { formFields.push(parseFieldData(element)) })

        this.formName = initialData["name"]

        this.state = {
            fields: formFields,
            toDelete: []
        }

        this.addField = this.addField.bind(this);
    }

    getInitialData(){
        // Reads from local state.
        // Todo: Use (conditionally) the API
        let dataDiv = document.querySelectorAll('#initial-data')
        let jsonData = dataDiv[0].getAttribute("data-initial-data")
        return JSON.parse(jsonData);
    }

    addField(event){

        let newFields = [... this.state.fields];

        let fieldType = event.target.getAttribute("data-field-type")
        let fieldSubtype = event.target.getAttribute("data-field-subtype")

        if(fieldType === "textfield"){
            newFields.push(

                <TextField
                    displayName="Default Display"
                    required={false}
                    dataColumnName="Default Column Name"
                    slug="slug"
                    helpText=""
                    cssClass=""

                    editActive={true} // By default have this be on top.

                    djangoId={null}

                    position={100}
                    subtype={fieldSubtype}
            />
            )
        }

        this.setState({fields: newFields});

    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-8">
                    <h3>Current Fields for {this.formName}</h3>

                    {this.state.fields.map(function (field, i) {
                        return <div key={i}>{field}</div>;
                    })}
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
