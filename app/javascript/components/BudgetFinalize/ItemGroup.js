import React, { useState } from "react";
import Select from "react-select";
import { sortByName as sortFn } from "../../lib/Functions"

import { shared, finalize as copy } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"

import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter"

import AmountSpan from "../shared/AmountSpan";
import { Point } from "../shared/symbol";
import { StripedRow, TitleRow } from "../shared/Row";
import Section from "../shared/Section";
import TextInput from "../shared/TextInput";

export default ({ name, collection, dispatch }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <Section>
        <TitleRow styling={{backgroundColor: "bg-gradient-to-r from-green-600 to-green-300"}}>
          <Point>{name}</Point>
        </TitleRow>
        {collection.map(model => (
          <ModelForm key={model.id} model={model} dispatch={dispatch} />
        ))}
      </Section>
    )
  }
};

const ModelForm = ({ dispatch, model }) => {
  const { id, baseItems, iconClassName, name, targetItems } = model

  return (
    <StripedRow styling={{overflow: null}}>
      <div className="mb-1 rounded w-3/12">
        <div>{name}{" "}<i className={iconClassName} /></div>
        {model.baseItems.map(item => (
          <TargetItemSelect
            key={item.key}
            baseItem={item}
            categoryId={id}
            dispatch={dispatch}
            targetItems={targetItems}
          />
        ))}
      </div>
      <div width="w-5/12">
        {model.baseItems.map(item => (
          <BaseItem key={item.key} item={item} categoryId={id} dispatch={dispatch} />
        ))}
      </div>
      <div className="w-3/12 text-right">
        <TargetItems baseItems={baseItems} targetItems={targetItems} />
      </div>
    </StripedRow>
  )
};

const ItemsWrapper = ({ children }) => (
  <div className="w-full flex justify-between flex-wrap items-center">
    {children}
  </div>
)

const TargetItems = ({ baseItems, targetItems }) => {
  const displayItems = targetItems.reduce((array, item) => {
    if (baseItems.map(i => i.targetItemKey).includes(item.budgetItemKey)) {
      return [...array, item]
    } else {
      return array
    }
  }, [])

  if (displayItems.length === 1 && targetItems.length === 1) {
    const item = displayItems[0]
    return(
      <ItemsWrapper>
        <TargetItem key={item.key} multiple={false} baseItems={baseItems} item={item} />
      </ItemsWrapper>
    )
  } else {
    return (
      <ItemsWrapper>
        <div className ="w-full">Target Items</div>
        {displayItems.map(item => (
          <TargetItem key={item.key} multiple={true} baseItems={baseItems} item={item} />
        ))}
      </ItemsWrapper>
    )
  }
}

const TargetItem = ({ item, baseItems, multiple }) => {
  const { budgetItemKey, budgeted } = item
  const newAmount = baseItems.reduce((sum, i) => {
    if (i.targetItemKey === item.budgetItemKey && i.rolloverAmount != null) {
      return sum + i.rolloverAmount
    } else {
      return sum
    }
  }, budgeted)
  const appliedToExtra = baseItems.reduce((sum, i) => {
    if (i.inputAmount === "" || i.targetItemKey !== budgetItemKey) {
      return sum
    } else {
      return sum + i.remaining - i.rolloverAmount
    }
  }, 0)
  const spanProps = { color: "text-green-700", negativeColor: "text-green-700" }
  return (
    <>
      {multiple && <div className="w-full">{item.name}</div>}
      <div className="w-1/2">
        {titleize(shared.budgeted)}:
      </div>
     <div className="w-1/2">
        <AmountSpan amount={budgeted} { ...spanProps } />
      </div>
      <div className="w-1/2">
        {titleize(shared.newAmount)}:
      </div>
      <div className="w-1/2">
        <AmountSpan amount={newAmount} { ...spanProps } />
      </div>
      <div className="w-1/2">
        {copy.appliedToExtra}
      </div>
      <div className="w-1/2">
        <AmountSpan amount={appliedToExtra} { ...spanProps }/>
      </div>
    </>
  )
}

const BaseItem = ({ item, dispatch, categoryId }) => {
  const {
    key,
    inputAmount,
    status,
    remaining,
  } = item
  const inputChange = event => dispatch("updateBudgetModel", {
    budgetCategoryId: categoryId,
    key,
    inputAmount: event.target.value,
  })
  const selectAll = () => dispatch("updateBudgetModel", {
    budgetCategoryId: categoryId,
    key,
    inputAmount: MoneyFormatter(remaining),
  })
  const selectNone = () => dispatch("updateBudgetModel", {
    budgetCategoryId: categoryId,
    key,
    inputAmount: "0.00",
  })
  const partialAmount = status === "rolloverPartial" ? decimalToInt(inputAmount) : ""

  return (
    <div className="w-full flex justify-between flex-wrap" >
      <div className="w-1/2">
        <QuickSelectButton
          amount={remaining}
          checked={status === "rolloverAll"}
          label={titleize(copy.all)}
          name={key}
          onChange={selectAll}
          remaining={remaining}
        />
        <QuickSelectButton
          amount={0}
          checked={status === "rolloverNone"}
          label={titleize(copy.none)}
          name={key}
          onChange={selectNone}
          remaining={remaining}
        />
        <QuickSelectButton
          amount={partialAmount}
          checked={status === "rolloverPartial"}
          label={titleize(copy.partial)}
          name={key}
          onChange={() => null}
          remaining={remaining}
        />
      </div>
      <div className="text-right w-5/12">
        <div>
          {shared.currencySymbol}
          {" "}
          <TextInput
            onChange={inputChange}
            classes={["text-right", "rounded", "w-4/5 border border-gray-400 border-solid"]}
            value={inputAmount}
          />
        </div>
      </div>
    </div>
  )
};

const QuickSelectButton = ({ amount, checked, label, onChange, name, remaining }) => {
  const shouldRender = () => {
    if (label !== copy.partial) {
      return true
    } else {
      if (amount === 0 || amount === "" || amount === remaining) {
        return false
      } else {
        return true
      }
    }
  }
  if (shouldRender()) {
    return (
      <div className="flex justify-between w-full">
        <div className="text-right w-full flex justify-between">
          <div>{label}:</div>
          <div>
            <Amount amount={amount} />
          </div>
        </div>
        <div className="w-4 ml-4">
          <input type="radio" onChange={onChange} checked={checked} name={name} />
        </div>
      </div>
    )
  } else {
    return null
  }
}

const Amount = ({ amount }) => (
  <AmountSpan
    amount={amount}
    color="text-green-700"
    negativeColor="text-green-700"
  />
);

const TargetItemSelect = ({ categoryId, baseItem, dispatch, targetItems }) => {
  const itemOptions = targetItems
    .sort((a, b) => {
      if (a.isNew && b.isNew) {
        return 1
      } else if (!b.isNew && a.isNew) {
        return -1
      } else {
        return sortFn(a, b)
      }
    })
    .map(item => ({
      value: item.budgetItemKey,
      label: item.name
    }))
  const options = [{ value: null, lable: "" }, ...itemOptions]
  const value = options.find(option => option.value === baseItem.targetItemKey)
  const onChange = event => {
    dispatch("updateBudgetModel", {
      targetItemKey: event.value,
      key: baseItem.key,
      budgetCategoryId: categoryId,
    })
  }

  if (targetItems.length === 1) {
    return null
  } else {
    return (
      <Select
        onChange={onChange}
        options={options}
        value={value}
      />
    )
  }
};
