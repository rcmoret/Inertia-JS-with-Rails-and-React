import React, { useState } from "react";

import { router } from "@inertiajs/react";
import Select from "react-select";

import DateFormatter, { fromDateString, monthOptions } from "../../lib/DateFormatter";

import AmountSpan from "../shared/AmountSpan";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row, { StripedRow } from "../shared/Row";
import TextInput from "../shared/TextInput";

const Show = ({ category, deleteOrRestoreCategory, maturityFns, openForm, ...props }) => {
  const {
    archivedAt,
    defaultAmount,
    icon,
    isArchived,
    isAccrual,
    isExpense,
    isMonthly,
    isPerDiemEnabled,
    maturityIntervals,
    name,
    slug,
  } = category
  const expenseOrRevenue = isExpense ? "expense" : "revenue"
  const monthlyOrDaytoDay = isMonthly ? "monthly" : "day-to-day"
  const description = `${[monthlyOrDaytoDay, expenseOrRevenue].join(" ")}${isAccrual ? " accrual" : ""}`
  const isDetailShown = maturityFns.isDetailShown(slug)
  const fns = {
    hide: () => maturityFns.hideMaturityIntervals(slug),
    show: () => maturityFns.showMaturityIntervals(slug),
  }

  return (
    <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible"}}>
      <div className="w-2/12">
        {name}
      </div>
      <div className="w-1/12">
        {slug}
      </div>
      <div className="w-1/12 text-right pr-4">
        <AmountSpan amount={defaultAmount} />
      </div>
      <div className="w-2/12 italic">
        {description}
      </div>
      <div className="w-1/10">
        <IconInfo icon={icon} />
      </div>
      <div className="w-1/10">
        {isAccrual && <MaturityIntervals slug={slug} isDetailShown={isDetailShown} maturityIntervals={maturityIntervals} fns={fns} />}
      </div>
      <div className="w-1/10 text-right pr-4">
        {isPerDiemEnabled && <span>true</span>}
      </div>
      <div className="w-2/12 italic">
        {isArchived && <span>Archived on {fromDateString(archivedAt)}</span>}
      </div>
      <div className="w-1/10">
        <Links isArchived={isArchived} deleteOrRestoreCategory={deleteOrRestoreCategory} openForm={openForm} />
      </div>
    </StripedRow>
  )
}

const IconInfo = ({ icon }) => {
  if (icon === null) {
    return null
  } else {
    return (
      <>
        <Icon className={icon.className} /> {icon.name}
      </>
    )
  }
}

const MaturityIntervals = ({ slug, isDetailShown, maturityIntervals, fns }) => {
  if (isDetailShown) {
    const [form, updateForm] = useState({
      isShown: false,
      month: null,
      year: "",
    })

    const showForm = () => updateForm({ ...form, isShown: true })
    const hideForm = () => updateForm({ ...form, isShown: false })
    return (
      <div>
        <Link color="text-blue-700" onClick={fns.hide}>
          <Icon className="fas fa-calendar" />
        </Link>
        <div>
          {maturityIntervals.map((maturityInterval, index) => (
            <MaturityInterval key={index} slug={slug} {...maturityInterval} />
          ))}
        </div>
        {form.isShown && <MaturityIntervalForm slug={slug} form={form} updateForm={updateForm} hideForm={hideForm} />}
        {!form.isShown && <Link color="text-blue-700" onClick={showForm}><Icon className="fas fa-plus"/></Link>}
      </div>
    )
  } else {
    return (
      <Link color="text-blue-700" onClick={fns.show}>
        <Icon className="fas fa-calendar" />
      </Link>
    )
  }
}

const MaturityInterval = ({ slug, month, year }) => {
  const onClick = () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this?")
    if (isConfirmed) {
      const url = `/budget/categories/${slug}/maturity_intervals/${month}/${year}?redirect_to=/budget/categories`
      router.delete(url)
    }
  }

  return (
    <Row>
      <div className="w-8/12">
        {DateFormatter({ month: month, year: year, format: "shortMonthYear" })}
      </div>
      <div>
        <Link onClick={onClick} color="text-red-700">
          <Icon className="fas fa-times-circle" />
        </Link>
      </div>
    </Row>
  )
}

const MaturityIntervalForm = ({ slug, hideForm, form, updateForm }) => {
  const handleInputChange = event => updateForm({ ...form, [event.target.name]: event.target.value })
  const handleSelectChange= event => updateForm({ ...form,  month: event.value })
  const options = monthOptions()
  const { month, year } = form
  const value = options.find(option => option.value === month)
  const submit = () => router.post(`/budget/categories/${slug}/maturity_intervals?redirect_to=/budget/categories`,
    { interval: { month, year } },
    { onSuccess: hideForm }
  )

  return (
    <div className="w-full border-t border-solid border-gray-800 mt-2 pt-1">
      <div className="w-full text-center">
        <Icon className="fas fa-plus" />
        {" "}
        <span className="text-lg">Add New</span>
      </div>
      <div className="w-full">
        Month
      </div>
      <Select
        onChange={handleSelectChange}
        options={options}
        value={value}
      />
      <div className="w-full">
        Year
      </div>
      <div className="w-full">
        <TextInput classes={["w-full", "p-1", "text-right"]} value={year} onChange={handleInputChange} name="year" />
      </div>
      <Row styling={{flexDirection: "flex-row-reverse"}}>
        <div>
          <Link onClick={submit} color="text-green-700">
            <Icon className="fas fa-check" />
          </Link>
        </div>
        <div>
          <Link onClick={hideForm} color="text-red-700">
            <Icon className="fas fa-times-circle" />
          </Link>
        </div>
      </Row>
    </div>
  )
}

const Links = ({ isArchived, deleteOrRestoreCategory, openForm }) => {
  const iconClassName = `fas fa-trash${isArchived ? "-restore" : ""}`
  return (
    <Row>
      <div>
        <Link onClick={openForm} color="text-blue-700">
          <Icon className="fas fa-edit" />
        </Link>
      </div>
      <div>
        <Link onClick={deleteOrRestoreCategory} color="text-blue-700">
          <Icon className={iconClassName} />
        </Link>
      </div>
    </Row>
  )
}

export default Show;
