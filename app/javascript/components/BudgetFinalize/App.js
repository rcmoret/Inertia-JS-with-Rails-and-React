import React, { useState } from "react";
import Form from "./Form";
import { isSubmittable, formReducer, postEvents, reducer } from "./Functions"
import DateFormatter from "../../lib/DateFormatter"
import Header from "./Header"
import ItemGroup from "./ItemGroup"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { sortByName as sortFn } from "../../lib/Functions"
import SubmitButton from "./SubmitButton"
import Summary from "./Summary"
import AmountSpan from "../shared/AmountSpan"

export default props => {
  const { baseInterval } = props
  const [formObject, setFormObject] = useState(Form(props));
  const {
    availableCategories,
    models,
    extraBalance,
    rolloverItem,
  } = formObject
  const accruals = models.filter(item => item.isAccrual).sort(sortFn)
  const dayToDayItems = models.filter(item => !item.isAccrual && !item.isMonthly).sort(sortFn)
  const monthlyItems = models.filter(item => !item.isAccrual && item.isMonthly).sort(sortFn)
  const dispatch = (event, payload) => {
    const updatedState = reducer(event, formObject, payload)
    setFormObject(updatedState)
  }
  const dateString = DateFormatter({ ...baseInterval, day: 1, format: 'shortMonthYear' })
  const onSubmit = event => {
    event.preventDefault()
    const body = { events: formReducer(formObject) }
    postEvents(body)
  }
  const totalExtra = rolloverItem.discretionary + rolloverItem.extraBalance
  const isEnabled = isSubmittable({ models, rolloverItem })
  document.title = `Finalize ${dateString}`

  return (
    <div>
      <div className='flex justify-between mb-1 rounded'>
        <div className='pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-8/12 rounded h-v90 overflow-scroll'>
          <form className='z-10' onSubmit={onSubmit}>
            <Header
              categories={availableCategories}
              dispatch={dispatch}
              rolloverItem={rolloverItem}
            />
            <ItemGroup name='Accruals' collection={accruals} dispatch={dispatch} />
            <ItemGroup name='Monthly' collection={monthlyItems} dispatch={dispatch} />
            <ItemGroup name='Day-to-Day' collection={dayToDayItems} dispatch={dispatch} />
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
