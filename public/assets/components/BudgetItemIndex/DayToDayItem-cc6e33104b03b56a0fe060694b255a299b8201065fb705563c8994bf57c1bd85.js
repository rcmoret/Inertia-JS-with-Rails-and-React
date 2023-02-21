import React, { useState } from "react";
import Row, { StripedRow } from "../shared/Row"

import { decimalToInt } from "../../lib/MoneyFormatter";
import { shared } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions";

import {
  eventAndTransactionDetailSort,
  eventTransactionReducer,
  postItemAdjustEvent,
} from "./Functions";

import AmountSpan from "../shared/AmountSpan";
import BudgetItemDetails from "./ItemDetails";
import Icon from "../shared/Icons";
import Cell from "../shared/Cell";
import { AccrualMaturityInfo, FormRow, NameRow, Links } from "./shared";
import Link from "../shared/Link";

const DayToDayItem = ({ model, fns, month, year }) => {
  const details = [
    ...model.events,
    ...model.transactionDetails,
  ].sort(eventAndTransactionDetailSort)
  .reduce(eventTransactionReducer, [])

  if (model.showForm) {
    return (
      <Form  model={model} fns={fns} details={details} month={month} year={year}/>
    )
  } else {
    return (
      <Show model={model} fns={fns} details={details} month={month} year={year}/>
    )
  }
}

const Form = ({ model, fns, details, month, year }) => {
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
  const postEvent = () => {
    const onSuccess = page => {
      fns.closeForm()
      fns.onPostSuccess(page)
    }
    postItemAdjustEvent(
      { id, amount: updateAmount, month, year },
      { onSuccess }
    )
  }

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <NameRow model={model} fns={fns} />
      <FormRow
        handleChange={handleChange}
        hideForm={fns.closeForm}
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
      <AccrualMaturityInfo model={model} fns={fns} month={month} year={year} />
      {showDetails && <BudgetItemDetails item={mdoel} details={details} />}
     </StripedRow>
  )
}

const Show = ({ model, fns, details, month, year }) => {
  const {
    id,
    isExpense,
    showDetails,
    spent,
  } = model

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <NameRow model={model} fns={fns} month={month} year={year} />
      <SpentOrDeposited isExpense={isExpense} spent={spent} />
      <DifferenceOrRemaining {...model} />
      <AccrualMaturityInfo model={model} fns={fns} month={month} year={year} />
      {showDetails && <BudgetItemDetails item={model} details={details} />}
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
