import React from "react";

const defaultProps = {
  backgroundColor: 'bg-white',
  border: 'border-b-2',
  borderType: 'border-solid',
  borderColor: 'border-gray-500',
  flex: 'flex',
  flexWrap: 'flex-wrap',
  flexAlign: 'justify-between',
  padding: 'p-2',
  margin: 'mb-2',
  rounded: 'rounded',
  width: 'w-full',
}

export default suppliedProps => {
  const { styling, children } = suppliedProps
  const styles = { ...defaultProps, ...styling }
  const className = Object.values(styles).filter(val => val !== null && val !== "").join(" ")
  return (
    <div className={className}>
      {children}
    </div>
  )
};
