import React from "react";
import Select from "react-select";

import AmountInput from "../shared/TextInput";
import Button from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row from "../shared/Row";

import {
  asOption,
  clearedMonthly,
  generateIdentifier,
  sortByName,
  sortByClearedThenName
} from "../../lib/Functions";
import { eventsFrom, postEvents } from "./Functions"
import { index as copy, shared } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

const newItemModel = category => {
  const key = generateIdentifier()

  return {
    ...category,
    key,
    id: key,
    adjustmentAmount: 0,
    amount: 0,
    bottomLineChange: 0,
    budgetCategoryId: category.id,
    budgetCategorySlug: category.slug,
    difference: 0,
    eventType: copy.multiItemAdjustForm.events.create,
    inputAmount: "",
    isMarkedForDelete: false,
    isNewItem: true,
  }
};

const existingItemModel = item => ({
  ...item,
  adjustmentAmount: 0,
  inputAmount: "",
  bottomLineChange: 0,
  eventType: copy.multiItemAdjustForm.events.adjust,
  isMarkedForDelete: false,
  isNewItem: false,
})

const MultiItemAdjustForm = props => {
  const { availableCategories, clearAdjustItemsForm, interval, items, fns, formData, updateAdjustItemsForm } = props
  const {
    adjustmentItems,
    notes,
    selectedCategorySlug,
    selectedItemId,
  } = formData
  const { month, year } = interval
  const adjustmentItemKeys = adjustmentItems.map(item => item.key)
  const itemLabelFn = item => {
    if (clearedMonthly(item)) {
      return `${item.name} - (cleared ${MoneyFormatter(item.amount, { decorate: true, absolute: true })})`
    } else {
      return `${item.name} - ${MoneyFormatter(item.remaining, { decorate: true, absolute: true })}`
    }
  }
  const itemOptions = [
    { value: null, label: titleize(copy.multiItemAdjustForm.existingItems) },
    ...items.sort(sortByClearedThenName)
    .filter(item => !adjustmentItemKeys.includes(item.key))
    .map(item => asOption(item, { labelFn: itemLabelFn }))
  ]
  const handleItemSelectChange = event => updateAdjustItemsForm({ selectedItemId: event.value })
  const selectedItem = itemOptions.find(item => item.value ===  selectedItemId)
  const categoryLabelFn = category => `${category.name} - ${MoneyFormatter(category.defaultAmount, { decorate: true, absolute: true })}`
  const categoryValueFn = category => category.slug
  const newDayToDayCategoryNames = adjustmentItems.reduce((arr, item) =>
    item.eventType === copy.multiItemAdjustForm.events.create ? [...arr, item.name] : arr,
    []
  )
  const categoryOptions = [
    { value: null, label: titleize(copy.multiItemAdjustForm.availableCategories) },
    ...availableCategories
    .filter(category => !newDayToDayCategoryNames.includes(category.name))
    .sort(sortByName)
    .map(category => asOption(category, { labelFn: categoryLabelFn, valueFn: categoryValueFn }))
  ]
  const handleCategorySelectChange = event => updateAdjustItemsForm({ selectedCategorySlug: event.value })
  const handleNotesChange = event => updateAdjustItemsForm({ notes: event.target.value })
  const selectedCategory = categoryOptions.find(category => category.value ===  selectedCategorySlug)
  const bottomLineChange = adjustmentItems.reduce((sum, item) => sum + item.bottomLineChange, 0)
  const addCategoryItem = () => {
    const category = availableCategories.find(category => selectedCategorySlug === category.slug)
    if (category === undefined) {
      return null
    } else {
      updateAdjustItemsForm({
        selectedCategorySlug: null,
        adjustmentItems: [
          ...adjustmentItems,
          newItemModel(category),
        ]
      })
    }
  }
  const addExistingItem = () => {
    const item = items.find(item => selectedItemId === item.id)
    if (item === undefined) {
      return null
    } else {
      updateAdjustItemsForm({
        selectedItemId: null,
        adjustmentItems: [
          ...adjustmentItems,
          existingItemModel(item),
        ]
      })
    }
  }

  const updateAdjustmentItem = (id, payload) => {
    updateAdjustItemsForm({
      adjustmentItems: adjustmentItems.map(item =>
        item.id === id ? { ...item, ...payload } : item
      )
    })
  }

  const removeItem = id => updateAdjustItemsForm({
    adjustmentItems: adjustmentItems.filter(item => item.id !== id)
  })

  const toggleDeletion = id => updateAdjustItemsForm({
    adjustmentItems: adjustmentItems.map(item =>
      item.id === id ? { ...item, isMarkedForDelete: !item.isMarkedForDelete } : item
    )
  })

  const onSubmit = () => {
    const events = eventsFrom(adjustmentItems, month, notes, year)
    const onSuccess = page => {
      clearAdjustItemsForm()
    }
    postEvents({ events, month, year }, { onSuccess })
  }

  const containerStyling = {
    bgColor: "bg-gray-200",
    border: "border-b-2 border-blue-900 border-solid",
    overflow: null,
    padding: "pr-1 pl-1",
    rounded: null,
    wrap: "flex-wrap",
  }

  return (
    <Row styling={containerStyling} >
      <div className="w-full text-xl">
        {copy.multiItemAdjustForm.title}
      </div>
      <Row styling={{wrap: "flex-wrap", overflow: null, border: "border-b border-gray-700 border-solid", rounded: null}}>
        <ItemSelect
          addItem={addCategoryItem}
          onChange={handleCategorySelectChange}
          options={categoryOptions}
          selectedOption={selectedCategory}
        />
        <ItemSelect
          addItem={addExistingItem}
          onChange={handleItemSelectChange}
          options={itemOptions}
          selectedOption={selectedItem}
        />
      </Row>
      <Row styling={{ wrap: "flex-wrap"}}>

        <div className="w-6/12">
          {titleize("categories")}
        </div>

        <div className="w-6/12 text-right">
          {titleize(shared.adjustment)}
        </div>

      </Row>
      {adjustmentItems.map(item => (
        <FormRow
          key={item.id}
          model={item}
          removeItem={removeItem}
          toggleDeletion={toggleDeletion}
          updateAdjustmentItem={updateAdjustmentItem}
        />
      ))}
      <BottomLine amount={bottomLineChange} handleChange={handleNotesChange} onSubmit={onSubmit} notes={notes} />
    </Row>
  )
}

