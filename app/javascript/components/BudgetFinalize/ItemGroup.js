import React, { useState } from "react";
import Select from "react-select";

import { decimalToInt } from "../../lib/MoneyFormatter"

import AmountSpan from "../shared/AmountSpan";
import { StripedRow, TitleRow } from "../shared/Row";
import Section from "../shared/Section";
import TextInput from "../shared/TextInput";

export default ({ name, collection, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <Section>
        <TitleRow styling={{backgroundColor: 'bg-gradient-to-r from-green-600 to-green-300'}}>
          &#8226;{' '}{name}
        </TitleRow>
        {collection.map(item => (
          <ItemForm key={item.budgetItemId} {...item} dispatch={dispatch} />
        ))}
      </Section>
    )
  }
};

const ItemForm = props => {
  const { iconClassName, name } = props

  return (
    <StripedRow>
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
    </StripedRow>
  )
};

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
};

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
        />
        <QuickSelectButton
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
};

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
);

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
};
