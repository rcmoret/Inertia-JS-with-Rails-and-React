import React from "react";

const defaultStyles = {
  flex: 'flex',
  flexAlign: 'justify-between',
  overflow: 'overflow-hidden',
  padding: 'p-1',
}

export default suppliedProps => {
  const { styling, children } = suppliedProps
  const styles = { ...defaultStyles, ...styling }
  const className = Object.values(styles).filter(val => val !== null && val !== "").join(" ")
  return (
    <div className={className}>
      {children}
    </div>
  )
};

