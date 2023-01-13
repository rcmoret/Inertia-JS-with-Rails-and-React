import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { createFilter } from "react-select";

import { parseISO } from 'date-fns'

import { fromDateString } from "../../lib/DateFormatter";
import evalInput from "../../lib/dynamicInputEvaluator";
import { asOption, generateIdentifier, isMatureAccrual, sortByLabel } from "../../lib/Functions";
import MoneyFormatter, { decimalToInt } from "../../lib/MoneyFormatter";

import Button from "../shared/Button";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import { StripedRow } from "../shared/Row";
import Link from "../shared/Link";
import Row from "../shared/Row";
import TextInput, { AmountInput } from "../shared/TextInput";

const newDetail = () => ({
  amount: "",
  budgetItemKey: null,
  isNew: true,
  key: generateIdentifier(),
  updatedAttributes: {}
})

export const newTransaction = (accountId, budgetExclusion) => ({
  accountId,
  checkNumber: "",
  clearanceDate: null,
  description: "",
  details: [{ ...newDetail() }],
  isEditable: false,
  notes: "",
  receipt: null,
  updatedAttributes: { budgetExclusion },
})

export const NewForm = ({ account, transaction, ...props }) => {
  const [attributes, updateAttributes] = useState(transaction)
  const onSuccess = () => updateAttributes(newTransaction(account.id, !account.isCashFlow))

  return (
    <Form
      attributes={attributes}
      label="Create"
      accounts={[]}
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
      accounts={props.accounts}
      onSuccess={props.toggleForm}
      updateAttributes={updateAttributes}
      {...props}
    />
  )
}

const Form = props => {
  const {
    accounts,
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

  const updatedTransaction = {
    ...attributes,
    ...attributes.updatedAttributes,
    details: attributes.details.map(detail => ({ ...detail, ...detail.updatedAttributes })),
  }

  const {
    accountId,
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
      const { id, budgetItemKey, isMarkedForDelete, key } = detail
      if (isMarkedForDelete) {
        return { key, _destroy: true }
      } else {
        return { amount: decimalToInt(detail.amount), budgetItemKey, key }
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

  const toggleBudgetExclusion = () => {
    if (budgetExclusion) {
      updateEntry({ budgetExclusion: false })
    } else {
      updateAttributes({
        ...attributes,
        details: attributes.details.map(detail => ({
          ...detail,
          updatedAttributes: {
            ...detail.updatedAttributes,
            budgetItemKey: null,
          }
        })),
        updatedAttributes: {
          ...attributes.updatedAttributes,
          budgetExclusion: true,
        }
      })
    }
  }

  const detailFns = {
    addNew: () => updateAttributes({
      ...attributes,
      details: [...attributes.details, { ...newDetail() }],
    }),
    remove: key => updateAttributes({
      ...attributes,
      details: attributes.details.reduce((array, detail) => {
        if (key === detail.key && detail.isNew) {
          return array
        } else if (key === detail.key) {
          return [...array, { ...detail, isMarkedForDelete: true }]
        } else {
          return [...array, detail]
        }
      }, [])
    }),
    update: (key, payload) => updateAttributes({
      ...attributes,
      details: attributes.details.map(detail => {
        if (detail.key === key) {
          return { ...detail, updatedAttributes: { ...detail.updatedAttributes, ...payload } }
        } else {
          return detail
        }
      }),
    }),
  }

  const handleDatePickChange = input => {
    const date = input === null ? null : input.toISOString()
    updateEntry({ clearanceDate: date })
  }
  const handleInputChange = event => updateEntry({ [event.target.name]: event.target.value })
  const handleFileUpload = event => updateEntry({ receipt: event.target.files[0] })
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
            isBudgetExclusion={budgetExclusion}
            details={attributes.details}
            detailFns={detailFns}
            interval={interval}
            items={items}
            total={total}
          />
        </div>
        <div className="w-2/12 ml-8">
          {!isCashFlow && <BudgetExclusion value={budgetExclusion} toggleBudgetExclusion={toggleBudgetExclusion} />}
          <CheckNumber value={checkNumber} onChange={handleInputChange} />
          <Notes value={notes} onChange={handleInputChange} />
          <Receipt value={receipt} onChange={handleFileUpload} />
          {accounts.length > 0 && <AccountSelect accountId={accountId} accounts={accounts} updateEntry={updateEntry} />}
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

const BudgetExclusion = ({ value, toggleBudgetExclusion }) => {
  return (
    <Row>
      <div className="w-2/12">
        <Icon className="fas fa-exclamation" />
      </div>
      <div className="w-8/12">
        Budget Exclusion?
      </div>
      <div className="w-2/12 text-right">
        <input type="checkbox" name="budgetExclusion" checked={value} onChange={toggleBudgetExclusion} />
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
  const { isBudgetExclusion, total, interval, items, detailFns } = props
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
            key={detail.key}
            detail={detail}
            interval={interval}
            isBudgetExclusion={isBudgetExclusion}
            items={items}
            iconClassName="fa fa-times-circle"
            onClick={() => remove(detail.key)}
            update={update}
          />
        ))}
      </>
    )
  } else {
    return (
      <DetailForm
        detail={details[0]}
        interval={interval}
        isBudgetExclusion={isBudgetExclusion}
        items={items}
        iconClassName="fa fa-plus-circle"
        onClick={addNew}
        update={update}
      />
    )
  }
}

