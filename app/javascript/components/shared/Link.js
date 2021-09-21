import React from "react";

const defaultProps = {
  children: [],
  classes: [],
  color: 'text-black',
  href: '#',
  onClick: () => null,
  hoverBgColor: 'hover:bg-white',
  hoverBgOpacity: 'hover:bg-opacity-0',
  hoverColor: 'hover:text-black',
};

const Link = suppliedProps => {
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

export default Link;
