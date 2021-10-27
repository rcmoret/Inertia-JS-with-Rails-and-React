import React from "react";
import Select from "react-select"
import Button from "../shared/Button";
import Icon from "../shared/Icons";
import { sortByName as sortFn } from "../../lib/Functions"

const CategorySelect = props => {
  const { categories, dispatch, month, selectedCategoryId, year } = props
  const nullOption = { value: null, label: "" }
  const value = categories.find(option => option.value === selectedCategoryId)
  const onChange = event => { dispatch('categorySelect', { value: event.value }) }
  const onClick = event => {
    event.preventDefault();
    if (value.value !== null) {
      dispatch('addItem', { ...value, month: month, year: year })
    }
  }
  const groupedOptions = [
    nullOption,
    { label: "Day to Day", options: categories.filter(c => !c.isMonthly).sort(sortFn) },
    { label: "Monthly", options: categories.filter(c => c.isMonthly).sort(sortFn) },
  ]

  return (
    <div className='w-1/2 justify-between flex'>
      <div className='w-3/4'>
        <Select
          placeholder='Select Category'
          onChange={onChange}
          options={groupedOptions}
          value={value}
        />
       </div>
      <Button type='add-item' bgColor='bg-blue-600' hoverBgColor='hover:bg-blue-700' onClick={onClick}>
        <Icon className='fas fa-plus' />
        {' '}
        Add Item
      </Button>
   </div>
  )
}

export default CategorySelect;
