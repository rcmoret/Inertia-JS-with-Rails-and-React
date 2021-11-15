import React from "react";
import MoneyFormatter from "../../lib/MoneyFormatter";

import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Section from "../shared/Section"
import Row, { StripedRow, TitleRow } from "../shared/Row"
import TextInput from "../shared/TextInput"

const ItemGroup = ({ collection, name, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <Section>
        <TitleRow styling={{backgroundColor: "bg-gradient-to-r from-green-300 to-green-600"}}>
          <div>
            &#8226;
            {" "}
            <span className="underline">
              {name}
            </span>
          </div>
        </TitleRow>
        {collection.map(model => (
          <ModelForms key={model.id} model={model} dispatch={dispatch} />
        ))}
      </Section>
    )
  }
};

const ModelForms = ({ model, dispatch }) => {
  const { name, existingItems, newItems } = model
  const combinedItems = [...existingItems, ...newItems]
  const hasBorder = combinedItems.length > 1

  if (combinedItems.length === 0) {
    return null
  } else {
    return (
      <StripedRow styling={{ wrap: "flex-wrap"}}>
        <Cell styling={{width: "w-full"}}>
          <div className="text-xl w-4/12">
            <span className="text-sm">
              <Icon className="fas fa-caret-right" />
            </span>
            {" "}
            <span className="underline">
              {model.name}
            </span>
            {" "}
            <i className={model.iconClassName} />
          </div>
        </Cell>
        <ExistingItems items={existingItems} dispatch={dispatch} hasBorder={hasBorder} />
        <NewItems items={newItems} dispatch={dispatch} hasBorder={hasBorder} />
      </StripedRow>
    )
  }
}

const ExistingItems = ({ items, dispatch }) => {
  if (items.length === 0) {
    return null
  } else {
    return (
      <div className="w-full">
        {items.map(item => (
          <ExistingItem key={item.id} item={item} dispatch={dispatch} />
        ))}
      </div>
    )
  }
}

const NewItems = ({ items, dispatch, hasBorder }) => {
  if (items.length === 0) {
    return null
  } else {
    return (
      <Row styling={{ wrap: "flex-wrap" }}>
        {items.map((item, index) => (
          <NewItem key={item.id} index={index} item={item} dispatch={dispatch} hasBorder={hasBorder} />
        ))}
      </Row>
    )
  }
}

const ItemWrapper = props => {
  const { children, item, inputChange, hasBorder, removeItem } = props
  const inputClassName = "text-right rounded w-4/5 border border-gray-400 border-solid"

  const baseClasses = ["w-full", "flex", "justify-between", "content-end"]
  const classes = hasBorder ? [...baseClasses, "border-b", "border-gray-700", "border-solid", "mb-2", "pb-1"] : baseClasses
  const className = classes.join(" ")
  return (
    <div className={className}>
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
    </div>
  )
}

export const ExistingItem = props => {
  const { item, dispatch, hasBorder } = props
  const inputChange = event => {
    dispatch("adjustExistingItem", { id: item.id, displayAmount: event.target.value })
  }
  const removeItem = event => {
    event.preventDefault()
    dispatch("removeItem", { id: item.id })
  }

  return (
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem} hasBorder={hasBorder}>
      <div><strong>Existing Item</strong></div>
    </ItemWrapper>
  )
};

export const NewItem = ({ item, index, dispatch, hasBorder }) => {
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
    <ItemWrapper item={item} inputChange={inputChange} removeItem={removeItem} hasBorder={hasBorder}>
      <div className="w-3/12"><strong>New Item</strong></div>
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
    <div className="w-1/3">{label}:</div>
    <div className="text-right w-1/2">{MoneyFormatter(amount, { decorate: true })}</div>
    <div className="w-8">
      <input type="radio" onChange={onChange} checked={checked} name={name} />
    </div>
  </div>
)

export default ItemGroup;
