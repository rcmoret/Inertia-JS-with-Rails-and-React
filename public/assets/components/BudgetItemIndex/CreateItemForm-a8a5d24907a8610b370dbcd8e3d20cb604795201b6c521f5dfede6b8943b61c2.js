import React, { useState } from "react";
import Select from "react-select";

import {
  asOption,
  isExpense,
  isRevenue,
  generateIdentifier,
  sortByName,
} from "../../lib/Functions";
import { postItemCreateEvent } from "./Functions";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { titles, shared } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions";

import { AmountInput } from "../shared/TextInput";
import Button, { DisabledButton } from "../shared/Button";
import Row from "../shared/Row";

const FormButton = ({ form, onSubmit }) => {
  if (form.amount !== "" && form.categorySlug !== null) {
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

const CreateItemForm = (props) => {
  const { availableCategories, isFormShown, month, toggleForm, year, fns } = props
  const [form, updateForm] = useState({
    amount: "",
    categorySlug: null,
  })

  const handleInputChange = event => updateForm({ ...form, amount: event.target.value })
  const handleSelectChange = event => {
    if (form.amount === "") {
      updateForm({ ...form, amount: MoneyFormatter(event.defaultAmount, { decorate: false }), categorySlug: event.value })
    } else {
      updateForm({ ...form, categorySlug: event.value })
    }
  }
  const categoryOption = category => ({
    ...asOption(category, {
      labelFn: cat => `${cat.name} - ${MoneyFormatter(cat.defaultAmount, { absolute: true })}`,
      valueFn: cat => cat.slug,
    }),
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
  const value = availableCategories.find(c => c.value === form.categorySlug)
  const onSuccess = page => {
    toggleForm()
    fns.onPostSuccess(page)
  }
  const onSubmit = () => {
    postItemCreateEvent(
      { budgetItemKey: generateIdentifier(), budgetCategorySlug: form.categorySlug, amount: decimalToInt(form.amount), month, year, },
      { onSuccess }
    )
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
            classes={["text-right", "h-full", "w-full"]}
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
