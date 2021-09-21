import React, { useState } from "react";

const defaultProps = {
  className: '',
  errors: [],
  label: null,
  placeholder: '',
  value: '',
}

const TextInput = suppliedProps => {
  const props = { ...defaultProps, ...suppliedProps }
  if (props.errors.length > 0) {
    return (
      <ErrorInput {...props} />
    )

  } else {
    return (
      <Input {...props} />
    )
  }
};

const ErrorInput = props => (
  <div className='rounded border-solid border-red-400 border-2 bg-gray-200 p-2'>
    <Input onChange={props.onChange} value={props.value}/>
    <div className='mt-2'>
      {props.errors.map((err, index) => (
        <span key={index} className='text-red-700' >
          {' '}
          {err}
        </span>
      ))}
    </div>
  </div>
)

const Input = props => (
  <input
  type='text'
  className={props.className}
  onChange={props.onChange}
  value={props.value}
  />
)

export default TextInput;

