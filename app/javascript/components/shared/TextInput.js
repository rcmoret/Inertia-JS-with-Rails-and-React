import React from "react";

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
  const className = [...props.classes, ...styleFromProps(props)].join(" ")

  return (
    <TextInput
      className={className}
      errors={[]}
      {...props}
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

  const combinedProps = { ...defaultProps, ...suppliedProps, className }
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
  <div className="rounded border-solid border-red-400 border-2 bg-gray-200 p-2">
    <Input onChange={props.onChange} value={props.value}/>
    <div className="mt-2">
      {props.errors.map((err, index) => (
        <span key={index} className="text-red-700" >
          {" "}
          {err}
        </span>
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