const borderTop = "border-t border-gray-700 border-solid"

const ItemSelect = ({ addItem, onChange, options, selectedOption }) => {
  const linkColor = `text-${selectedOption.value ? "blue" : "gray"}-800`
  if (options.length) {
    return (
      <Cell styling={{width: "w-full md:w-6/12", overflow: null}}>
        <div className="w-10/12">
          <Select
            onChange={onChange}
            options={options}
            value={selectedOption}
          />
        </div>
        <div className="w-2/12 pl-4">
          <Link onClick={addItem} color={linkColor}>
            <Icon className="fa fa-plus-circle" />
          </Link>
        </div>
      </Cell>
    )
  } else {
    return (
      <Cell styling={{width: "w-6/12", overflow: null}}>
      </Cell>
    )
  }
}

const BottomLine = ({ amount, notes, handleChange, onSubmit }) => {
  const colorStyles = () => {
    if (amount > 0) {
      return [
        "bg-green-700",
        "text-white",
      ]
    } else if (amount < 0) {
      return [
        "bg-red-700",
        "text-black",
      ]
    } else {
      return [
        "bg-black",
        "text-white",
      ]
    }
  }
  const styling = [
    "rounded",
    "w-4/12 md:w-2/12",
    "pr-2",
    "text-right",
    ...colorStyles(),
  ]
  const className = styling.join(" ")
  return (
    <Row styling={{border: borderTop, wrap: "flex-wrap", rounded: null}}>
      <Cell styling={{width: "w-9/12 md:w-4/12"}}>
        <textarea
          className="w-full md:w-6/12"
          onChange={handleChange}
          placeholder="notes"
          style={{minHeight: "100px"}}
          value={notes}
        />
      </Cell>
      <Cell styling={{width: "w-full md:w-4/12", alignItems: "items-start"}}>
        <div>{titleize(copy.multiItemAdjustForm.bottomLineChange)}</div>
        <div className={className}>{MoneyFormatter(amount, { decorate: true, absolute: true })}</div>
      </Cell>
      <div className="items-start">
        <Button onClick={onSubmit} color="text-white" bgColor="bg-green-700" hoverBgColor="bg-green-800">
          {titleize(copy.multiItemAdjustForm.submitText)}
        </Button>
      </div>
    </Row>
  )
}

