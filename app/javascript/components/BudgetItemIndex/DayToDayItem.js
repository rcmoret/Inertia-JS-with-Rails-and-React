import React, { useState } from "react";
import { StripedRow } from "../shared/Row"

import { decimalToInt } from "../../lib/MoneyFormatter";
import { shared } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions";

import { eventAndTransactionDetailSort, eventTransactionReducer } from "./Functions";

import AmountSpan from "../shared/AmountSpan";
import BudgetItemDetails from "./ItemDetails";
import Icon from "../shared/Icons";
import Cell from "../shared/Cell";
import { FormRow, NameRow, Links } from "./shared";
import Link from "../shared/Link";

const DayToDayItem = ({ model, fns }) => {
  const details = [
    ...model.events,
    ...model.transactionDetails,
  ].sort(eventAndTransactionDetailSort)
  .reduce(eventTransactionReducer, [])

  if (model.showForm) {
    return (
      <Form  model={model} fns={fns} details={details} />
    )
  } else {
    return (
      <Show model={model} fns={fns} details={details} />
    )
  }
}

const Form = ({ model, fns, details }) => {
  const {
    id,
    amount,
    inputAmount,
    isExpense,
    showDetails,
    spent,
  } = model
  const handleChange = event => {
    fns.updateItem(id, { inputAmount: event.target.value, updateAmount: decimalToInt(event.target.value) })
  }
  const updateAmount = model.updateAmount === null ? amount : model.updateAmount
  const updatedRemaining = (updateAmount - spent) * -1
  const hideForm = () => fns.closeForm()
  const postEvent = () => fns.postItemAdjustEvent(id, updateAmount)

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <NameRow model={model} fns={fns} />
      <FormRow
        handleChange={handleChange}
        hideForm={hideForm}
        inputAmount={inputAmount}
        postEvent={postEvent}
      />
      <SpentOrDeposited isExpense={isExpense} spent={spent} />
      <DifferenceOrRemaining {...model} />
      <Cell styling={{width: "w-full", padding: "pl-1 pr-1"}}>
        <div className="w-6/12">
          Updated Remaining/Difference
        </div>
        <div className="w-4/12 text-right italic">
          <AmountSpan amount={updatedRemaining} absolute={true} color="text-gray-700" negativeColor="text-red-400" />
        </div>
        <div className="w-1/12">
        </div>
      </Cell>
      {showDetails && <BudgetItemDetails id={id} details={details} />}
     </StripedRow>
  )
}

const Show = ({ model, fns, details }) => {
  const {
    id,
    isExpense,
    showDetails,
    spent,
  } = model

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <NameRow model={model} fns={fns} />
      <SpentOrDeposited isExpense={isExpense} spent={spent} />
      <DifferenceOrRemaining {...model} />
      {showDetails && <BudgetItemDetails id={id} details={details} />}
     </StripedRow>
  )
};

const SpentOrDeposited = ({ isExpense, spent }) => {
  const spentOrDeposited = isExpense ? shared.spent : shared.deposited

  return (
    <Cell styling={{width: "w-full", padding: "pl-1 pr-1"}}>
      <div className="w-6/12">
        {titleize(spentOrDeposited)}
      </div>
      <div className="w-4/12 text-right">
        <AmountSpan amount={spent} absolute={true} prefix="-" />
      </div>
      <div className="w-1/12">
      </div>
    </Cell>
  )
}

const DifferenceOrRemaining = ({ amount, difference, spent }) => {
  const remainingOrDifference = (Math.abs(spent) > Math.abs(amount)) ? shared.difference : shared.remaining

  return (
    <Cell styling={{width: "w-full", padding: "pl-1 pr-1"}}>
      <div className="w-6/12">
        {titleize(remainingOrDifference)}
      </div>
      <div className="w-4/12 text-right">
        <AmountSpan amount={difference} absolute={true} negativeColor="text-red-600" />
      </div>
      <div className="w-1/12">
      </div>
    </Cell>
  )
}

export default DayToDayItem;
