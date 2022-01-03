import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

import { parseISO } from 'date-fns'

import { fromDateString } from "../../lib/DateFormatter";
import evalInput from "../../lib/dynamicInputEvaluator";
import { isMatureAccrual, asOption } from "../../lib/Functions";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";
import { v4 as uuid } from "uuid";

import Button from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import { StripedRow } from "../shared/Row";
import Link from "../shared/Link";
import Row from "../shared/Row";
import TextInput, { AmountInput } from "../shared/TextInput";

const newDetail = () => ({
  uuid: uuid(),
  amount: "",
  budgetItemId: null,
  isNew: true,
  updatedAttributes: {}
})

export const newTransaction = (accountId, budgetExclusion) => ({
  accountId,
  checkNumber: "",
  clearanceDate: null,
  budgetExclusion,
  description: "",
  details: [{ ...newDetail() }],
  isEditable: false,
  notes: "",
  updatedAttributes: {},
})

export const NewForm = ({ account, transaction, ...props }) => {
  const [attributes, updateAttributes] = useState(transaction)
  const onSuccess = () => updateAttributes(newTransaction(account.id, !account.isCashFlow))

  return (
    <Form
      attributes={attributes}
      label="Create"
      onSuccess={onSuccess}
      updateAttributes={updateAttributes}
      {...props}
    />
  )
}

export const EditForm = ({ transaction, ...props }) => {
  const [attributes, updateAttributes] = useState({
    ...transaction,
    notes: (transaction.notes || ""),
    details: transaction.details.map(detail => (
      {
        ...detail,
        amount: (detail.amount === "" ? "" : MoneyFormatter(detail.amount)),
      }
    ))
  })

  return (
    <Form
      attributes={attributes}
      label="Update"
      onSuccess={props.toggleForm}
      updateAttributes={updateAttributes}
      {...props}
    />
  )
}

const Form = props => {
  const {
    attributes,
    updateAttributes,
    interval,
    isCashFlow,
    items,
    label,
    makeRequest,
    onSuccess,
    toggleForm,
  } = props
  const { isCurrent, firstDate, lastDate, month, year } = interval
  const { accountId } = attributes

  const updatedTransaction = {
    ...attributes,
    ...attributes.updatedAttributes,
    details: attributes.details.map(detail => ({ ...detail, ...detail.updatedAttributes })),
  }

  const {
    budgetExclusion,
    checkNumber,
    clearanceDate,
    description,
    details,
    notes,
    receipt,
  } = updatedTransaction

  const handleSubmit = event => {
    event.preventDefault();
    const detailsAttributes = updatedTransaction.details.map(detail => {
      const { id, budgetItemId, isMarkedForDelete, isNew } = detail
      if (isMarkedForDelete) {
        return { id, _destroy: true }
      } else {
        const amount = decimalToInt(detail.amount)
        return isNew ? { amount, budgetItemId } : { id, amount, budgetItemId }
      }
    })
    makeRequest({
      accountId,
      ...updatedTransaction.updatedAttributes,
      detailsAttributes,
    }, { onSuccess })
  }

  const detailReducer = (sum, detail) => decimalToInt(evalInput(detail.amount)) + sum
  const total = details.reduce(detailReducer, 0)

  const updateEntry = payload => {
    updateAttributes({
      ...attributes,
      updatedAttributes: {
        ...attributes.updatedAttributes,
        ...payload,
      }
    })
  }

  const detailFns = {
    addNew: () => updateAttributes({
      ...attributes,
      details: [...attributes.details, { ...newDetail() }],
    }),
    remove: uuid => updateAttributes({
      ...attributes,
      details: attributes.details.reduce((array, detail) => {
        if (uuid === detail.uuid && detail.isNew) {
          return array
        } else if (uuid === detail.uuid) {
          return [...array, { ...detail, isMarkedForDelete: true }]
        } else {
          return [...array, detail]
        }
      }, [])
    }),
    update: (uuid, payload) => updateAttributes({
      ...attributes,
      details: attributes.details.map(detail => {
        if (detail.uuid === uuid) {
          return { ...detail, updatedAttributes: { ...detail.updatedAttributes, ...payload } }
        } else {
          return detail
        }
      }),
    }),
  }

  const handleDatePickChange = date => updateEntry({ clearanceDate: date.toISOString() })
  const handleInputChange = event => updateEntry({ [event.target.name]: event.target.value })
  const selected = clearanceDate === null ? null : parseISO(clearanceDate)
  const openToDate = () => {
    if (clearanceDate) {
      return parseISO(clearanceDate)
    } else if (isCurrent) {
      return new Date ()
    } else if (new Date () > fromDateString(lastDate, { format: "dateObject" })) {
      return fromDateString(lastDate, { format: "dateObject" })
    } else {
      return fromDateString(firstDate, { format: "dateObject" })
    }
  }

  return (
    <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible" }}>
      <form className="flex justify-between w-full" onSubmit={handleSubmit}>
        <Cell styling={{ width: "w-4/12", flexAlign: "justify-start" }}>
          <div className="w-1/12">
            <Link onClick={toggleForm} color="text-red-800">
              <Icon className="fas fa-times" />
            </Link>
          </div>
          <div className="w-4/12">
            <DatePicker
              onChange={handleDatePickChange}
              placeholderText="clearance date"
              selected={selected}
              openToDate={openToDate()}
              todayButton="Today"
              className="p-1 w-8/12 border border-gray-600 border-solid"
            />
          </div>
          <div className="w-7/12">
            <TextInput
              name="description"
              value={description || ""}
              placeholder="description"
              onChange={handleInputChange}
              classes={["p-1 w-full"]}
            />
          </div>
        </Cell>
        <div className="w-4/12">
          <Details
            details={attributes.details}
            detailFns={detailFns}
            interval={interval}
            items={items}
            total={total}
          />
        </div>
        <div className="w-2/12 ml-8">
          {!isCashFlow && <BudgetExclusion value={budgetExclusion} updateEntry={updateEntry} />}
          <CheckNumber value={checkNumber} onChange={handleInputChange} />
          <Notes value={notes} onChange={handleInputChange} />
        </div>
        <div className="w-2/12 flex flex-row-reverse items-start">
          <Button
            bgColor="bg-green-700"
            hoverBgColor="bg-green-800"
            classes={["w-7/12"]}
            type="submit"
            onSubmit={handleSubmit}
            onClick={handleSubmit}
          >
            {label}
          </Button>
        </div>
      </form>
    </StripedRow>
  )
}

