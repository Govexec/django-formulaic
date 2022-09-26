import React, {useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import {toggleEditActive, handleDelete, provisionedFields, optionsLists, setFieldOrder} from "./fieldsSlice";
import {TextInput, CheckboxInput, SelectInput} from "./Inputs";
import {useDrag, useDrop} from 'react-dnd'
import {ItemTypes} from "./ItemTypes";


export function TextField(props) {
    const dispatch = useDispatch();
    const children = [];
    if (props.isDeleted){
        return <div id={props.key} key={props.key}/>
    }

    else if (props.editActive) {
        children.push([
                <div><strong>Sub Type: </strong>{props.subtype}</div>,
                <TextInput label="Display Name" inputId="display_name" value={props.display_name} fieldId={props.key}/>,
                <CheckboxInput label="Required" inputId="required" value={props.required} fieldId={props.key}/>,
                <TextInput label="Data Column Name" inputId="data_name" value={props.data_name} fieldId={props.key}/>,
                <TextInput label="Slug" inputId="slug" value={props.slug} fieldId={props.key}/>,
                <TextInput label="Help Text" inputId="help_text" value={props.help_text} fieldId={props.key}/>,
                <TextInput label="CSS Class" inputId="css_class" value={props.css_class} fieldId={props.key}/>,
                <input type="button" value="Set" className={"btn btn-primary"} data-field-key={props.key}
                       onClick={() => dispatch(toggleEditActive({fieldId: props.key}))}/>,
                ])
    } else {
        children.push([
                <div><strong>Subtype: </strong>{props.subtype}</div>,
                <div><strong>Position: </strong>{props.position}</div>,
                <div><strong>Display Name: </strong>{props.display_name}</div>,
                <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
                <div><strong>Data Column Name: </strong>{props.data_name}</div>,
                <div><strong>Slug: </strong>{props.slug}</div>,
                <div><strong>Help Text: </strong>{props.help_text}</div>,
                <div><strong>CSS Class: </strong>{props.css_class}</div>,
                <div className={"btn btn-primary"} data-field-key={props.key}
                     onClick={() => dispatch(toggleEditActive({fieldId: props.key}))}>Edit
                </div>,
                <div className={"btn btn-danger"} data-field-key={props.key} onClick={() => dispatch(handleDelete({fieldId: props.key}))}
                     data-django-id={props.djangoId}>Delete
                </div>,
            ])
    }

    return formField(props, children);
}


export function BooleanField(props) {

    const dispatch = useDispatch();
    const children = [];

    if (props.isDeleted){
        return <div id={props.key} key={props.key}/>
    }

    else if(props.editActive) {
        children.push([
                <div><strong>Sub Type: </strong>{props.subtype}</div>,
                <TextInput label="Display Name" inputId="display_name" value={props.display_name} fieldId={props.key}/>,
                <CheckboxInput label="Required" inputId="required" value={props.required} fieldId={props.key}/>,
                <CheckboxInput label="Default Checked" inputId="default_checked" value={props.default_checked} fieldId={props.key}/>,
                <TextInput label="Data Column Name" inputId="data_name" value={props.data_name} fieldId={props.key}/>,
                <TextInput label="Slug" inputId="slug" value={props.slug} fieldId={props.key}/>,
                <TextInput label="Help Text" inputId="help_text" value={props.help_text} fieldId={props.key}/>,
                <TextInput label="CSS Class" inputId="css_class" value={props.css_class} fieldId={props.key}/>,
                <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}
                       onClick={() => dispatch(toggleEditActive({fieldId: props.key}))}/>,
                ])
    } else {
        children.push([
                <div><strong>Type: </strong>{props.subtype}</div>,
                <div><strong>Display Name: </strong>{props.display_name}</div>,
                <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
                <div><strong>Default Checked: </strong>{props.default_checked ? "yes" : "no"}</div>,
                <div><strong>Data Column Name: </strong>{props.data_name}</div>,
                <div><strong>Slug: </strong>{props.slug}</div>,
                <div><strong>Help Text: </strong>{props.help_text}</div>,
                <div><strong>CSS Class: </strong>{props.css_class}</div>,
                <div className={"btn btn-primary"} data-field-key={props.key}
                     onClick={() => dispatch(toggleEditActive({fieldId: props.key}))}>Edit
                </div>,
                <div className={"btn btn-danger"} data-field-key={props.key} onClick={() => dispatch(handleDelete({fieldId: props.key}))}
                     data-django-id={props.djangoId}>Delete
                </div>
        ])
    }

    return formField(props, children);
}


