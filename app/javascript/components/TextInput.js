import React, { useState } from "react";
import { Exclamation } from "./Icons"

const TextInput = props => {
  if (props.errors.length > 0) {
    return (
      <ErrorInput {...props} />
    )

  } else {
    return (
      <div className='p-2 rounded'>
        <Label {...props} />
        <Input onChange={props.onChange} value={props.value} />
      </div>
    )
  }
};

const ErrorInput = props => (
  <div className='rounded border-solid border-red-400 border-2 bg-gray-200 p-2'>
    <Label {...props} />
    <Input onChange={props.onChange} value={props.value}/>
    <div className='mt-2'>
      {props.errors.map((err, index) => (
        <span key={index} className='text-red-700' >
          <Exclamation className='text-red-700' />
          {' '}
          {err}
        </span>
      ))}
    </div>
  </div>
)

const Label = props => {
  if (props.label) {
    return (
      <label>{props.label}</label>
    )
  } else {
    return null
  }
}
const Input = props => (
  <input className='border-solid border-gray-500 border-2 rounded' type='text' onChange={props.onChange} value={props.value} />
)

export default TextInput;
