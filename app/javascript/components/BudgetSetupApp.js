import React, { useState } from "react";
import { v4 as uuid } from 'uuid';
import { Inertia } from "@inertiajs/inertia";
import MoneyFormatter from "../lib/MoneyFormatter";
import SetupForm, { categoryFilterFn, eventsReducer, Reducer } from "../models/SetupForm";
import Button from "./shared/Button";
import Icon from "./shared/Icons";
import Link from "./shared/Link";
import Select from "react-select"
import TextInput from "./shared/TextInput"

const lineClassName = 'p-2 mb-1 odd:bg-gray-200 even:bg-white flex justify-between rounded shadow-md'
const inputClassName = 'border-solid border-gray-400 border-2 rounded text-right'
const sectionClassName = 'w-1/2 border-b-2 border-solid border-gray-700 pb-2 mb-4'
const sortFn = (a, b) => a.name < b.name ? -1 : 1

const BudgetSetupApp = (props) => {
  const { baseInterval, targetInterval, errors } = props
  const initialForm = SetupForm({
    newItems: baseInterval.items,
    existingItems: targetInterval.items,
    removedItems: [],
    categories: props.categories,
    month: targetInterval.month,
    year: targetInterval.year,
  })
  const [formObject, setFormObject] = useState(initialForm);
  const dispatch = (event, payload) => { setFormObject(Reducer(event, formObject, payload)) }
  const { newItems, selectedCategoryId } = formObject
  const accruals = newItems.filter(item => item.isAccrual).sort(sortFn)
  const expenses = newItems.filter(item => !item.isAccrual && item.isExpense).sort(sortFn)
  const revenues = newItems.filter(item => !item.isExpense).sort(sortFn)
  const existingItems = formObject.existingItems.sort(sortFn)
  const onSubmit = ev => {
    ev.preventDefault();
    const body = JSON.stringify(eventsReducer(formObject))
    Inertia.post('/budget/set-up', body)
  }
  const dayToDayItemIds = [...existingItems, ...formObject.newItems].filter(item => !item.isMonthly).map(item => item.budgetCategoryId)
  const categories = formObject.categories.filter(category => categoryFilterFn(category, dayToDayItemIds))

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

const ItemGroup = ({ collection, name, ItemForm, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    const style = { top: '68px' }
    return (
      <div className={sectionClassName}>
        <div className='text-lg z-30 underline w-100 pl-2 bg-white sticky border-b-2 border-solid border-gray-700 mb-2' style={style}>
          {name}
        </div>
        <div>
          {collection.map(item => (
            <ItemForm key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>
      </div>
    )
  }
};

const ItemWrapper = props => {
  const { children, item, inputChange, removeItem } = props

  return (
    <div className={lineClassName}>
      <div className='w-1/3'>
        {item.name}{' '}<i className={item.iconClassName} />
      </div>
      {children}
      <div className='flex justify-between w-1/4'>
        <div className='text-right'>
          $ <TextInput onChange={inputChange} className={inputClassName} value={item.displayAmount} />
        </div>
        <div className='w-4'>
          <Link onClick={removeItem}>
            <Icon className='fas fa-times' />
          </Link>
        </div>
      </div>
    </div>
  )
}

const NewItemForm = ({ item, dispatch } = props) => {
  const { id, budgeted, defaultAmount, spent } = item
  const inputChange = event => {
    dispatch('adjustNewItem', { id: id, displayAmount: event.target.value, radioStatus: null, })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch('removeNewItem', item)
  }
  const selectSpent = () => {
    dispatch('adjustNewItem', { id: id, displayAmount: MoneyFormatter(spent), radioStatus: 'spent' })
  }
  const selectBudgeted = () => {
    dispatch('adjustNewItem', { id: id, displayAmount: MoneyFormatter(budgeted), radioStatus: 'budgeted' })
  }
  const selectDefault = () => {
    dispatch('adjustNewItem', { id: id, displayAmount: MoneyFormatter(defaultAmount), radioStatus: 'default' })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem}>
      <div className='w-1/3'>
        <QuickSelectButton
          amount={item.budgeted}
          checked={item.radioStatus === 'budgeted'}
          label='Budgeted'
          name={item.id}
          onChange={selectBudgeted}
        />
        <QuickSelectButton
          amount={item.defaultAmount}
          checked={item.radioStatus === 'default'}
          label='Default'
          name={item.id}
          onChange={selectDefault}
        />
        <QuickSelectButton
          amount={item.spent}
          checked={item.radioStatus === 'spent'}
          label='Spent'
          name={item.id}
          onChange={selectSpent}
        />
      </div>
    </ItemWrapper>
  )
};

const QuickSelectButton = ({ amount, checked, label, onChange, name }) => (
  <div className='flex justify-between'>
    <div className='w-8'>
      <input type='radio' onChange={onChange} checked={checked} name={name} />
    </div>
    <div className='text-right w-1/3'>{label}:</div>
    <div className='text-right w-1/2'>{MoneyFormatter(amount, { plainText: false })}</div>
  </div>
)

const ExistingItemForm = props => {
  const { item, dispatch } = props
  const inputChange = event => {
    dispatch('adjustExistingItem', { id: item.id, displayAmount: event.target.value, isChanged: true })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch('removeExistingItem', { id: item.id })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem} />
  )
};

const CategorySelect = props => {
  const { categories, dispatch } = props
  const nullOption = { value: null, label: "" }
  const value = categories.find(option => option.value === props.selectedCategoryId) || nullOption
  const onChange = event => { dispatch('categorySelect', { value: event.value }) }
  const onClick = event => {
    event.preventDefault();
    if (value.value !== null) {
      dispatch('addItem', { ...value, month: props.month, year: props.year })
    }
  }
  const groupedOptions = [
    nullOption,
    { label: "Day to Day", options: categories(c => !c.isMonthly).sort(sortFn) },
    { label: "Monthly", options: categories(c => c.isMonthly).sort(sortFn) },
  ]

  return (
    <div className='w-1/2 justify-between flex'>
      <div className='w-3/4'>
        <Select
          placeholder='Select Category'
          onChange={onChange}
          options={groupedOptions}
          value={value}
        />
       </div>
      <Button type='add-item' bgColor='bg-blue-600' hoverBgColor='hover:bg-blue-700' onClick={onClick}>
        <Icon className='fas fa-plus' />
        {' '}
        Add Item
      </Button>
   </div>
  )
}
export default BudgetSetupApp;
