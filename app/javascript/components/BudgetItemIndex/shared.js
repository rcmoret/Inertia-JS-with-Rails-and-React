import React from "react";

import { AmountInput } from "../shared/TextInput";
import AmountSpan from "../shared/AmountSpan";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row from "../shared/Row";

import { fromDateString } from "../../lib/DateFormatter";
import { index as copy } from " ../../lib/copy/budget"

export const TransactionDetail = ({ model, ...suppliedProps }) => {
  const props = {
    children: [],
    ...suppliedProps,
  }
  const {
    accountName,
    amount,
    clearanceDate,
    description,
    iconClassName,
    isPending
  } = model

  return (
    <Row styling={{wrap: "flex-wrap", rounded: null, fontSize: "text-sm", border: "border-b border-gray-500 border-solid"}}>
      <div className="w-3/12">
        <div>{clearanceDate}</div>
        <div className="text-sm">{accountName}</div>
      </div>
      <div className="w-6/12">
        {description}
        {" "}
        {iconClassName && <Icon className={iconClassName} />}
      </div>
      <div className="w-3/12 text-right">
        <AmountSpan amount={amount} />
      </div>
      {props.children}
    </Row>
  )
};

export const NameRow = ({ model, fns }) => {
  const {
    id,
    amount,
    iconClassName,
    name,
    showDetails,
  } = model
  const toggleDetail = () => showDetails ? fns.collapseDetails(id) : fns.showDetails(id)
  const caretClassName = showDetails ? "fas fa-caret-down" : "fas fa-caret-right"

  return (
    <Cell styling={{width: "w-full", padding: "pl-1 pr-1"}}>
      <div className="w-6/12">
        <Link onClick ={toggleDetail} color="text-blue-800" hoverColor="text-blue-800">
          <span className="text-sm">
            <Icon className={caretClassName} />
          </span>
          {" "}
          <span className="underline">
            {name}
          </span>
        </Link>
        {" "}
        <span>
          <Icon className={iconClassName} />
        </span>
      </div>
      <div className="w-4/12 text-right">
        <AmountSpan amount={amount} absolute={true} />
      </div>
      <Links model={model} fns={fns} />
    </Cell>
  )
}

export const FormRow = ({ handleChange, hideForm, inputAmount, postEvent }) => (
  <Cell styling={{width: "w-full", padding: "pl-1 pr-1"}}>
    <div className="w-6/12">
      Updated Amount
    </div>
    <div className="w-4/12 text-right">
      <AmountInput value={inputAmount} onChange={handleChange} />
    </div>
    <Cell styling={{width: "w-1/12"}}>
      <Link onClick={postEvent} color="text-green-700" hoverColor="text-green-900">
        <Icon className="fas fa-check-circle" />
      </Link>
      <Link onClick={hideForm} color="text-red-700" hoverColor="text-red-900">
        <Icon className="fas fa-times-circle" />
      </Link>
    </Cell>
  </Cell>
)

export const Links = ({ model, fns }) => {
  const { id, showForm, isDeletable } = model

  return (
    <Cell styling={{width: "w-1/12", fontSize: "text-xs"}}>
      <EditLink id={id} fns={fns} showForm={showForm} />
      <DeleteLink id={id} name={model.name} isDeletable={isDeletable} fns={fns} />
    </Cell>
  )
}

const EditLink = ({ id, fns, showForm }) => {
  const editFn = () => fns.renderForm(id)

  if (showForm) {
    return (
      <span className="text-gray-500">
        <Icon className="far fa-edit" />
      </span>
    )
  } else {
    return (
      <Link onClick={editFn} color="text-blue-800" hoverColor="text-blue-800">
        <Icon className="far fa-edit" />
      </Link>
    )
  }
}

const DeleteLink = ({ id, isDeletable, fns, name }) => {
  const onClick = () => {
    if(window.confirm(copy.deleteConfirmation(name))) {
      fns.postItemDeleteEvent(id)
    } else {
      return null
    }
  }

  if (isDeletable) {
    return (
      <Link onClick={onClick} color="text-blue-800" hoverColor="text-blue-800">
        <Icon className="fa fa-trash" />
      </Link>
    )
  } else {
    return (
      <span className="text-gray-500">
        <Icon className="fa fa-trash" />
      </span>
    )
  }
}