import React from "react";
import MoneyFormatter from "../../lib/MoneyFormatter";

import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Section from "../shared/Section"
import { StripedRow, TitleRow } from "../shared/Row"
import TextInput from "../shared/TextInput"

const ItemGroup = ({ collection, name, ItemForm, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <Section>
        <TitleRow styling={{backgroundColor: "bg-gradient-to-r from-green-600 to-green-300"}}>
          &#8226;{" "}{name}
        </TitleRow>
        {collection.map(item => (
          <ItemForm key={item.id} item={item} dispatch={dispatch} />
        ))}
      </Section>
    )
  }
};

const ItemWrapper = props => {
  const { children, item, inputChange, removeItem } = props
  const inputClassName = "text-right rounded w-4/5 border border-gray-400 border-solid"

  return (
    <StripedRow>
      <Cell styling={{width: "w-1/3"}}>
        {item.name}
        {" "}
        <i className={item.iconClassName} />
      </Cell>
      {children}
      <Cell styling={{width: "w-1/4"}}>
        <div className="text-right">
          $ <TextInput onChange={inputChange} className={inputClassName} value={item.displayAmount} />
        </div>
        <div className="w-4">
          <Link onClick={removeItem}>
            <Icon className="fas fa-times" />
          </Link>
        </div>
      </Cell>
    </StripedRow>
  )
}

export const ExistingItemForm = props => {
  const { item, dispatch } = props
  const inputChange = event => {
    dispatch("adjustExistingItem", { id: item.id, displayAmount: event.target.value })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch("removeItem", { id: item.id })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem} />
  )
};

export const NewItemForm = ({ item, dispatch }) => {
  const { id, budgeted, defaultAmount, status, spent } = item
  const inputChange = event => {
    dispatch("adjustNewItem", { id: id, displayAmount: event.target.value, status: null, })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch("removeItem", { id: id })
  }
  const selectSpent = () => {
    dispatch("adjustNewItem", { id: id, displayAmount: MoneyFormatter(spent), status: "spent" })
  }
  const selectBudgeted = () => {
    dispatch("adjustNewItem", { id: id, displayAmount: MoneyFormatter(budgeted), status: "budgeted" })
  }
  const selectDefault = () => {
    dispatch("adjustNewItem", { id: id, displayAmount: MoneyFormatter(defaultAmount), status: "default" })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem}>
      <div className="w-1/3">
        <QuickSelectButton
          amount={budgeted}
          checked={status === "budgeted"}
          label="Budgeted"
          name={id}
          onChange={selectBudgeted}
        />
        <QuickSelectButton
          amount={defaultAmount}
          checked={status === "default"}
          label="Default"
          name={id}
          onChange={selectDefault}
        />
        <QuickSelectButton
          amount={spent}
          checked={status === "spent"}
          label="Spent"
          name={id}
          onChange={selectSpent}
        />
      </div>
    </ItemWrapper>
  )
};

const QuickSelectButton = ({ amount, checked, label, onChange, name }) => (
  <div className="flex justify-between">
    <div className="text-right w-1/3">{label}:</div>
    <div className="text-right w-1/2">{MoneyFormatter(amount, { decorate: true })}</div>
    <div className="w-8">
      <input type="radio" onChange={onChange} checked={checked} name={name} />
    </div>
  </div>
)

export default ItemGroup;
