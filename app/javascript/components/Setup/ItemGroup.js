import React from "react";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import MoneyFormatter from "../../lib/MoneyFormatter";
import TextInput from "../shared/TextInput"

const sectionClassName = 'w-1/2 border-b-2 border-solid border-gray-700 pb-2 mb-4'
const lineClassName = 'p-2 mb-1 odd:bg-gray-200 even:bg-white flex justify-between rounded shadow-md'
const inputClassName = 'border-solid border-gray-400 border-2 rounded text-right'

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

export const ExistingItemForm = props => {
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

export const NewItemForm = ({ item, dispatch } = props) => {
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

export default ItemGroup;
