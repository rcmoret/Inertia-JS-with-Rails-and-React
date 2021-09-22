import React from "react";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import MoneyFormatter from "../../lib/MoneyFormatter";
import StyledDiv from "../shared/StyledDiv"
import { SetUpStyles as styles } from "../../styles"
import TextInput from "../shared/TextInput"

const ItemGroup = ({ collection, name, ItemForm, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    const style = { top: '68px' }
    return (
      <StyledDiv {...styles.section}>
        <StyledDiv {...styles.sectionTitle} style={style}>
          {name}
        </StyledDiv>
        <div>
          {collection.map(item => (
            <ItemForm key={item.id} item={item} dispatch={dispatch} />
          ))}
        </div>
      </StyledDiv>
    )
  }
};

const ItemWrapper = props => {
  const { children, item, inputChange, removeItem } = props
  const inputClassName = Object.values(styles.input).join(' ')

  return (
    <StyledDiv {...styles.line}>
      <StyledDiv width='w-1/3'>
        {item.name}{' '}<i className={item.iconClassName} />
      </StyledDiv>
      {children}
      <StyledDiv flex='flex' flexJustify='justify-between' width='w-1/4'>
        <StyledDiv textAlign='text-right'>
          $ <TextInput onChange={inputChange} className={inputClassName} value={item.displayAmount} />
        </StyledDiv>
        <StyledDiv width='w-4'>
          <Link onClick={removeItem}>
            <Icon className='fas fa-times' />
          </Link>
        </StyledDiv>
      </StyledDiv>
    </StyledDiv>
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
