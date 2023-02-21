import React from "react";

const defaultProps = {
  className: ''
};

const Icon = (suppliedProps = {}) => {
  const props = { ...defaultProps, ...suppliedProps  }
  return (
    <span {...props} />
  )
};

export default Icon;
