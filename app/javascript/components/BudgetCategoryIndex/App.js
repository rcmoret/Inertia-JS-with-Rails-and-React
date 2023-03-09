import React, { useState } from "react";

import { router } from "@inertiajs/react";

import { generateIdentifier } from "../../lib/Functions";
import Form from "./Form"
import Icon from "../shared/Icons";
import Link, { InertiaLink } from "../shared/Link";
import PageHeader from "../shared/Header";
import { Point } from "../shared/symbol";
import Row, { StripedRow } from "../shared/Row";
import Show from "./Show"

import { asOption, sortByLabel, sortByName } from "../../lib/Functions";
import MoneyFormatter from "../../lib/MoneyFormatter";
import usePageData from "../../lib/usePageData";

const formatKey = key => {
  switch(key) {
    case "isAccrual":
      return "accrual"
    case "isExpense":
      return "expense"
    case "isMonthly":
      return "monthly"
    default:
      return key
  }
}

const requestBody = attributes => Object.entries(attributes).reduce((acc, [key, value]) => (
  { ...acc, [formatKey(key)]: value }
), {})

export const App = props => {
  const newCategory = {
      name: "",
      accrual: false,
      defaultAmount: "",
      displayAmount: "",
      expense: null,
      iconId: null,
      isNew: true,
      isPerDiemEnabled: false,
      monthly: null,
      slug: "",
      updatedAttributes: {
        key: generateIdentifier(),
      }
  }
  const [pageData, updatePageData] = usePageData(`budget/category`, {
    areFiltersShown: false,
    showFormForSlug: null,
    showMaturityIntervalsForIds: [],
    filters: [
      { name: "adjective", value: "all" },
      { name: "adverb", value: "all" },
      { name: "search", value: "" },
    ],
    newCategory,
  })
  const { areFiltersShown, filters, showMaturityIntervalsForIds, showFormForSlug } = pageData
  const categories = props.budget.categories.map(c => c.icon === null ? { ...c, icon: { id: null } } : c)
  const updateFilters = ({ name, value }) => updatePageData({
    ...pageData,
    filters: filters.map(filter => filter.name === name ? { name, value } : filter),
  })
  const toggleFilters = () => updatePageData({ ...pageData, areFiltersShown: !areFiltersShown })
  const updateNewCategory = payload => updatePageData({
    ...pageData,
    newCategory: {
      ...pageData.newCategory,
      updatedAttributes: {
        ...pageData.newCategory.updatedAttributes,
        ...payload
      },
    },
  })
  const queryParams = props.includesArchived ? "?include_archived=true" : ""
  const submitNewCategory = () => router.post(`/budget/categories${queryParams}`,
    { category: requestBody(pageData.newCategory.updatedAttributes) },
    { onSuccess: updatePageData({ ...pageData, newCategory }) },
  )
  const adjectiveFilter = category => {
    const filter = filters.find(filter => filter.name === "adjective")
    switch (filter.value) {
    case "expense":
      return category.isExpense
    case "revenue":
      return !category.isExpense
    default:
      return true
    }
  }
  const adverbFilter = category => {
    const filter = filters.find(filter => filter.name === "adverb")
    switch (filter.value) {
    case "day-to-day":
      return !category.isMonthly
    case "monthly":
      return category.isMonthly
    default:
      return true
    }
  }
  const searchTerm = filters.find(filter => filter.name === "search").value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const searchFilter = category => {
    if (searchTerm === "") {
      return true
    } else {
      const expression = new RegExp(searchTerm, "i")
      return category.name.match(expression)
    }
  }
  const sortByArchivedThenName = (a, b) => {
    if ((a.archivedAt && b.archivedAt) || (!a.archivedAt && !b.archivedAt)) {
      return sortByName(a, b)
    } else {
      return b.archivedAt ? -1 : 1
    }
  }
  const sortFn = (a, b) => {
    const strictExp = new RegExp(`^${searchTerm}.*`, "i")
    const looseExp = new RegExp(`(^|\\s)${searchTerm}.*`, "i")
    if (searchTerm === "") {
      return sortByArchivedThenName(a, b)
    } else if (a.name.match(strictExp) && b.name.match(strictExp)) {
      return sortByArchivedThenName(a, b)
    } else if (a.name.match(strictExp)) {
      return -1
    } else if (b.name.match(strictExp)) {
      return 1
    } else if (a.name.match(looseExp) && b.name.match(looseExp)) {
      return sortByArchivedThenName(a, b)
    } else if (a.name.match(looseExp)) {
      return -1
    } else if (b.name.match(looseExp)) {
      return 1
    } else {
      return sortByArchivedThenName(a, b)
    }
  }
  const categoryFilter = category => searchFilter(category) && adjectiveFilter(category) && adverbFilter(category)
  const icons = props.budget.icons.map(asOption).sort(sortByLabel)
  const closeForm = () => updatePageData({ ...pageData, newCategory, showFormForId: null })
  const categoryFns = {
    isFormShown: slug => showFormForSlug === slug,
    openForm: slug => updatePageData({ ...pageData, showFormForSlug: slug }),
    closeForm,
    isDetailShown: slug => showMaturityIntervalsForIds.includes(slug),
    hideMaturityIntervals: slug => updatePageData({
      ...pageData,
      showMaturityIntervalsForIds:  pageData.showMaturityIntervalsForIds.filter(s => s !== slug),
    }),
    showMaturityIntervals: slug => updatePageData({
      ...pageData,
      showMaturityIntervalsForIds: [
        ...pageData.showMaturityIntervalsForIds,
        slug,
      ]
    }),
  }
  const newFormFns = {
    closeForm,
    renderForm: () => updatePageData({ ...pageData, showFormForSlug: "new" }),
  }

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white", padding: "pt-1 px-1 pb-24", overflow: "overflow-visible"}}>
            <FilterRow
              includesArchived={props.includesArchived}
              filters={filters}
              areFiltersShown={areFiltersShown}
              toggleFilters={toggleFilters}
              updateFilters={updateFilters}
            />
            <HeaderRow includesArchived={props.includesArchived} />
            <NewCategory
              category={pageData.newCategory}
              fns={newFormFns}
              icons={icons}
              isFormShown={showFormForSlug === "new"}
              onSubmit={submitNewCategory}
              update={updateNewCategory}
            />
            {categories.filter(categoryFilter).sort(sortFn).map((category, index) => (
              <Category
                key={index}
                category={category}
                icons={icons}
                fns={categoryFns}
                queryParams={queryParams}
              />
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

const Category = ({ icons, fns, ...props }) => {
  const { id, archivedAt, name, slug } = props.category
  const { closeForm, isFormShown, ...maturityFns } = fns
  if (isFormShown(slug)) {
    const [category, updateCategory] = useState({
      ...props.category,
      displayAmount: MoneyFormatter(props.category.defaultAmount),
      iconId: props.category.icon.id,
      isNew: false,
      updatedAttributes: {},
    })
    const onSubmit = () => router.put(`/budget/categories/${slug}${props.queryParams}`,
        { category: requestBody(category.updatedAttributes) },
        { onSuccess: closeForm }
    )
    const update = payload => updateCategory({
      ...category,
      updatedAttributes: {
        ...category.updatedAttributes,
        ...payload
      },
    })
    return (
      <Form category={category} update={update} icons={icons} onSubmit={onSubmit} closeForm={closeForm} />
    )
  } else {
    const deleteCategory = () => {
      const isConfirmed = window.confirm(`Are you sure you want to delete ${name}?`)
      if (isConfirmed) {
        router.delete(`/budget/categories/${slug}${props.queryParams}`)
      }
    }
    const restoreCategory = () => {
      const body = { archivedAt: null }
      router.put(`/budget/categories/${slug}`, { category: body })
    }
    const deleteOrRestoreCategory = () => archivedAt ? restoreCategory() : deleteCategory()
    const openForm = () => fns.openForm(slug)
    return (
      <Show category={props.category} openForm={openForm} deleteOrRestoreCategory={deleteOrRestoreCategory} maturityFns={maturityFns} />
    )
  }
}

const FilterRow = ({ areFiltersShown, includesArchived, filters, toggleFilters, updateFilters }) => {
  const handleChange = event => updateFilters(event.target)
  const searchTerm = filters.find(filter => filter.name === "search").value
  const adverbValue = filters.find(filter => filter.name === "adverb").value
  const adjectiveValue = filters.find(filter => filter.name === "adjective").value
  const href = `/budget/categories${includesArchived ? "" : "?include_archived=true"}`
  const iconClassName = `fas fa-caret-${areFiltersShown ? "down" : "right"}`
  const areFiltersApplied = searchTerm || adverbValue !== "all" || adjectiveValue !== "all"
  const filterIconSpanName = areFiltersApplied ? "text-blue-400" : "text-gray-600"

  return (
    <Row styling={{bgColor: "bg-gray-200", flexAlign: "justify-start", wrap: "flex-wrap"}}>
      <div className="w-full mb-4">
        <Link color="text-blue-700" onClick={toggleFilters}>
          <Icon className={iconClassName} />
        </Link>
        {" "}
        <span className="text-2xl font-semibold">Filters</span>
        {" "}
        <span className={filterIconSpanName}>
          <Icon className="fas fa-filter" />
        </span>
      </div>
      {areFiltersShown &&
          <Filters
            adjectiveValue={adjectiveValue}
            adverbValue={adverbValue}
            handleChange={handleChange}
            href={href}
            includesArchived={includesArchived}
            searchTerm={searchTerm}
            />}
    </Row>
  )
}

const Filters = props => {
  const {
    adjectiveValue,
    adverbValue,
    handleChange,
    href,
    includesArchived,
    searchTerm,
  } = props
  return (
    <Row styling={{flexAlign: "justify-start", rounded: null, border: "border-t border-solid border-gray-800" }}>
      <div className="w-2/12">
        <div className="w-full">
          <input type="text" value={searchTerm} name="search" onChange={handleChange} placeholder="filter by name"/>
        </div>
        <div className="w-full mt-8">
          <InertiaLink color="text-blue-800" href={href}>
            <Point>
              {includesArchived ? "Exclude Archived" : "Include Archived"}
            </Point>
          </InertiaLink>
        </div>
      </div>
      <div className="w-2/12">
        <div>
          <span className="underline font-semibold">Monthly/Day-To-Day</span>
          <Row>
            <div>All</div>
            <input type="radio" onChange={handleChange} name="adverb" value="all" checked={adverbValue === "all"} />
          </Row>
          <Row>
            <div>Monthly</div>
            <input type="radio" onChange={handleChange} name="adverb" value="monthly" checked={adverbValue === "monthly"} />
          </Row>
          <Row>
            <div>Day-to-Day</div>
            <input type="radio" onChange={handleChange} name="adverb" value="day-to-day" checked={adverbValue === "day-to-day"} />
          </Row>
        </div>
      </div>
      <div className="w-2/12 ml-4">
        <div>
          <span className="underline font-semibold">Expense/Revenue</span>
          <Row>
            <div>All</div>
            <input type="radio" onChange={handleChange} name="adjective" value="all" checked={adjectiveValue === "all"} />
          </Row>
          <Row>
            <div>Expense</div>
            <input type="radio" onChange={handleChange} name="adjective" value="expense" checked={adjectiveValue === "expense"} />
          </Row>
          <Row>
            <div>Revenue</div>
            <input type="radio" onChange={handleChange} name="adjective" value="revenue" checked={adjectiveValue === "revenue"} />
          </Row>
        </div>
      </div>
    </Row>
  )
}

const HeaderRow = ({ includesArchived }) => (
  <Row styling={{margin: "mb-1", flexAlign: "justify-start", border: "border-t border-b border-solid border-gray-800", rounded: null}}>
    <div className="w-2/12">
      <span className="underline text-xl">
        Name
      </span>
    </div>
    <div className="w-1/12">
      <span className="underline text-xl">
        Slug
      </span>
    </div>
    <div className="w-1/12 text-right pr-4">
      <span className="underline text-xl">
        Default Amount
      </span>
    </div>
    <div className="w-2/12">
      <span className="underline text-xl">
        Description
      </span>
    </div>
    <div className="w-1/10">
      <span className="underline text-xl">
        Icon
      </span>
    </div>
    <div className="w-1/10">
      <span className="underline text-xl">
        Maturity Intervals
      </span>
    </div>
    <div className="w-1/12">
      <span className="underline text-xl">
        Per Diem?
      </span>
    </div>
    <div className="w-2/12 italic">
      <span className="underline text-xl">
        {includesArchived && "Archival Info"}
      </span>
    </div>
    <div className="1/10">
      <span className="underline text-xl">
        Edit/Delete
      </span>
    </div>
  </Row>
)

const NewCategory = ({ category, fns, icons, isFormShown, update, onSubmit }) => {
  const { closeForm, renderForm } = fns
  if (isFormShown) {
    return (
      <Form category={category} closeForm={closeForm} icons={icons} update={update} onSubmit={onSubmit} />
    )
  } else {
    return (
      <StripedRow styling={{flexAlign: "justify-start", overflow: "overflow-visible"}}>
        <Link color="text-blue-700"  onClick={renderForm}>
          <Icon className="fas fa-plus" />
          {" "}
          Add New
        </Link>
      </StripedRow>
    )
  }
}

export default App;