const BudgetExclusion = ({ value, updateEntry }) => {
  const onChange = event => updateEntry({ budgetExclusion: !value })

  return (
    <Row>
      <div className="w-2/12">
        <Icon className="fas fa-exclamation" />
      </div>
      <div className="w-8/12">
        Budget Exclusion?
      </div>
      <div className="w-2/12 text-right">
        <input type="checkbox" name="budgetExclusion" checked={value} onChange={onChange} />
      </div>
    </Row>
  )
}

const CheckNumber = ({ value, onChange }) => {
  const [isInputShown, toggleInput] = useState(!!value)
  const onClick = () => toggleInput(!isInputShown)

  return (
    <Row styling={{wrap: "flex-wrap"}}>
      <div className="w-2/12">
        <Link color="text-blue-400" onClick={onClick}>
          <Icon className="fas fa-money-check" />
        </Link>
      </div>
      <div className="w-10/12">
        Check Number
      </div>
      <div className="w-10/12">
        {isInputShown &&
          <TextInput classes={["w-full rounded px-1"]} name="checkNumber" value={value} onChange={onChange} />}
      </div>
    </Row>
  )
}

const Notes = ({ value, onChange }) => {
  const [isTextAreaShown, toggleTextArea] = useState(!!value)
  const onClick = () => toggleTextArea(!isTextAreaShown)

  return (
    <Row styling={{wrap: "flex-wrap"}}>
      <div className="w-2/12">
        <Link color="text-blue-400" onClick={onClick}>
          <Icon className="fas fa-sticky-note" />
        </Link>
      </div>
      <div className="w-10/12">
        Additional Notes
      </div>
      <div className="w-10/12">
        {isTextAreaShown &&
          <textarea
            style={{minHeight: "100px"}}
            className="border border-gray-400 border-solid rounded w-full"
            name="notes"
            onChange={onChange}
            placeholder="(hint: use '<br>' to create separate lines)"
            value={value}
          />}
      </div>
    </Row>
  )
}

