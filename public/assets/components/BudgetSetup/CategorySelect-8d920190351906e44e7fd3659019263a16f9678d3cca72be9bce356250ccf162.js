import React from "react";
import Select from "react-select"

import Button, { DisabledButton } from "../shared/Button";
import Icon from "../shared/Icons";
import { AmountInput } from "../shared/TextInput";

import { sortByLabel as sortFn } from "../../lib/Functions"

import { setup as copy } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"

const CategorySelect = props => {
  const { categoryOptions, dispatch, selectedCategory } = props
  const { budgetCategorySlug, displayAmount } = selectedCategory
  const nullOption = { value: null, label: "" }
  const value = [nullOption, ...categoryOptions].find(option => option.value === budgetCategorySlug)
  const onChange = event => { dispatch("categorySelectUpdate", { budgetCategorySlug: event.value }) }
  const handleAmountChange = event => dispatch("categorySelectUpdate", { displayAmount: event.target.value })
  const onClick = event => {
    event.preventDefault();
    dispatch("addItem", { slug: budgetCategorySlug })
  }
  const groupedOptions = [
    nullOption,
    { label: "Day to Day", options: categoryOptions.filter(c => !c.isMonthly).sort(sortFn) },
    { label: "Monthly", options: categoryOptions.filter(c => c.isMonthly).sort(sortFn) },
  ]
  const buttonDisabled = budgetCategorySlug === null || displayAmount === ""

  return (
    <div className="w-full justify-between flex">
      <div className="w-6/12">
        <Select
          placeholder="Select Category"
          onChange={onChange}
          options={groupedOptions}
          value={value}
        />
       </div>
       <div className="w-4/12">
         <AmountInput
           onChange={handleAmountChange}
           classes={["p-1 h-full text-right w-8/12 rounded border border-gray-400 border-solid"]}
           placeholder="amount"
           value={displayAmount}
         />
      </div>
      <AddItemButton buttonDisabled={buttonDisabled} onClick={onClick}>
        <Icon className="fas fa-plus" />
        {" "}
        {titleize(copy.addItemText)}
      </AddItemButton>
   </div>
  )
}

const AddItemButton = ({ children, buttonDisabled, onClick }) => {
  if (buttonDisabled) {
    return (
      <DisabledButton>{children}</DisabledButton>
    )
  } else {
    return (
      <Button type="add-item" bgColor="bg-blue-600" hoverBgColor="hover:bg-blue-700" onClick={onClick}>
        {children}
      </Button>
    )
  }
}

export default CategorySelect;
