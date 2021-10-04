import React, { useState } from "react";
// import { Inertia } from "@inertiajs/inertia";
import SetupForm, { categoryFilterFn, eventsReducer, Reducer } from "../models/SetupForm";
import AmountSpan from "./shared/AmountSpan";
import Button from "./shared/Button";
import CategorySelect from "./Setup/CategorySelect"
import ItemGroup, { ExistingItemForm, NewItemForm } from "./Setup/ItemGroup"
import { sortByName as sortFn } from "../lib/Functions"
import DateFormatter from "../lib/DateFormatter"

const sectionClasses = [
  'bg-white',
  'border-b-2',
  'border-solid',
  'border-gray-500',
  'p-2',
  'mb-2',
  'rounded',
]

export const sectionClassName = sectionClasses.join(' ')

const BudgetSetupApp = (props) => {
  const { targetInterval } = props
  const initialForm = SetupForm(props)
  const [formObject, setFormObject] = useState(initialForm);
  const dispatch = (event, payload) => { setFormObject(Reducer(event, formObject, payload)) }
  const { balance, newItems, selectedCategoryId } = formObject
  const accruals = newItems.filter(item => item.isAccrual).sort(sortFn)
  const expenses = newItems.filter(item => !item.isAccrual && item.isExpense).sort(sortFn)
  const revenues = newItems.filter(item => !item.isExpense).sort(sortFn)
  const existingItems = formObject.existingItems.sort(sortFn)
  const dayToDayItemIds = [...existingItems, ...formObject.newItems].filter(item => !item.isMonthly).map(item => item.budgetCategoryId)
  const categories = formObject.categories.filter(category => categoryFilterFn(category, dayToDayItemIds))
  const flexItemSectionClassName = [...sectionClasses, 'flex', 'justify-between', 'flex-row-reverse'].join(' ')
  const onSubmit = ev => {
    ev.preventDefault();
    // const body = JSON.stringify(eventsReducer(formObject))
    const body = eventsReducer(formObject)
    console.log(body)
    // Inertia.post('/budget/set-up', body)
  }
  const dateString = DateFormatter({ ...targetInterval, day: 1, format: 'shortMonthYear' })

  return (
    <div>
      <div className='flex justify-between mb-1 h-5/6 rounded'>
        <div className='pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-8/12 rounded h-v90 overflow-scroll'>
          <form className='z-10' onSubmit={onSubmit}>
            <div className={flexItemSectionClassName}>
              <CategorySelect
                categories={categories}
                dispatch={dispatch}
                month={targetInterval.month}
                selectedCategoryId={selectedCategoryId}
                year={targetInterval.year}
              />
            </div>
            <ItemGroup name='Existing Items' ItemForm={ExistingItemForm} collection={existingItems} dispatch={dispatch} />
            <ItemGroup name='Accruals' ItemForm={NewItemForm} collection={accruals} dispatch={dispatch} />
            <ItemGroup name='Revenues' ItemForm={NewItemForm} collection={revenues} dispatch={dispatch} />
            <ItemGroup name='Expenses' ItemForm={NewItemForm} collection={expenses} dispatch={dispatch} />
            <div className='flex justify-between flex-row-reverse'>
              <div className='bg-white rounded justify-between flex-row-reverse pl-6 pr-6 pt-2 pb-2'>
                <Button bgColor='bg-green-600' hoverBgColor='hover:bg-green-700' onSubmit={onSubmit}>
                  Create Budget
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className='w-3/12 p-2 mb-4 rounded z-50'>
          <div className='bg-blue-900 p-2 rounded'>
            <div className='bg-white p-4 rounded shadow-lg'>
              <div className='border-b-2 border-blue-900 border-solid'>
                <h1 className='text-2xl'>Set up: {dateString}</h1>
              </div>
              <div className='flex justify-between text-xl'>
                <div>Balance</div>
                <div className='text-xl text-right'>
                  <AmountSpan amount={balance} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSetupApp;
