import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const defaultProps = {
  className: ''
}

export const Exclamation = (suppliedProps = {}) => {
  const props = { ...defaultProps, ...suppliedProps  }
  return (
    <span className={props.className}>
      <FontAwesomeIcon icon={faExclamationCircle} />
    </span>
  )
}
