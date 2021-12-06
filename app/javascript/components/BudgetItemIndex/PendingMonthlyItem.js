import React, { useState } from "react";

import { eventAndTransactionDetailSort, eventTransactionReducer } from "./Functions";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

import BudgetItemDetails from "./ItemDetails";
import { FormRow, NameRow } from "./shared";
import { StripedRow } from "../shared/Row"

const PendingMonthlyItem = ({ model, fns }) => {
  const events = model.events.sort(eventAndTransactionDetailSort).reduce(eventTransactionReducer, [])

  if (model.showForm) {
    return (
      <Form  model={model} fns={fns} details={events} />
    )
  } else {
    return (
      <Show details={events} model={model} fns={fns} />
    )
  }
}

const Show = ({ details, model, fns }) => (
  <StripedRow styling={{ wrap: "flex-wrap"}}>
    <NameRow model={model} fns={fns} />
    {model.showDetails && <BudgetItemDetails id={model.id} details={details} />}
  </StripedRow>
);

const Form = ({ details, model, fns }) => {
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
  const hideForm = () => fns.closeForm()
  const postEvent = () => fns.postItemAdjustEvent(id, updateAmount, { showDetails: showDetails })

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <NameRow model={model} fns={fns} />
      <FormRow
        handleChange={handleChange}
        hideForm={hideForm}
        inputAmount={inputAmount}
        postEvent={postEvent}
      />
      {showDetails && <BudgetItemDetails id={model.id} details={details} />}
    </StripedRow>
  )
};

export default PendingMonthlyItem;