const DetailForm = props => {
  const { detail, iconClassName, interval, isBudgetExclusion, items, onClick, update } = props
  const originalBudgetItemKey = detail.budgetItemKey
  const { key, amount, budgetItemKey, budgetCategoryName, isMarkedForDelete, isNew } = { ...detail, ...detail.updatedAttributes }
  const { month, year } = interval

  const valueFn = item => item.key
  const labelFn = item => `${item.name} ${MoneyFormatter(item.remaining, { decorate: true, absolute: true })}`
  const baseOptions = items.filter(item => {
    if (item.id === originalBudgetItemKey) {
      return true
    } else if (item.isAccrual && isMatureAccrual(item, month, year)) {
      return true
    } else if (item.isAccrual) {
      return false
    } else {
      return !item.isMonthly || item.isDeletable
    }
  }).map(item => asOption(item, { valueFn, labelFn }))
  const [term, setTerm] = useState("")
  const selectFilter = createFilter({ matchFrom: "start" })
  const optionsFn = () => {
    const options = [{ value: null, label: "Petty Cash" }, ...baseOptions]
    if (isNew || options.map(o => o.value).includes(originalBudgetItemKey)) {
      return options.sort(sortByLabel)
    } else {
      return [{ value: originalBudgetItemKey, label: budgetCategoryName }, ...options].sort(sortByLabel)
    }
  }
  const availableOptions = optionsFn()

  const value = availableOptions.find(item => item.value === budgetItemKey)
  const handleAmountChange = event => {
    update(key, { amount: event.target.value })
  }
  const handleItemChange = event => {
    const selectedItem = props.items.find(item => item.key === event.value)
    if (selectedItem && selectedItem.isMonthly && amount === "") {
      update(key, { budgetItemKey: event.value, amount: MoneyFormatter(selectedItem.remaining) })
    } else {
      update(key, { budgetItemKey: event.value })
    }
  }
  const handleCalculate = () => update(key, { amount: evalInput(amount) })
  const isEligibleForCalculation = amount !== evalInput(amount)
  const handleKeyDown = event => {
    if (event.which === 13 && isEligibleForCalculation) {
      event.preventDefault()
      handleCalculate()
    }
  }
  const resetTerm = () => setTerm("");
  const updateTerm = event => {
    switch(event.key) {
      case "Backspace":
        setTerm(term.slice(0, (term.length - 1)))
        return
      case "Escape":
        resetTerm()
        return
      case "Enter":
        resetTerm()
        return
      case "Meta":
        return null
      default:
        setTerm(`${term}${event.key}`)
        return null
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
          filterOption={selectFilter}
          isDisabled={isBudgetExclusion}
          onBlur={resetTerm}
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

const Receipt = ({ receipt, onChange }) => {
  return (
    <input type="file" value={receipt} onChange={onChange} name="receipt" multiple />
  )
}

const AccountSelect = ({ accounts, accountId, updateEntry }) => {
  const options = accounts.map(a => ({ value: a.id, label: a.name })).sort(sortByLabel)
  const value = options.find(option => option.value === accountId)
  const handleChange = event => updateEntry({ accountId: event.value })

  return(
    <div className="w-full mt-2">
      <Select
        onChange={handleChange}
        options={options}
        value={value}
      />
    </div>
  )
}
