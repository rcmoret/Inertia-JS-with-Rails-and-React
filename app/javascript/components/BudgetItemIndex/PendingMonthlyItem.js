import React, { useState } from "react";

import { eventAndTransactionDetailSort, eventTransactionReducer, postItemAdjustEvent } from "./Functions";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

import BudgetItemDetails from "./ItemDetails";
import { FormRow, NameRow } from "./shared";
import { StripedRow } from "../shared/Row"

const PendingMonthlyItem = ({ model, fns, month, year }) => {
  const events = model.events.sort(eventAndTransactionDetailSort).reduce(eventTransactionReducer, [])

  if (model.showForm) {
    return (
      <Form  model={model} fns={fns} details={events} month={month} year={year} />
    )
  } else {
    return (
      <Show details={events} model={model} fns={fns} month={month} year={year} />
    )
  }
}

const Show = ({ details, model, fns, month, year }) => (
  <StripedRow styling={{ wrap: "flex-wrap"}}>
    <NameRow model={model} fns={fns} month={month} year={year} />
    {model.showDetails && <BudgetItemDetails id={model.id} details={details} />}
  </StripedRow>
);

const Form = ({ details, model, fns, month, year }) => {
  const {
    id,
    amount,
    inputAmount,
    isExpense,
    showDetails,
    spent,
  } = model
  const handleChange = event =>
    fns.updateItem(id, { inputAmount: event.target.value, updateAmount: decimalToInt(event.target.value) })
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
      <NameRow model={model} fns={fns} month={month} year={year} />
      <FormRow
        handleChange={handleChange}
        hideForm={fns.closeForm}
        inputAmount={inputAmount}
        postEvent={postEvent}
      />
      {showDetails && <BudgetItemDetails id={id} details={details} />}
    </StripedRow>
  )
};

export default PendingMonthlyItem;