export function ChoiceField(props, options) {
    const dispatch = useDispatch();
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

    if (props.isDeleted){
        return <div id={props.key} key={props.key}/>
    }

    else if (props.editActive) {

        children.push([
                <div><strong>Sub Type: </strong>{props.subtype}</div>,
                <TextInput label="Display Name" inputId="display_name" value={props.display_name} fieldId={props.key}/>,
                <CheckboxInput label="Required" inputId="required" value={props.required} fieldId={props.key}/>,
                <TextInput label="Data Column Name" inputId="data_name" value={props.data_name} fieldId={props.key}/>,
                <TextInput label="Slug" inputId="slug" value={props.slug} fieldId={props.key}/>,

                <SelectInput label="Option List" inputId="option_list" value={props.option_list} optionsList={options} fieldId={props.key}/>,
                <SelectInput label="Default Option" inputId="default_option" value={props.default_option} optionsList={defaultOptions} fieldId={props.key}/>,

                <TextInput label="Help Text" inputId="help_text" value={props.help_text} fieldId={props.key}/>,
                <TextInput label="CSS Class" inputId="css_class" value={props.css_class} fieldId={props.key}/>,
                <input type="submit" value="Set" className={"btn btn-primary"} data-field-key={props.key}
                       onClick={() => dispatch(toggleEditActive({fieldId: props.key}))}/>,
                ])
    } else {
        children.push([
                <div><strong>Type: </strong>{props.subtype}</div>,
                <div><strong>Display Name: </strong>{props.display_name}</div>,
                <div><strong>Required: </strong>{props.required ? "yes" : "no"}</div>,
                <div><strong>Data Column Name: </strong>{props.data_name}</div>,
                <div><strong>Slug: </strong>{props.slug}</div>,

                <div><strong>Option List: </strong>{optionsListMap[props.option_list].name}</div>,
                <div><strong>Default Option: </strong>{defaultOptionsMap[props.default_option] ? defaultOptionsMap[props.default_option].name : ""}</div>,

                <div><strong>Help Text: </strong>{props.help_text}</div>,
                <div><strong>CSS Class: </strong>{props.css_class}</div>,
                <div className={"btn btn-primary"} data-field-key={props.key}
                     onClick={() => dispatch(toggleEditActive({fieldId: props.key}))}>Edit
                </div>,
                <div className={"btn btn-danger"} data-field-key={props.key} onClick={() => dispatch(handleDelete({fieldId: props.key}))}
                     data-django-id={props.djangoId}>Delete
                </div>
        ])
    }
    return formField(props, children);
}



function formField(props, children){

    return (
        <form

                style={{borderColor: 'blue', borderStyle: 'dashed', paddingTop: '5px', marginTop: '5px'}}>
            {children}
        </form>)
}


export function parseFieldData(fieldObj, options, moveField) {

    let field;
    let index = fieldObj.position;

    if (fieldObj.model_class === "textfield") {
        field = TextField(fieldObj)
    }

    else if(fieldObj.model_class === "booleanfield"){
           field = BooleanField(fieldObj)
        }

    else if(fieldObj.model_class === "choicefield"){
       field = ChoiceField(fieldObj, options)
    }

    else {
        field =<div>Missing... {fieldObj.model_class} </div>
    }

    // const [{ opacity }, dragRef] = useDrag(
    //     () => ({
    //       type: "formField",
    //       item: fieldObj.fieldId,
    //       collect: (monitor) => ({
    //         opacity: monitor.isDragging() ? 0.5 : 1
    //       })
    //     }),
    //     []
    //   )



  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.position
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveField(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const id = fieldObj.key;
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
        console.log(index);
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0.3 : 1
  drag(drop(ref))

  console.log(isDragging, fieldObj.djangoId, id, index);

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      {field}
    </div>
  )
}
