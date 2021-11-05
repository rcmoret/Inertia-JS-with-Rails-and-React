import React from "react";

const defaultStyles = {
  flex: 'flex',
  flexAlign: 'justify-between',
  overflow: 'overflow-hidden',
  padding: 'p-1',
  rounded: 'rounded',
  width: 'w-full',
}

export const Row = suppliedProps => {
  const { styling, children } = suppliedProps
  const styles = { ...defaultStyles, ...styling }
  const className = Object.values(styles).filter(val => val !== null && val !== "").join(" ")
  return (
    <div className={className}>
      {children}
    </div>
  )
};

export const StripedRow = suppliedProps => {
  const defaultStripes = { evenColor: 'white', oddColor: 'gray-200' }
  const { evenColor, oddColor, ...props } = suppliedProps
  const stripedColors = {
    evenColor: (suppliedProps.evenColor || defaultStripes.evenColor),
    oddColor: (suppliedProps.oddColor || defaultStripes.oddColor),
  }
  const stripedStyle = {
    backgroundColor: `odd:bg-${stripedColors.oddColor} even:bg-${stripedColors.evenColor}`
  }

  return (
    <Row {...props} styling={stripedStyle} />
  )
};

export const TitleRow = suppliedProps => {
  const titleProps = {
    fontSize: 'text-xl',
    fontWeight: 'font-semibold',
    margin: 'mb-1',
    padding: 'pt-2 pb-2 pl-1 pr-1',
    textDecoration: 'underline',
  }
  const { styling, ...props } = suppliedProps
  const titleStyles = { ...titleProps, ...styling }

  return (
    <Row {...props} styling={titleStyles} />
  )
}

export default Row;
