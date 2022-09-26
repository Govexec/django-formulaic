import React from 'react';
import update from 'immutability-helper'
import { useCallback, useState } from 'react'
import { Card } from './Card.js'
const style = {
  width: 400,
}
import {parseFieldData} from "./Fields"
import {setFieldOrder} from "./fieldsSlice";
import {useDispatch} from 'react-redux';





export const DnDContainer = ({fields, options}) => {
  {

    let newFields = [...fields]
    newFields.sort((a, b) => a.position - b.position)

    // const [cards, setCards] = useState([
    //   {
    //     id: 1,
    //     text: 'Write a cool JS library',
    //   },
    //   {
    //     id: 2,
    //     text: 'Make it generic enough',
    //   },
    //   {
    //     id: 3,
    //     text: 'Write README',
    //   },
    //   {
    //     id: 4,
    //     text: 'Create some examples',
    //   },
    //   {
    //     id: 5,
    //     text: 'Spam in Twitter and IRC to promote it (note that this element is taller than the others)',
    //   },
    //   {
    //     id: 6,
    //     text: '???',
    //   },
    //   {
    //     id: 7,
    //     text: 'PROFIT',
    //   },
    // ])
    //
    const dispatch = useDispatch();
    // dispatch(setFieldOrder({fieldId: props.key}))

    const moveField = useCallback((dragIndex, hoverIndex) => {
      dispatch(setFieldOrder({dragIndex: dragIndex, hoverIndex: hoverIndex}))

      // setCards((prevCards) =>
      //   update(prevCards, {
      //     $splice: [
      //       [dragIndex, 1],
      //       [hoverIndex, 0, prevCards[dragIndex]],
      //     ],
      //   }),
      // )
    }, [])

    const renderCard = useCallback((fieldObj, index) => {

      return parseFieldData(fieldObj, options, moveField)

    }, [])

    return (
      <>
        <div style={style}>{newFields.map((card, i) => renderCard(card, i))}</div>
      </>
    )

  }
}






export const Container = () => {
  {

    const [cards, setCards] = useState([
      {
        id: 1,
        text: 'Write a cool JS library',
      },
      {
        id: 2,
        text: 'Make it generic enough',
      },
      {
        id: 3,
        text: 'Write README',
      },
      {
        id: 4,
        text: 'Create some examples',
      },
      {
        id: 5,
        text: 'Spam in Twitter and IRC to promote it (note that this element is taller than the others)',
      },
      {
        id: 6,
        text: '???',
      },
      {
        id: 7,
        text: 'PROFIT',
      },
    ])

    const moveCard = useCallback((dragIndex, hoverIndex) => {
      setCards((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        }),
      )
    }, [])

    const renderCard = useCallback((card, index) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      )
    }, [])

    return (
      <>
        <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
      </>
    )
  }
}
