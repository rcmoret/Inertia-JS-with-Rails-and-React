import React from "react";

const Link = suppliedProps => {
  const defaultProps = {
    children: [],
    classes: [],
    color: "text-black",
    href: "#",
    onClick: () => null,
    hoverBgColor: "hover:bg-white",
    hoverBgOpacity: "hover:bg-opacity-0",
    hoverColor: "hover:text-black",
  }
  const props = { ...defaultProps, ...suppliedProps }
  const {
    children,
    classes,
    color,
    hoverBgColor,
    hoverBgOpacity,
    hoverColor,
    href,
    onClick,
  } = props
  const className = [color, hoverBgOpacity, hoverBgColor, hoverColor, ...classes].join(" ")

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  )
};

export const ButtonStyleLink = suppliedProps => {
  const defaultProps = {
    color: "text-white",
    hoverBgColor: "hover:bg-blue-800",
    hoverBgOpacity: null,
    hoverColor: "hover:text-white",
  }

  const { styling, ...props } = suppliedProps
  const defaultStyling = {
    bgColor: "bg-blue-600",
    padding: "p-2",
    rounded: "rounded",
  }

  const classes = Object.values({ ...defaultStyling, ...styling }).filter(val => val && val !== "")

  return (
    <Link {...defaultProps} {...props} classes={classes}/>
  )
};

export default Link;
