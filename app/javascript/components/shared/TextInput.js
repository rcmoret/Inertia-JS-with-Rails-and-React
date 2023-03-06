import React from "react";

import { Point } from "./symbol";

export const AmountInput = suppliedProps => {
  const defaultProps = {
    border: "border border-gray-400 border-solid",
    rounded: "rounded",
    textAlign: "text-right",
    children: [],
    classes: [],
  }
  const props = {
    ...defaultProps,
    ...suppliedProps,
  }
  const styleFromProps = ({ border, rounded, textAlign }) => [border, rounded, textAlign].filter(style => style !== null)
  const classes = [...props.classes, ...styleFromProps(props)]

  return (
    <TextInput
      {...props}
      classes={classes}
      errors={[]}
    />
  )
}

const TextInput = suppliedProps => {
  const defaultProps = {
    border: "border border-gray-400 border-solid",
    classes: [],
    errors: [],
    label: null,
    name: "",
    onKeyDown: () => null,
    placeholder: "",
    value: "",
  }

  const combinedProps = { ...defaultProps, ...suppliedProps }
  const className = [combinedProps.border, ...combinedProps.classes].filter(klass => klass !== null && klass !== "").join(" ")
  const props = { ...combinedProps, className }

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
  <div className="rounded border-solid border-red-700 border-2 bg-gray-200 p-2">
    <Input className={props.className} onChange={props.onChange} value={props.value} name={props.name} />
    <div className="mt-2 flex flex-wrap">
      {props.errors.map((err, index) => (
        <div key={index} className="text-red-700 w-full" >
          <Point>
            {err}
          </Point>
        </div>
      ))}
    </div>
  </div>
)

const Input = props => (
  <input
    type="text"
    className={props.className}
    name={props.name}
    onChange={props.onChange}
    onKeyDown={props.onKeyDown}
    placeholder={props.placeholder}
    value={props.value}
  />
)

export default TextInput;
