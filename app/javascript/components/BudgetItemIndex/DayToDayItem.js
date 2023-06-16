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
    key,
    amount,
    inputAmount,
    isExpense,
    showDetails,
    updateAmount,
    spent,
  } = model
  const handleChange = event => {
    fns.updateItem(key, { inputAmount: event.target.value, updateAmount: decimalToInt(event.target.value) })
  }
  const updatedRemaining = (updateAmount - spent) * -1
  const postEvent = () => {
    const onSuccess = page => {
      fns.closeForm()
    }
    postItemAdjustEvent(
      { id: key, amount: updateAmount, month, year },
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
      </Cell>
      <AccrualMaturityInfo model={model} fns={fns} month={month} year={year} />
      {showDetails && <BudgetItemDetails item={model} details={details} />}
      <div className="md:hidden w-full">
        <Links model={model} fns={fns} month={month} year={year} />
      </div>
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
      <div className="w-full px-1">
        <Links model={model} fns={fns} month={month} year={year} />
      </div>
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
    </Cell>
  )
}

const DifferenceOrRemaining = (model) => {
  const { amount, difference, isExpense, spent } = model
  const remainingOrDifference = (Math.abs(spent) > Math.abs(amount)) ? shared.difference : shared.remaining
  const negativeColor = !isExpense && (Math.abs(spent) <= Math.abs(amount)) ? "black" : "red-700"
  const amountColor = !isExpense && (Math.abs(spent) > Math.abs(amount)) ? "green-600" : "black"

  return (
    <Cell styling={{width: "w-full", padding: "pl-1 pr-1"}}>
      <div className="w-6/12">
        {titleize(remainingOrDifference)}
      </div>
      <div className="w-4/12 text-right">
        <AmountSpan amount={difference} absolute={true} color={`text-${amountColor}`} negativeColor={`text-${negativeColor}`} />
      </div>
    </Cell>
  )
}

export default DayToDayItem;
