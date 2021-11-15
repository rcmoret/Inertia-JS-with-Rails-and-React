import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

import CategorySelect from "./CategorySelect"
import Form, { reducer, eventsReducer } from "./Form";
import ItemGroup, { ExistingItemForm, NewItemForm } from "./ItemGroup";

import DateFormatter from "../../lib/DateFormatter";
import { sortByName as sortFn } from "../../lib/Functions";

import AmountSpan from "../shared/AmountSpan";
import Button from "../shared/Button";
import Section from "../shared/Section";

const BudgetSetupApp = (props) => {
  const initialForm = Form(props)
  const [form, setFormObject] = useState(initialForm);
  const dispatch = (event, payload) => setFormObject(reducer(event, form, payload))
  const { categories, categoryOptions, selectedCategory, month, year } = form
  const models = categories.reduce((array, category) => {
    const existingItems = form.existingItems.filter(item => item.budgetCategoryId === category.id)
    const newItems = form.newItems.filter(item => item.budgetCategoryId === category.id)

    const object = {
      ...category,
      existingItems,
      newItems,
    }

    return [...array, object]
  }, [])
  const accruals = models.filter(model => model.isAccrual).sort(sortFn)
  const revenues = models.filter(model => !model.isExpense).sort(sortFn)
  const monthlyExpenses = models.filter(model => !model.isAccrual && model.isExpense && model.isMonthly).sort(sortFn)
  const dayToDayExpenses = models.filter(model => !model.isAccrual && model.isExpense && !model.isMonthly).sort(sortFn)
  const balance = [...form.existingItems, ...form.newItems].reduce((sum, item) => sum + item.amount, 0)
  const onSubmit = ev => {
    ev.preventDefault();
    const events = eventsReducer(form)
    Inertia.post("/budget/set-up", { events })
  }
  const dateString = DateFormatter({ month, year, day: 1, format: "shortMonthYear" })
  document.title = `Set up ${dateString}`

  return (
    <div>
      <div className="flex justify-between mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-8/12 rounded h-v90 overflow-scroll">
          <form className="z-10" onSubmit={onSubmit}>
            <Section styling={{ flexAlign: "flex-row-reverse" }}>
              <CategorySelect
                categoryOptions={categoryOptions}
                dispatch={dispatch}
                selectedCategory={selectedCategory}
              />
            </Section>
            <ItemGroup name="Accruals" ItemForm={NewItemForm} collection={accruals} dispatch={dispatch} />
            <ItemGroup name="Revenues" ItemForm={NewItemForm} collection={revenues} dispatch={dispatch} />
            <ItemGroup name="Monthly Expenses" ItemForm={NewItemForm} collection={monthlyExpenses} dispatch={dispatch} />
            <ItemGroup name="Day-to-Day Expenses" ItemForm={NewItemForm} collection={dayToDayExpenses} dispatch={dispatch} />
            <div className="flex justify-between flex-row-reverse">
              <div className="bg-white rounded justify-between flex-row-reverse pl-6 pr-6 pt-2 pb-2">
                <Button bgColor="bg-green-600" hoverBgColor="hover:bg-green-700" onSubmit={onSubmit}>
                  Create Budget
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className="w-3/12 p-2 mb-4 rounded z-50">
          <div className="bg-blue-900 p-2 rounded">
            <div className="bg-white p-4 rounded shadow-lg">
              <div className="border-b-2 border-blue-900 border-solid">
                <h1 className="text-2xl">Set up: {dateString}</h1>
              </div>
              <div className="flex justify-between text-xl">
                <div>Balance</div>
                <div className="text-xl text-right">
                  <AmountSpan amount={balance} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSetupApp;
