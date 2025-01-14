import React, { useState } from "react";
import Form, { reducer }from "./Form";
import { isSubmittable, formReducer, postEvents } from "./Functions"
import DateFormatter from "../../lib/DateFormatter"
import Header from "./Header"
import PageHeader from "../shared/Header";
import ItemGroup from "./ItemGroup"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import {
  isAccrual,
  isNonAccrual,
  isDayToDay,
  isMonthly,
  isExpense,
  isRevenue,
  sortByName as sortFn,
} from "../../lib/Functions"
import { titles, finalize as copy } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"
import SubmitButton from "./SubmitButton"
import Summary from "./Summary"
import AmountSpan from "../shared/AmountSpan"

export default ({ budget, ...props }) => {
  const { baseInterval } = budget
  const [formObject, setFormObject] = useState(Form(budget));
  const {
    availableCategories,
    models,
    extraBalance,
    rolloverItem,
  } = formObject
  const accruals = models.filter(isAccrual).sort(sortFn)
  const dayToDayItems = models.filter(isNonAccrual).filter(isDayToDay).sort(sortFn)
  const monthlyItems = models.filter(isNonAccrual).filter(isMonthly).sort(sortFn)
  const dispatch = (event, payload) => {
    const updatedState = reducer(event, formObject, payload)
    setFormObject(updatedState)
  }
  const dateString = DateFormatter({ ...baseInterval, day: 1, format: 'shortMonthYear' })
  const onSubmit = event => {
    event.preventDefault()
    const body = { events: formReducer(formObject) }
    postEvents({ month: baseInterval.month, year: baseInterval.year, body })
  }
  const totalExtra = rolloverItem.discretionary + rolloverItem.extraBalance
  const isEnabled = isSubmittable({ models, rolloverItem })
  document.title = copy.docTitle(dateString)

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className='flex justify-between mb-1 rounded'>
        <div className='pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-8/12 rounded h-v90 overflow-scroll'>
          <form className='z-10' onSubmit={onSubmit}>
            <Header
              categories={availableCategories}
              dispatch={dispatch}
              rolloverItem={rolloverItem}
            />
            <ItemGroup name={titleize(titles.accruals)} collection={accruals} dispatch={dispatch} />
            <ItemGroup name={titleize(titles.monthly)} collection={monthlyItems} dispatch={dispatch} />
            <ItemGroup name={titleize(titles.dayToDay)}  collection={dayToDayItems} dispatch={dispatch} />
            <SubmitButton isEnabled={isEnabled} onSubmit={onSubmit} />
          </form>
        </div>
        <Summary
          dateString={dateString}
          discretionary={rolloverItem.discretionary}
          extraBalance={rolloverItem.extraBalance}
          rolloverItemName={rolloverItem.name}
          totalExtra={totalExtra}
        />
      </div>
    </div>
  )
};
