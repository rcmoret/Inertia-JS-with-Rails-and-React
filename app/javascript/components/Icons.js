import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

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

export const PlusCircle = (suppliedProps = {}) => {
  const props = { ...defaultProps, ...suppliedProps  }
  return (
    <span className={props.className}>
      <FontAwesomeIcon icon={faPlusCircle} />
    </span>
  )
}
