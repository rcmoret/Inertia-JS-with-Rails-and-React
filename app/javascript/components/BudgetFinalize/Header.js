import React, { useState } from "react";
import Select from "react-select"

import Section from "../shared/Section"

export default props => {
  const {
    categories,
    dispatch,
    rolloverItem,
  } = props
  return (
    <Section>
      <div>Apply to:</div>
      <CategorySelect categories={categories} dispatch={dispatch} rolloverItem={rolloverItem} />
    </Section>
  )
}

const CategorySelect = ({ categories, dispatch, rolloverItem }) => {
  const nullOption = { value: null, label: "" }
  const value = categories.find(option => option.value === rolloverItem.budgetCategoryId)
  const options = [nullOption, ...categories]
  const onChange = event => {
    const category = categories.find(category => category.value === event.value)
    dispatch('updateRolloverItem', { budgetCategoryId: category.value, name: category.label })
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
