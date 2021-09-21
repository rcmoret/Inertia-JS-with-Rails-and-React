import React from "react";

const defaultProps = {
  bgColor: 'bg-gray-800',
  childen: [],
  classes: [],
  color: 'text-white',
  fontWeight: 'font-semibold',
  onClick: () => null,
  onSubmit: () => null,
  hoverBgColor: 'hover:bg-black',
  hoverBgOpacity: 'hover:bg-opacity-1',
  hoverColor: 'hover:text-white',
  padding: 'p-2',
  rounded: 'rounded',
  shadow: 'shadow-md',
  type: 'submit',
};

const Button = suppliedProps => {
  const props = { ...defaultProps, ...suppliedProps }
  const {
    bgColor,
    children,
    classes,
    color,
    fontWeight,
    hoverBgColor,
    hoverBgOpacity,
    hoverColor,
    onClick,
    onSubmit,
    padding,
    rounded,
    shadow,
    type,
  } = props
  const className = [
    bgColor,
    children,
    color,
    fontWeight,
    hoverBgOpacity,
    hoverBgColor,
    hoverColor,
    padding,
    rounded,
    shadow,
    ...classes
  ].join(" ")

  return (
    <button className={className} onClick={onClick} onSubmit={onSubmit}>
      {children}
    </button>
  )
};

export default Button;