const FormCell = ({ align, children }) => (
  <div className={`w-2/12 text-${align}`}>
    {children}
  </div>
)

const FormRow = ({ model, removeItem, toggleDeletion, updateAdjustmentItem }) => {
  const {
    id,
    adjustmentAmount,
    amount,
    difference,
    eventType,
    inputAmount,
    isDeletable,
    isExpense,
    isNewItem,
  } = model

  const updatedBudgeted = isNewItem ? adjustmentAmount : amount + adjustmentAmount

  const onChange = event => {
    const newAdjustmentAmount = decimalToInt(event.target.value)
    const bottomLineChange = () => {
      if (isExpense) {
        if (difference >= 0) {
          return newAdjustmentAmount
        } else {
          const diff = difference - newAdjustmentAmount
          return diff > 0 ? diff : 0
        }
      } else { // isRevenue
        if (difference <= 0) {
          return newAdjustmentAmount
        } else {
          const diff = newAdjustmentAmount - difference
          return diff > 0 ? diff : 0
        }
      }
    }
    updateAdjustmentItem(
      id,
      {
        inputAmount: event.target.value,
        adjustmentAmount: newAdjustmentAmount,
        bottomLineChange: bottomLineChange(),
      }
    )
  }

  const onClick = () => removeItem(id)
  const updatedDifference = difference - adjustmentAmount

  return (
    <Row styling={{ wrap: "flex-wrap"}}>

      <Row>
        <div className="w-6/12">
          <Link onClick={onClick} color="text-black" classes={["text-sm"]}>
            <Icon className="fas fa-times" />
          </Link>
          {" "}
          {model.name}
        </div>

        <div className="w-6/12 flex justify-end">
          <AmountInput onChange={onChange} value={inputAmount} classes={["w-8/12", "text-right"]} />
        </div>
      </Row>

      {isDeletable && updatedDifference === 0 && <DeleteOption model={model} toggleDeletion={toggleDeletion} />}

      <Row styling={{ fontSize: "text-xs", wrap: "flex-wrap" }}>
        <div className="w-5/12 md:w-2/12 flex flex-wrap justify-between">
          <div className="w-8/12">previous budgeted:</div>
          <div className="w-4/12 text-right">{isNewItem ? shared.new : MoneyFormatter(amount, { decorate: true })}</div>
        </div>

        <div className="w-6/12 md:w-2/12 flex flex-wrap justify-between">
          <div className="w-8/12">previous difference:</div>
          <div className="w-4/12 text-right"> {isNewItem ? shared.new : MoneyFormatter(difference, { decorate: true })} </div>
        </div>

        <div className="w-5/12 md:w-2/12 flex flex-wrap justify-between">
          <div className="w-8/12">updated budgeted:</div>
          <div className="w-4/12 text-right">{MoneyFormatter(updatedBudgeted, { decorate: true })}</div>
        </div>

        <div className="w-6/12 md:w-2/12 flex flex-wrap justify-between">
          <div className="w-8/12">updated difference:</div>
          <div className="w-4/12 text-right">{MoneyFormatter(updatedDifference, { decorate: true })}</div>
        </div>
      </Row>

    </Row>
  )
}

const DeleteOption = ({ model, toggleDeletion }) => {
  const { id, isMarkedForDelete } = model
  const iconColor = `text-${isMarkedForDelete ? "black" : "gray-500"}`

  const onChange = () => toggleDeletion(id)
  return (
    <Row styling={{ flexAlign: "justify-end" }}>
      <Cell styling={{ width: "w-full md:w-4/12", flexAlign: "justify-end" }}>
        <div className="w-1/12">
          <input type="checkbox" onChange={onChange} checked={isMarkedForDelete} name={id} />
        </div>
        <div className={`${iconColor} w-1/12 text-right`}>
          <Icon className="fa fa-trash" />
        </div>
      </Cell>
    </Row>
  )
}

export default MultiItemAdjustForm;
