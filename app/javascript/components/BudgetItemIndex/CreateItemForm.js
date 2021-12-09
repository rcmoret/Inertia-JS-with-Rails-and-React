import React, { useState } from "react";
import Select from "react-select"

import {
  asOption,
  isExpense,
  isRevenue,
  sortByName,
} from "../../lib/Functions"
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter"
import { titles, shared } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"

import { AmountInput } from "../shared/TextInput";
import Button, { DisabledButton } from "../shared/Button";
import Row from "../shared/Row";

const FormButton = ({ form, onSubmit }) => {
  if (form.amount !== "" && form.categoryId !== null) {
    return (
      <Button
        bgColor="bg-green-600"
        hoverBgColor="bg-green-800"
        onClick={onSubmit}
      >
        Create Item
      </Button>
    )
  } else {
    return (
      <DisabledButton>
        Create Item
      </DisabledButton>
    )
  }
}

const CreateItemForm = ({ availableCategories, postItemCreateEvent, isFormShown, toggleForm }) => {
  const [form, updateForm] = useState({
    amount: "",
    categoryId: null,
  })

  const handleInputChange = event => updateForm({ ...form, amount: event.target.value })
  const handleSelectChange = event => {
    if (form.amount === "") {
      updateForm({ amount: MoneyFormatter(event.defaultAmount, { decorate: false }), categoryId: event.value })
    } else {
      updateForm({ ...form, categoryId: event.value })
    }
  }
  const categoryOption = category => ({
    ...asOption(category, { labelFn: cat => `${cat.name} - ${MoneyFormatter(cat.defaultAmount, { absolute: true })}` }),
    defaultAmount: category.defaultAmount,
  })
  const expenseOptions = availableCategories.filter(isExpense).sort(sortByName).map(categoryOption)
  const revenueOptions = availableCategories.filter(isRevenue).sort(sortByName).map(categoryOption)

  const nullOption = { value: null, label: "" }
  const groupedOptions = [
    nullOption,
    { label: titleize(titles.expenses), options: expenseOptions },
    { label: titleize(titles.revenues), options: revenueOptions },
  ]
  const value = availableCategories.find(c => c.value === form.categoryId)
  const onSubmit = () => {
    postItemCreateEvent(form.categoryId, decimalToInt(form.amount), { onSuccess: toggleForm })
  }

  if (isFormShown) {
    return (
      <Row styling={{overflow: null, padding: "pl-2 pr-2", margin: "mt-2 mb-2"}}>
        <div className="w-5/12">
          <Select
            placeholder={titleize(shared.selectCategory)}
            onChange={handleSelectChange}
            options={groupedOptions}
            value={value}
          />
        </div>
        <div className="ml-2 w-3/12">
          <AmountInput
            classes={["h-full", "w-full"]}
            onChange={handleInputChange}
            value={form.amount}
          />
        </div>
        <div className="text-right w-4/12">
          <FormButton form={form} onSubmit={onSubmit} />
        </div>
      </Row>
    )
  } else {
    return null
  }
}

export default CreateItemForm;