const Details = props => {
  const { total, interval, items, detailFns } = props
  const { addNew, remove, update } = detailFns
  const details = props.details.filter(detail => !detail.isMarkedForDelete)

  if (details.length > 1) {
    return (
      <>
        <Row>
          <div className="w-4/12">
            <div className="w-10/12 flex justify-between border-b border-gray-600 border-solid">
              <div>
                Total:
              </div>
              <div>
                {MoneyFormatter(total, { decorate: true })}
              </div>
            </div>
          </div>
          <div>
            <Link color="text-blue-400" onClick={addNew}>
              <Icon className="fa fa-plus-circle" />
            </Link>
          </div>
        </Row>
        {details.map(detail => (
          <DetailForm
            key={detail.uuid}
            detail={detail}
            interval={interval}
            items={items}
            iconClassName="fa fa-times-circle"
            onClick={() => remove(detail.uuid)}
            update={update}
          />
        ))}
      </>
    )
  } else {
    return (
      <DetailForm
        detail={details[0]}
        items={items}
        interval={interval}
        iconClassName="fa fa-plus-circle"
        onClick={addNew}
        update={update}
      />
    )
  }
}

const DetailForm = props => {
  const { detail, iconClassName, interval, items, onClick, update } = props
  const originalBudgetItemId = detail.budgetItemId
  const { uuid, amount, budgetItemId, categoryName, isMarkedForDelete } = { ...detail, ...detail.updatedAttributes }
  const { month, year } = interval

  const labelFn = item => `${item.name} ${MoneyFormatter(item.remaining, { decorate: true, absolute: true })}`
  const baseOptions = items.filter(item => {
    if (item.id === originalBudgetItemId) {
      return true
    } else if (item.isAccrual && isMatureAccrual(item, month, year)) {
      return true
    } else if (item.isAccrual) {
      return false
    } else {
      return !item.isMonthly || item.isDeletable
    }
  }).map(item => asOption(item, { labelFn }))
  const optionsFn = () => {
    const nullOption = { value: null, label: "Petty Cash" }
    const sortByLabel = (a, b) => a.label < b.label ? -1 : 1
    if (baseOptions.map(o => o.value).includes(originalBudgetItemId)) {
      return [nullOption, ...baseOptions.sort(sortByLabel)]
    } else {
      return [nullOption, ...[{ value: originalBudgetItemId, label: categoryName }, ...baseOptions].sort(sortByLabel)]
    }
  }
  const availableOptions = optionsFn()

  const value = availableOptions.find(item => item.value === budgetItemId)
  const handleAmountChange = event => {
    update(uuid, { amount: event.target.value })
  }
  const handleItemChange = event => {
    const selectedItem = props.items.find(item => item.id === event.value)
    if (selectedItem && selectedItem.isMonthly && amount === "") {
      update(uuid, { budgetItemId: event.value, amount: MoneyFormatter(selectedItem.remaining) })
    } else {
      update(uuid, { budgetItemId: event.value })
    }
  }
  const handleCalculate = () => update(uuid, { amount: evalInput(amount) })
  const isEligibleForCalculation = amount !== evalInput(amount)
  const handleKeyDown = event => {
    if (event.which === 13 && isEligibleForCalculation) {
      event.preventDefault()
      handleCalculate()
    }
  }

  return (
    <Row styling={{overflow: "overflow-visible"}}>
      <div className="w-4/12 flex justify-between">
        <div className="w-10/12">
          <AmountInput
            classes={["p-1 w-full text-right"]}
            name="amount"
            placeholder="amount"
            value={amount}
            onChange={handleAmountChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {isEligibleForCalculation && <CalculatorButton onClick={handleCalculate} />}
      </div>
      <div className="w-7/12">
        <Select
          onChange={handleItemChange}
          options={availableOptions}
          value={value}
        />
      </div>
      <div>
        <Link color="text-blue-400" onClick={onClick}>
          <Icon className={iconClassName} />
        </Link>
      </div>
    </Row>
  )
}

const CalculatorButton = ({ onClick }) => (
  <div className="w-1/12">
    <Link onClick={onClick} color="text-blue-400">
      <Icon className="fas fa-calculator" />
    </Link>
  </div>
)

export default Form;
