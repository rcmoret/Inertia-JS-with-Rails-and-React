import React from "react";

const defaultProps = {
  bgColor: null,
  border: null,
  borderColor: null,
  borderType: null,
  bottom: null,
  classes: [],
  color: null,
  flex: null,
  flexJustify: null,
  fontSize: null,
  height: null,
  left: null,
  margin: null,
  padding: null,
  position: null,
  rounded: null,
  right: null,
  shadow: null,
  textAlign: null,
  textDecoration: null,
  top: null,
  width: null,
  zIndex: null,
}

const StyledDiv = suppliedProps => {
  const props = { ...defaultProps, ...suppliedProps }
  const {
    bgColor,
    border,
    borderColor,
    borderType,
    bottom,
    classes,
    color,
    flex,
    flexJustify,
    fontSize,
    height,
    left,
    margin,
    padding,
    position,
    right,
    rounded,
    shadow,
    textAlign,
    textDecoration,
    top,
    width,
    zIndex,
  } = props
  const className = [
    bgColor,
    border,
    borderColor,
    borderType,
    bottom,
    color,
    flex,
    flexJustify,
    fontSize,
    height,
    left,
    margin,
    padding,
    position,
    right,
    rounded,
    shadow,
    textAlign,
    textDecoration,
    top,
    width,
    zIndex,
    ...classes
  ].filter(klass => klass !== null).join(' ')

  return (
    <div className={className}>{props.children}</div>
  )
}

export default StyledDiv
