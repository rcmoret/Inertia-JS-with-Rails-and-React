import React, { useState } from "react";
// import { Inertia } from "@inertiajs/inertia";
import Form, { itemReducer } from "./Form";
import { reducer } from "./Reducer"
import DateFormatter from "../../lib/DateFormatter"
import Header from "./Header"
import ItemGroup from "./ItemGroup"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { sortByName as sortFn } from "../../lib/Functions"
import SubmitButton from "./SubmitButton"
import Summary from "./Summary"
import AmountSpan from "../shared/AmountSpan"

export const sectionClasses = [
  'bg-white',
  'border-b-2',
  'border-solid',
  'border-gray-500',
  'flex',
  'flex-wrap',
  'justify-between',
  'p-2',
  'mb-2',
  'rounded',
  'w-full',
]

export default props => {
  const { baseInterval } = props
  const initialForm = Form(props)
  const [formObject, setFormObject] = useState(initialForm);
  const {
    categories,
    discretionary,
    extraBalance,
    reviewItems,
    rolloverItem,
    rolloverItemName,
    totalExtra
  } = formObject
  const accruals = reviewItems.filter(item => item.isAccrual).sort(sortFn)
  const dayToDayItems = reviewItems.filter(item => !item.isAccrual && !item.isMonthly).sort(sortFn)
  const monthlyItems = reviewItems.filter(item => !item.isAccrual && item.isMonthly).sort(sortFn)
  const dispatch = (event, payload) => {
    const updatedState = reducer(event, formObject, payload)
    setFormObject(updatedState)
  }
  const dateString = DateFormatter({ ...baseInterval, day: 1, format: 'shortMonthYear' })
  const onSubmit = event => {
    event.preventDefault();
    const events = [{ eventAttributes: rolloverItem }, ...reviewItems]
      .map(item => itemReducer(item))
      .filter(form => form.amount !== 0)

    const body = { events }
    console.log(body)
    // Inertia.post('/budget/finalize', body)
  }
  document.title = `Finalize ${dateString}`

  return (
    <div>
      <div className='flex justify-between mb-1 rounded'>
        <div className='pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-8/12 rounded h-v90 overflow-scroll'>
          <form className='z-10' onSubmit={onSubmit}>
            <Header
              categories={categories}
              dispatch={dispatch}
              rolloverItem={rolloverItem}
            />
            <ItemGroup name='Accruals' collection={accruals} dispatch={dispatch} />
            <ItemGroup name='Day-to-Day' collection={dayToDayItems} dispatch={dispatch} />
            <ItemGroup name='Monthly' collection={monthlyItems} dispatch={dispatch} />
            <SubmitButton onSubmit={onSubmit} />
          </form>
        </div>
        <Summary
          dateString={dateString}
          discretionary={discretionary}
          extraBalance={extraBalance}
          rolloverItemName={rolloverItemName}
          totalExtra={totalExtra}
        />
      </div>
    </div>
  )
};
