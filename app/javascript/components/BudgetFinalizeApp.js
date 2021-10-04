import React, { useState } from "react";
// import { Inertia } from "@inertiajs/inertia";
import FinalizeForm, { itemReducer, Reducer } from "../models/FinalizeForm";
import DateFormatter from "../lib/DateFormatter"
import MoneyFormatter, { decimalToInt } from "../lib/MoneyFormatter";
import { sortByName as sortFn } from "../lib/Functions"
import Button from "./shared/Button"
import AmountSpan from "./shared/AmountSpan"
import Select from "react-select"
import TextInput from "./shared/TextInput"

const sectionClasses = [
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

export const sectionClassName = sectionClasses.join(' ')

const BudgetFinalizeApp = props => {
  const { baseInterval } = props
  const initialForm = FinalizeForm(props)
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
  const dispatch = (event, payload) => { setFormObject(Reducer(event, formObject, payload)) }
  const flexItemSectionClassName = [...sectionClasses, 'flex', 'justify-between'].join(' ')
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

  return (
    <div>
      <div className='flex justify-between mb-1 rounded'>
        <div className='pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-8/12 rounded h-v90 overflow-scroll'>
          <form className='z-10' onSubmit={onSubmit}>
            <div className={flexItemSectionClassName}>
              <div>Apply to:</div>
              <CategorySelect categories={categories} dispatch={dispatch} rolloverItem={rolloverItem} />
            </div>
            <ItemGroup name='Accruals' collection={accruals} dispatch={dispatch} />
            <ItemGroup name='Day-to-Day' collection={dayToDayItems} dispatch={dispatch} />
            <ItemGroup name='Monthly' collection={monthlyItems} dispatch={dispatch} />
            <div className='flex justify-between flex-row-reverse p-2 rounded'>
              <div className='bg-white rounded p-2'>
                <Button bgColor='bg-green-600' hoverBgColor='hover:bg-green-700' onSubmit={onSubmit}>
                  Finalize/Rollover
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className='w-3/10 mb-4 rounded z-50'>
          <div className='bg-blue-900 p-2 rounded'>
            <div className='bg-white p-4 rounded shadow-lg'>
              <div className='border-b-2 border-blue-900 border-solid flex justify-between text-2xl'>
                <div>Finalize</div>
                <div>{dateString}</div>
              </div>
              <div className='w-full text-xl flex space-between flex-wrap'>
                <div className='w-1/2'>Disrectionary:</div>
                <div className='w-1/2 text-right'>
                  <AmountSpan amount={discretionary * -1} />
                </div>
                <div className='w-1/2'>Extra From Items:</div>
                <div className='w-1/2 text-right'>
                  <AmountSpan amount={extraBalance * -1} />
                </div>
                <div className='w-1/2'>Total toward <span className="underline">{rolloverItemName}</span></div>
                <div className='w-1/2 text-right'>
                  <AmountSpan amount={totalExtra * -1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

const CategorySelect = ({ categories, dispatch, rolloverItem }) => {
  const nullOption = { value: null, label: "" }
  const value = categories.find(option => option.value === rolloverItem.budgetCategoryId)
  const options = [nullOption, ...categories]
  const onChange = event => {
    const category = categories.find(category => category.id === event.value)
    dispatch('updateRolloverItem', { budgetCategoryId: category.id, name: category.name })
  }

  return (
    <div className='w-1/4'>
      <Select
        placeholder='Select Category'
        onChange={onChange}
        options={options}
        value={value}
      />
    </div>
  )
}

const ItemGroup = ({ name, collection, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <div className={sectionClassName}>
        <div className='text-xl mb-1 overflow-hidden rounded underline w-full'>
          <div className='bg-gradient-to-r from-green-500 to-green-200 w-full p-1 rounded font-semibold'>&#8226;{' '}{name}</div>
        </div>
        {collection.map(item => (
          <ItemForm key={item.budgetItemId} {...item} dispatch={dispatch} />
        ))}
      </div>
    )
  }
};

const ItemForm = props => {
  const { iconClassName, name } = props

  return (
    <div className='odd:bg-gray-200 even:bg-white p-2 flex justify-between rounded overflow-hidden w-full'>
      <div className='mb-1 rounded w-4/12'>
        <div>{name}{' '}<i className={iconClassName} /></div>
        <div><Budgeted {...props} /></div>
      </div>
      <div width='w-5/12'>
        <RolloverAmount {...props} />
      </div>
      <div className='w-2/12 text-right'>
        <div>New Amount</div>
        <NewAmount {...props} />
        <div>Applied to Extra</div>
        <AppliedToExtra {...props} />
      </div>
    </div>
  )
}

const Budgeted = props => {
  const { targetItems } = props
  if (targetItems.length === 1) {
    return (
      <div className='flex justify-between'>
        <div>Budgeted:</div>
        <AmountSpan amount={targetItems[0].amount} color='text-green-700' negativeColor='text-green-700' />
      </div>
    )
  } else {
    return (
      <div className='w-full'>
        <BudgetItemSelect {...props} />
      </div>
    )
  }
}

const BudgetItemSelect = props => {
  const valueFn = item => (
    { ...item, value: item.id, label: `${item.budgetItemId} - ${MoneyFormatter(item.amount, { decorate: true })}`}
  )
  const options = [{ label: '', value: null }, ...props.targetItems.map(item => valueFn(item))]
  const value = options.find(option => option.value === props.eventAttributes.budgetItemId)
  const onChange = event => {
    props.dispatch("updateSelectedItem", { budgetItemId: props.budgetItemId, id: event.budgetItemId })
  }

  return (
    <div className='w-4/5 text-sm' >
      <Select
        onChange={onChange}
        options={options}
        value={value}
      />
    </div>
  )
}

const RolloverAmount = props => {
  const {
    budgetItemId,
    dispatch,
    displayAmount,
    itemStatus,
    remaining,
  } = props
  const inputChange = event =>
    dispatch('updateRolloverAmount',
      {
        budgetItemId: budgetItemId,
        displayAmount: event.target.value,
        rolloverAmount: decimalToInt(event.target.value),
      }
    )
  const selectAll = () =>
    dispatch('updateRolloverAmount',
      {
        budgetItemId: budgetItemId,
        displayAmount: MoneyFormatter(remaining),
        rolloverAmount: remaining,
      }
    )
  const selectNone = () =>
    dispatch('updateRolloverAmount',
      {
        budgetItemId: budgetItemId,
        displayAmount: '0.00',
        rolloverAmount: 0,
      }
    )
  const partialAmount = itemStatus === 'rolloverPartial' ? decimalToInt(displayAmount) : ''

  return (
    <div className='flex justify-between' >
      <div className='w-1/2'>
        <QuickSelectButton
          amount={remaining}
          checked={itemStatus === 'rolloverAll'}
          label='All'
          name={budgetItemId}
          onChange={selectAll}
          remaining={remaining}
        />
        <QuickSelectButton
          amount={0}
          checked={itemStatus === 'rolloverNone'}
          label='None'
          name={budgetItemId}
          onChange={selectNone}
          remaining={remaining}
        /> <QuickSelectButton
          amount={partialAmount}
          checked={itemStatus === 'rolloverPartial'}
          label='Partial'
          name={budgetItemId}
          onChange={() => null}
          remaining={remaining}
        />

      </div>
      <div className='text-right w-5/12'>
        <div>
          $ <TextInput onChange={inputChange} className='text-right rounded w-4/5 border border-gray-400 border-solid' value={displayAmount} />
        </div>
      </div>
    </div>
  )
}

const QuickSelectButton = ({ amount, checked, label, onChange, name, remaining }) => {
  const shouldRender = () => {
    if (label !== 'Partial') {
      return true
    } else {
      if (amount === 0 || amount === '' || amount === remaining) {
        return false
      } else {
        return true
      }
    }
  }
  if (shouldRender()) {
    return (
      <div className='flex justify-between w-full'>
        <div className='text-right w-full flex justify-between'>
          <div>{label}:</div>
          <div>
            <Amount amount={amount} />
          </div>
        </div>
        <div className='w-4 ml-4'>
          <input type='radio' onChange={onChange} checked={checked} name={name} />
        </div>
      </div>
    )
  } else {
    return null
  }
}

const NewAmount = props =>{
  const { eventAttributes } = props
  const { amount } = eventAttributes
  // const { eventAttributes, targetItems } = props
  // const { budgetItemId, amount } = eventAttributes
  // const targetItem = targetItems.find(item => item.budgetItemId === budgetItemId) || null

  // if (targetItem === null) {
  return (
    <div>
      <Amount amount={amount} />
    </div>
  )
}

const AppliedToExtra = props =>{
  const { eventAttributes, extra, targetItems } = props
  const targetItem = targetItems.find(item => item.id == eventAttributes.id) || null

  if (targetItem === null) {
    return (
      <div><Amount amount={0} /></div>
    )
  } else {
    return (
      <div><Amount amount={extra} /></div>
    )
  }
}

const Amount = ({ amount }) => (
  <AmountSpan
    amount={amount}
    color='text-green-700'
    negativeColor='text-green-700'
  />
)

export default BudgetFinalizeApp;
