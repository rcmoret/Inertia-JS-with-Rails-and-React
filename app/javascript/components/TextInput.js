import React, { useState } from "react";

const TextInput = props => {
  console.log(props.value)
  if (props.errors.length > 0) {
    return (
      <ErrorInput {...props} />
    )

  } else {
    return (
      <div>
        <Label {...props} />
        <Input onChange={props.onChange} value={props.value} />
      </div>
    )
  }
};

const ErrorInput = props => (
  <div className='border-solid border-red-400 border-2 bg-gray-400'>
    <Label {...props} />
    <Input onChange={props.onChange} value={props.value}/>
    <ul>
      {props.errors.map((err, index) => (
        <li key={index}>{err}</li>
      ))}
    </ul>
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
  <input type='text' onChange={props.onChange} value={props.value} />
)

export default TextInput;
