import React, { useState } from "react";
import { v4 as uuid } from 'uuid';
import { Inertia } from "@inertiajs/inertia";
import MoneyFormatter from "../lib/MoneyFormatter";
import SetupForm, { categoryFilterFn, eventsReducer, Reducer } from "../models/SetupForm";
import Button from "./shared/Button";
import CategorySelect from "./Setup/CategorySelect"
import Icon from "./shared/Icons";
import ItemGroup, { ExistingItemForm, NewItemForm } from "./Setup/ItemGroup"
import { sortByName as sortFn } from "../lib/Functions"
import { SetUpStyles as styles } from "../styles"
import StyledDiv from "./shared/StyledDiv"

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
  const formClassName = Object.values(styles.form).join(' ')

  return (
    <StyledDiv padding='pl-4'>
      <StyledDiv {...styles.headerWrapper}>
        <StyledDiv {...styles.headerBanner}>
          <div>
            <h1 className='text-2xl'>Setting Up {targetInterval.month}-{targetInterval.year}</h1>
          </div>
          <StyledDiv fontSize='text-xl'>Balance: {MoneyFormatter(formObject.amount, { plainText: false })}</StyledDiv>
        </StyledDiv>
      </StyledDiv>
      <form className={formClassName} onSubmit={onSubmit}>
        <ItemGroup name='Existing Items' ItemForm={ExistingItemForm} collection={existingItems} dispatch={dispatch} />
        <ItemGroup name='Accruals' ItemForm={NewItemForm} collection={accruals} dispatch={dispatch} />
        <ItemGroup name='Revenues' ItemForm={NewItemForm} collection={revenues} dispatch={dispatch} />
        <ItemGroup name='Expenses' ItemForm={NewItemForm} collection={expenses} dispatch={dispatch} />
        <StyledDiv {...styles.section} flex='flex' flexJustify='justify-between' classes={['mt-4']}>
          <CategorySelect
            categories={categories}
            month={targetInterval.month}
            dispatch={dispatch}
            selectedCategoryId={selectedCategoryId}
            year={targetInterval.year}
          />
          <div>
            <Button {...styles.submitButton} onSubmit={onSubmit}>
              Create Budget
            </Button>
          </div>
        </StyledDiv>
      </form>
    </StyledDiv>
  );
};

export default BudgetSetupApp;
