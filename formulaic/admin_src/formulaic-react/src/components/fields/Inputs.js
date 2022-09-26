import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
    provisionedFields,
    initialData
} from './fieldsSlice';
import styles from './Fields.module.css';
import {toggleEditActive, changeInput} from "./fieldsSlice";


export function TextInput(props) {
    const dispatch = useDispatch();
    const onChange = (e) => dispatch(changeInput({
        inputId: props.inputId,
        fieldId: props.fieldId,
        value: e.target.value
    }));

    return (
        <div>
            <label htmlFor={props.id}>{props.label}:</label><br/>
            <input id={props.inputId} type="text" defaultValue={props.value} onChange={onChange}/>
        </div>
    );
}

export function CheckboxInput(props) {
    const dispatch = useDispatch();
    const onChange = (e) => dispatch(changeInput({
        inputId: props.inputId,
        fieldId: props.fieldId,
        value: e.target.checked
    }));

    return (
        <div>
            <label htmlFor={props.id}>{props.label}:</label><br/>
            <input id={props.inputId} type="checkbox" defaultChecked={props.value} onChange={onChange}/>
        </div>
    );
}

export function SelectInput(props) {

    const dispatch = useDispatch();
    const onChange = (e) => dispatch(changeInput({
        inputId: props.inputId,
        fieldId: props.fieldId,
        value: e.target.value
    }));

    return (
        <div>
            <label htmlFor={props.id}>{props.label}:</label><br/>
            <select id={props.inputId} defaultValue={props.value} onChange={onChange}>
                {props.optionsList.map((option, key) => (
                    <option value={option.id}>{option.name}</option>
                ))}
            </select>
        </div>
    );
}

