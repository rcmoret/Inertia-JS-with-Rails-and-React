import React, { useState } from "react";
import { v4 as uuid } from 'uuid';
import { Inertia } from "@inertiajs/inertia";
import MoneyFormatter from "../lib/MoneyFormatter";
import SetupForm, { categoryFilterFn, eventsReducer, Reducer } from "../models/SetupForm";
import Button from "./shared/Button";
import CategorySelect from "./Setup/CategorySelect"
import Icon from "./shared/Icons";
import ItemGroup, { ExistingItemForm, NewItemForm } from "./Setup/ItemGroup"

const sectionClassName = 'w-1/2 border-b-2 border-solid border-gray-700 pb-2 mb-4'
const sortFn = (a, b) => a.name < b.name ? -1 : 1

const BudgetSetupApp = (props) => {
  const { baseInterval, targetInterval, errors } = props
  const initialForm = SetupForm(props)
  const [formObject, setFormObject] = useState(initialForm);
  const dispatch = (event, payload) => { setFormObject(Reducer(event, formObject, payload)) }
  const { newItems, selectedCategoryId } = formObject
  const accruals = newItems.filter(item => item.isAccrual).sort(sortFn)
  const expenses = newItems.filter(item => !item.isAccrual && item.isExpense).sort(sortFn)
  const revenues = newItems.filter(item => !item.isExpense).sort(sortFn)
  const existingItems = formObject.existingItems.sort(sortFn)
  const dayToDayItemIds = [...existingItems, ...formObject.newItems].filter(item => !item.isMonthly).map(item => item.budgetCategoryId)
  const categories = formObject.categories.filter(category => categoryFilterFn(category, dayToDayItemIds))
  const onSubmit = ev => {
    ev.preventDefault();
    const body = JSON.stringify(eventsReducer(formObject))
    Inertia.post('/budget/set-up', body)
  }

  return (
    <div className='pl-4'>
      <div className='pb-1 w-1/2 sticky top-0 bg-white h-16 z-50'>
        <div className='p-4 bg-blue-200 flex justify-between rounded shadow-lg' >
          <div>
            <h1 className='text-2xl'>Setting Up {targetInterval.month}-{targetInterval.year}</h1>
          </div>
          <div className='text-xl'>Balance: {MoneyFormatter(formObject.amount, { plainText: false })}</div>
        </div>
      </div>
      <form className='bg-white z-10' onSubmit={onSubmit}>
        <ItemGroup name='Existing Items' ItemForm={ExistingItemForm} collection={existingItems} dispatch={dispatch} />
        <ItemGroup name='Accruals' ItemForm={NewItemForm} collection={accruals} dispatch={dispatch} />
        <ItemGroup name='Revenues' ItemForm={NewItemForm} collection={revenues} dispatch={dispatch} />
        <ItemGroup name='Expenses' ItemForm={NewItemForm} collection={expenses} dispatch={dispatch} />
        <div className={`${sectionClassName} flex justify-between`}>
          <CategorySelect
            categories={categories}
            month={targetInterval.month}
            dispatch={dispatch}
            selectedCategoryId={selectedCategoryId}
            year={targetInterval.year}
          />
          <div>
            <Button bgColor='bg-green-600' hoverBgColor='hover:bg-green-700' onSubmit={onSubmit}>
              Create Budget
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BudgetSetupApp;
