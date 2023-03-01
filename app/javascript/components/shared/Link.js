import React from "react";

import { router } from "@inertiajs/react";

const Link = suppliedProps => {
  const defaultProps = {
    children: [],
    classes: [],
    color: "text-black",
    href: "#",
    onClick: () => null,
    hoverBgColor: "hover:bg-white",
    hoverBgOpacity: "hover:bg-opacity-0",
    target: "",
    // hoverColor: "hover:text-black",
  }
  const props = { ...defaultProps, ...suppliedProps }
  const {
    children,
    classes,
    color,
    hoverBgColor,
    hoverBgOpacity,
    href,
    onClick,
    target,
  } = props
  const hoverColor = props.hoverColor || props.color
  const className = [color, hoverBgOpacity, hoverBgColor, hoverColor, ...classes].join(" ")

  return (
    <a href={href} className={className} onClick={onClick} target={target}>
      {children}
    </a>
  )
};

export const ButtonStyleInertiaLink = suppliedProps => {
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
    <InertiaLink {...defaultProps} {...props} classes={classes} />
  )
};

export const InertiaLink = ({ href, ...suppliedProps }) => {
  const props = { onClick: () => null, ...suppliedProps }
  const onClick = event => {
    event.preventDefault()
    props.onClick(event)
    router.get(href)
  }
  return (
    <Link onClick={onClick} href={href} {...suppliedProps} />
  )
}

export default Link;
