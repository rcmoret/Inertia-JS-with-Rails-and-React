import React from "react";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import MoneyFormatter from "../../lib/MoneyFormatter";
import StyledDiv from "../shared/StyledDiv"
import { SetUp as styles } from "../../styles"
import TextInput from "../shared/TextInput"

import { sectionClassName } from '../BudgetSetupApp'

const ItemGroup = ({ collection, name, ItemForm, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <div className={sectionClassName}>
        <div className='text-xl mb-1 overflow-hidden rounded underline w-full z-30'>
          <div className='bg-gradient-to-r from-green-600 to-green-300 w-full p-1 rounded font-semibold'>&#8226;{' '}{name}</div>
        </div>
        <div>
          {collection.map(item => (
            <ItemForm key={item.budgetItemId} item={item} dispatch={dispatch} />
          ))}
        </div>
      </div>
    )
  }
};

const ItemWrapper = props => {
  const { children, item, inputChange, removeItem } = props
  const inputClassName = Object.values(styles.input).join(' ')

  return (
    <div className='bg-gray-300 bg-white-even rounded overflow-hidden'>
      <div className='flex justify-between mb-1 p-2 rounded shadow-sm'>
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
    </div>
  )
}

export const ExistingItemForm = props => {
  const { item, dispatch } = props
  const inputChange = event => {
    dispatch('adjustExistingItem', { budgetItemId: item.budgetItemId, displayAmount: event.target.value, isChanged: true })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch('removeExistingItem', { budgetItemId: item.budgetItemId })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem} />
  )
};

export const NewItemForm = ({ item, dispatch }) => {
  const { budgetItemId, budgeted, defaultAmount, spent } = item
  const inputChange = event => {
    dispatch('adjustNewItem', { budgetItemId: budgetItemId, displayAmount: event.target.value, radioStatus: null, })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch('removeNewItem', item)
  }
  const selectSpent = () => {
    dispatch('adjustNewItem', { budgetItemId: budgetItemId, displayAmount: MoneyFormatter(spent), radioStatus: 'spent' })
  }
  const selectBudgeted = () => {
    dispatch('adjustNewItem', { budgetItemId: budgetItemId, displayAmount: MoneyFormatter(budgeted), radioStatus: 'budgeted' })
  }
  const selectDefault = () => {
    dispatch('adjustNewItem', { budgetItemId: budgetItemId, displayAmount: MoneyFormatter(defaultAmount), radioStatus: 'default' })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem}>
      <div className='w-1/3'>
        <QuickSelectButton
          amount={item.budgeted}
          checked={item.radioStatus === 'budgeted'}
          label='Budgeted'
          name={item.budgetItemId}
          onChange={selectBudgeted}
        />
        <QuickSelectButton
          amount={item.defaultAmount}
          checked={item.radioStatus === 'default'}
          label='Default'
          name={item.budgetItemId}
          onChange={selectDefault}
        />
        <QuickSelectButton
          amount={item.spent}
          checked={item.radioStatus === 'spent'}
          label='Spent'
          name={item.budgetItemId}
          onChange={selectSpent}
        />
      </div>
    </ItemWrapper>
  )
};

const QuickSelectButton = ({ amount, checked, label, onChange, name }) => (
  <div className='flex justify-between'>
    <div className='text-right w-1/3'>{label}:</div>
    <div className='text-right w-1/2'>{MoneyFormatter(amount, { decorate: true })}</div>
    <div className='w-8'>
      <input type='radio' onChange={onChange} checked={checked} name={name} />
    </div>
  </div>
)

export default ItemGroup;
