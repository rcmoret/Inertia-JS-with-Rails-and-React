import React from "react";

import { Inertia } from "@inertiajs/inertia";
import Select from "react-select";

import Button, { DisabledButton } from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Row, { StripedRow } from "../shared/Row";
import TextInput from "../shared/TextInput";

import { decimalToInt } from "../../lib/MoneyFormatter";

const Form = ({ category, closeForm, icons, onSubmit, update }) => {
  const {
    id,
    archivedAt,
    displayAmount,
    icon,
    iconId,
    isArchived,
    isAccrual,
    isExpense,
    isMonthly,
    isNew,
    maturityIntervals,
    name,
    slug,
  } = { ...category, ...category.updatedAttributes }
  const { updatedAttributes } = category

  const isTrue = val => val === true || val == "true"
  const isFalse = val => val === false || val === "false"
  const handleChange = event => {
    update({ [event.target.name]: event.target.value })
 }
  const handleDefaultAmountChange = event => update({
    defaultAmount: decimalToInt(event.target.value),
    displayAmount: event.target.value,
  })
  const handleAccrualChange = () => update({ isAccrual: !isAccrual })
  const handleIconSelectChange = event => update({ iconId: event.value })

  return (
    <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible"}}>
      <div className="w-2/12">
        <TextInput type="text" value={name} onChange={handleChange} name="name" />
      </div>
      <div className="w-1/12">
        <TextInput classes={["w-full"]} type="text" value={slug} onChange={handleChange} name="slug" />
      </div>
      <div className="w-1/12 text-right pr-4">
        <TextInput classes={["w-11/12 text-right"]} type="text" value={displayAmount} onChange={handleDefaultAmountChange} name="defaultAmount" />
      </div>
      <div className="w-2/12 italic">
        <Row styling={{wrap: "flex-wrap"}}>
          <ExpenseRadio onChange={handleChange} isExpense={isTrue(isExpense)} isEnabled={isNew} isRevenue={isFalse(isExpense)} />
          <MonthlyRadio onChange={handleChange} isMonthly={isTrue(isMonthly)} isEnabled={isNew} isDayToDay={isFalse(isMonthly)} />
          {isExpense && <AccrualCheckBox isAccrual={isAccrual} handleChange={handleAccrualChange} />}
        </Row>
      </div>
      <div className="w-1/10">
        <IconSelect iconId={iconId} options={icons} handleChange={handleIconSelectChange} />
      </div>
      <div className="w-1/10">
      </div>
      <div className="w-2/12 italic">
        {isArchived && <span>Archived on {fromDateString(archivedAt)}</span>}
      </div>
      <div className="w-2/12">
        <FormLinks closeForm={closeForm} onSubmit={onSubmit} updatedAttributes={updatedAttributes} />
      </div>
    </StripedRow>
  )
}

const ExpenseRadio = ({ isExpense, isEnabled, isRevenue, onChange }) => (
  <Cell styling={{width: "w-6/12", wrap: "flex-wrap", fontSize: "text-xs"}}>
    <div className="w-full">
      Expense
    </div>
    <div className="w-full">
      <input name="isExpense" disabled={!isEnabled} value={true} checked={isExpense} onChange={onChange} type="radio" />
    </div>
    <div className="w-full">
      Revenue
    </div>
    <div className="w-full">
      <input name="isExpense" disabled={!isEnabled} value={false} checked={isRevenue} onChange={onChange} type="radio" />
    </div>
  </Cell>
)

const MonthlyRadio = ({ isMonthly, isEnabled, isDayToDay, onChange }) => (
  <Cell styling={{width: "w-6/12", wrap: "flex-wrap", fontSize: "text-xs"}}>
    <div className="w-full">
      Monthly
    </div>
    <div className="w-full">
      <input name="isMonthly" value={true} disabled={!isEnabled} onChange={onChange} checked={isMonthly} type="radio" />
    </div>
    <div className="w-full">
      Day-to-Day
    </div>
    <div className="w-full">
      <input name="isMonthly" value={false} disabled={!isEnabled} onChange={onChange} checked={isDayToDay} type="radio" />
    </div>
  </Cell>
)

const AccrualCheckBox = ({ isAccrual, handleChange }) => (
  <Cell styling={{width: "w-full", wrap: "flex-wrap", fontSize: "text-xs"}}>
    <div className="w-6/12">
      Accrual?
    </div>
    <div className="w-2/12">
      <input type="checkbox" name="accrual" checked={isAccrual} onChange={handleChange} />
    </div>
  </Cell>
)

const IconSelect = ({ iconId, handleChange, ...props }) => {
  const options = [{ value: null, label: ""}, ...props.options]
  const value = options.find(option => option.value === iconId)

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange}
    />
  )
}

const FormLinks = ({ onSubmit, closeForm }) => (
  <Row>
    <div>
      <SubmitButton onSubmit={onSubmit} updatedAttributes={updatedAttributes}>
        Submit
        {" "}
        <Icon className="fas fa-check" />
      </SubmitButton>
    </div>
    <div>
      <Button onClick={closeForm} bgColor="bg-red-700" hoverBgColor="hover:bg-red-800">
        Close
        {" "}
        <Icon className="fas fa-times" />
      </Button>
    </div>
  </Row>
)

const SubmitButton = ({ onSubmit, updatedAttributes }) => {
  if (Object.entries(updatedAttributes).length) {
    return (
      <Button bgColor="bg-green-700" hoverBgColor="bg-green-800" onClick={onSubmit}>
        Submit
      </Button>
    )
  } else {
    return (
      <DisabledButton>{children}</DisabledButton>
    )
  }
}

export default Form;
