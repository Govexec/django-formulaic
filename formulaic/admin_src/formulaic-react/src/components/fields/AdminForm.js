import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
    provisionedFields,
    initialData,
    addField, optionsLists, confirmedFields
} from './fieldsSlice';
import styles from './Fields.module.css';
import {parseFieldData} from "./Fields"
import {saveForm} from "./fieldsAPI";
import {DndContext, DndProvider} from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend'
import {Container, DnDContainer} from "./Container";


function addPanelButton(text, fieldType, fieldSubtype) {
    const dispatch = useDispatch();
    const onClick = () => dispatch(addField({
        fieldType: fieldType,
        fieldSubtype: fieldSubtype
    }))
    return (
        <div className={"btn btn-primary btn-add-field"} onClick={onClick}>{text}</div>
    )
}

function addPanel() {
    return (
        <div style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>


            {addPanelButton("TextField (Single Line)", "textfield", "text")}
            {addPanelButton("TextField (Multi Line)", "textfield", "textarea")}
            {addPanelButton("Dropdown List", "choicefield","select")}
            {addPanelButton("Radio List", "choicefield","radio_select")}
            {addPanelButton("Checkbox List", "choicefield","select_multiple")}
            {addPanelButton("Checkbox", "booleanfield","checkbox")}
            {addPanelButton("Multi-select List", "choicefield","checkbox_select_multiple")}
            {/*{addPanelButton("Hidden Field", "textfield","text", addCallback)}*/}

            <hr style={{"opacity": "50%"}}/>

            {addPanelButton("Full Name", "textfield", "full_name")}
            {addPanelButton("Email", "textfield", "email")}
            {addPanelButton("Phone Number", "textfield", "phone_number")}
            {addPanelButton("Integer", "textfield", "integer")}

        </div>
    );
}



export function AdminForm() {
    const provisionedF = useSelector(provisionedFields);
    const confirmedF = useSelector(confirmedFields);
    const initialD = useSelector(initialData);
    const options = useSelector(optionsLists);

    const formId = initialD.id;

    return (
        <div className="row">
            <div className="col-xs-8">
                <h3>Current Fields for {initialD.name}</h3>
                {/*<DndProvider backend={HTML5Backend}>*/}
                <DndProvider backend={HTML5Backend}>
                    <DnDContainer fields={provisionedF} options={options}/>

                    {/*{provisionedF.map((fieldObj) => parseFieldData(fieldObj, options))}*/}
                </DndProvider>
                {/*</DndProvider>*/}
            </div>

            <div className="col-xs-8">
            <DndProvider backend={HTML5Backend}>
                <Container/>
				</DndProvider>
            </div>

            <div className="col-xs-4">
                <h3>Add Field</h3>
                {addPanel()}
            </div>

            <div className="col-xs-4" style={{marginTop: "5px"}}>
                <div className={"btn btn-primary"} onClick={() => saveForm(confirmedF, formId)}>Save Form</div>
            </div>

            {/*<div className="col-xs-4" style={{marginTop: "5px"}}>*/}
            {/*    <p>*/}
            {/*        TO DELETE: {to_delete.map((s) =>  s + ", " )}*/}
            {/*        /!*dragPos: {this.state.dragPos} <br/>*!/*/}
            {/*        /!*dragId: {this.state.dragId} <br/>*!/*/}
            {/*        /!*Fields: {JSON.stringify(this.state.fields)}*!/*/}
            {/*    </p>*/}
            {/*</div>*/}
        </div>
    );

}
