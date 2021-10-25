import React, { useState } from "react";
import Select from "react-select"
import { sectionClasses } from "./App"

export default props => {
  const {
    categories,
    dispatch,
    rolloverItem,
  } = props
  const flexItemSectionClassName = sectionClasses.join(' ')
  return (
    <div className={flexItemSectionClassName}>
      <div>Apply to:</div>
      <CategorySelect categories={categories} dispatch={dispatch} rolloverItem={rolloverItem} />
    </div>
  )
}

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
