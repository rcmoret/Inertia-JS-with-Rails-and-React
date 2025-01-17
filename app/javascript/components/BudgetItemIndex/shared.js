import React from "react";

import { router } from "@inertiajs/react";

import { AmountInput } from "../shared/TextInput";
import AmountSpan from "../shared/AmountSpan";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row from "../shared/Row";

import { isMatureAccrual } from "../../lib/Functions";
import { postItemDeleteEvent } from "./Functions"
import { fromDateString } from "../../lib/DateFormatter";
import { index as copy } from "../../lib/copy/budget";

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

export const NameRow = ({ model, fns, month, year }) => {
  const {
    key,
    amount,
    iconClassName,
    name,
    showDetails,
  } = model
  const toggleDetail = () => showDetails ? fns.collapseDetails(key) : fns.showDetails(key)
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
    </Cell>
  )
}

export const FormRow = ({ handleChange, hideForm, inputAmount, postEvent }) => (
  <Cell styling={{width: "w-full", wrap: "flex-wrap", padding: "pl-1 pr-1"}}>
    <div className="w-full md:w-6/12"> <strong>Amount:</strong> </div>
    <div className="w-8/12 md:w-4/12">
      <AmountInput value={inputAmount} onChange={handleChange} classes={["max-md:w-full"]} />
    </div>
    <Cell styling={{width: "w-2/12 md:w-1/12"}}>
      <Link onClick={postEvent} color="text-green-700" hoverColor="text-green-900">
        <Icon className="fas fa-check-circle" />
      </Link>
      <Link onClick={hideForm} color="text-red-700" hoverColor="text-red-900">
        <Icon className="fas fa-times-circle" />
      </Link>
    </Cell>
  </Cell>
)

export const Links = ({ model, fns, month, year }) => {
  const { key, name, showForm, isDeletable } = model

  return (
    <Cell styling={{width: "w-full", justify: "justify-between md:justify-end", fontSize: "text-sm md:text-xs"}}>
      <EditLink itemKey={key} fns={fns} showForm={showForm} />
      <span className="md:ml-4">
        <DeleteLink itemKey={key} name={name} isDeletable={isDeletable} fns={fns} month={month} year={year}/>
      </span>
    </Cell>
  )
}

const EditLink = ({ itemKey, fns, showForm }) => {
  const editFn = () => fns.renderForm(itemKey)

  if (showForm) {
    return (
      <span className="text-gray-500 ">
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

const DeleteLink = ({ itemKey, isDeletable, fns, name, month, year }) => {
  const onClick = () => {
    if(window.confirm(copy.deleteConfirmation(name))) {
      postItemDeleteEvent({ itemKey, month, year })
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

export  const AccrualMaturityInfo = ({ model, fns, month, year }) => {
  if (!model.isAccrual || isMatureAccrual(model, month, year)) {
    return null
  } else {
    const { budgetCategorySlug, maturityMonth, maturityYear } = model
    const copy = maturityMonth ? `Maturing ${maturityMonth}/${maturityYear}` : "No upcoming maturity date"
    const returnUrl = `/budget/${month}/${year}`
    const post = () => router.post(`/budget/categories/${budgetCategorySlug}/maturity_intervals?redirect_to=${returnUrl}`,
      { interval: { month, year } },
    )

    return (
      <Row>
        <Cell styling={{width: "w-6/12", padding: "pl-1 pr-1"}}>
          <span className="italic">{copy}</span>
        </Cell>
        <div className="w-6/12 pl-1 pr-1 italic text-right">
          <Link color="text-blue-700" onClick={post}>
            Mark as mature for {month}/{year}
          </Link>
        </div>
     </Row>
    )
  }
}
