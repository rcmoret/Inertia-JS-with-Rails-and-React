import React, { useState } from "react";

import { itemModel, transactionDetailModel } from "./Functions";
import {
  clearedMonthly,
  dayToDayExpense,
  dayToDayRevenue,
  pendingMonthly,
  isDayToDay,
  isExpense,
  isNonAccrual,
  isMatureAccrual,
  isMonthly,
  isRevenue,
  sortByName,
} from "../../lib/Functions"
import { titles, shared, index as copy } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"

import DateFormatter, { fromDateString } from "../../lib/DateFormatter"
import MoneyFormatter from "../../lib/MoneyFormatter"
import usePageData from "../../lib/usePageData";

import Discretionary from "./Discretionary";
import Cell from "../shared/Cell";
import CreateItemForm from "./CreateItemForm";
import Header from "../shared/Header";
import Icon from "../shared/Icons";
import ItemGroup from "./ItemGroup";
import Link, { ButtonStyleInertiaLink, InertiaLink } from "../shared/Link";
import MonthYearSelect from "../shared/MonthYearSelect";
import MultiItemAdjustForm from "./MultiItemAdjustForm";
import { Point } from "../shared/symbol";
import Section from "../shared/Section";
import Row from "../shared/Row";

const App = ({ budget, ...props }) => {
  const {
    daysRemaining,
    isClosedOut,
    isCurrent,
    isSetUp,
    month,
    totalDays,
    year
  } = budget.interval

  const [pageState, updatePageState] = usePageData(`budget/index/${month}/${year}`, {
    adjustItemsForm: {
      adjustmentItems: [],
      isRendered: false,
      notes: "",
      selectedItemId: null,
      selectedCategorySlug: null,
    },
    includesDeleted: false,
    isDayToDayFormShown: false,
    isMonthlyFormShown: false,
    renderAccruals: (!isClosedOut && !isCurrent),
    renderClearedMonthly: false,
    showDetailsIds: [],
    showFormId: null,
  })
  const {
    adjustItemsForm,
    includesDeleted,
    isDayToDayFormShown,
    isMonthlyFormShown,
    renderAccruals,
    renderClearedMonthly,
    showDetailsIds,
    showFormId,
  } = pageState

  const accrualLinkText = renderAccruals ? copy.hideAccruals : copy.showAccruals
  const toggleAccruals = () => updatePageState({
    ...pageState,
    renderAccruals: !renderAccruals,
  })
  const toggleDeleted = () => updatePageState({
    ...pageState,
    includesDeleted: !includesDeleted,
  })
  const clearedMonthlyLinkText = renderClearedMonthly ? copy.hideClearedMonthly : copy.showClearedMonthly
  const adjustItemsFormLinkText = adjustItemsForm.isRendered ? copy.hideAdjustItemsForm : copy.showAdjustItemsForm
  const toggleClearedMonthly = () => updatePageState({
    ...pageState,
    renderClearedMonthly: !renderClearedMonthly,
  })
  const renderForm = key => updatePageState({
    ...pageState,
    showFormId: key,
  })
  const closeForm = () => updatePageState({
    ...pageState,
    showFormId: null,
  })

  const collapseDetails = itemId => updatePageState({
    ...pageState,
    showDetailsIds: showDetailsIds.filter(id => id !== itemId),
  })
  const showDetails = id => updatePageState({
    ...pageState,
    showDetailsIds: [...showDetailsIds, id],
  })
  const discretionaryModel = data => ({
    ...data,
    transactionDetails: data.transactionDetails.map(transactionDetailModel)
  })
  const toggleDayToDayForm = () => updatePageState({
    ...pageState,
    isDayToDayFormShown: !isDayToDayFormShown,
  })
  const toggleMonthlyForm = () => updatePageState({
    ...pageState,
    isMonthlyFormShown: !isMonthlyFormShown,
  })
  const updateAdjustItemsForm = payload => updatePageState({
    ...pageState,
    adjustItemsForm: {
      ...pageState.adjustItemsForm,
      ...payload,
    },
  })
  const clearAdjustItemsForm = () => updateAdjustItemsForm({
    adjustmentItems: [],
    isRendered: false,
    selectedItemId: null,
    selectedCategorySlug: null,
  })
  const toggleAdjustItemsForm = () => updateAdjustItemsForm({ isRendered: !adjustItemsForm.isRendered })
  const discretionary = discretionaryModel(budget.interval.discretionary)

  const activeFilter = (item) => !item.isDeleted
  const items = budget.interval.items.filter(activeFilter).map(item => itemModel(item, daysRemaining, totalDays))

  const existingItemCategoryNames = items.map(item => item.name)
  const availableDayToDayCategories = budget
    .categories
    .filter(isDayToDay)
    .filter(category => !existingItemCategoryNames.includes(category.name))

  const availableMonthlyCategories = budget.categories.filter(isMonthly)

  const updateItem = (id, payload) => updateItemsState(
    items.map(item => {
      if (item.id === id) {
        return { ...item, ...payload }
      } else {
        return item
      }
    })
  )

  const fns = {
    closeForm,
    collapseDetails,
    renderForm,
    showDetails,
    toggleDayToDayForm,
    updateItem,
  }

  const accrualFilter = item => {
    if (renderAccruals || !item.isAccrual) {
      return true
    } else {
      return isMatureAccrual(item, month, year)
    }
  }
  const dayToDayExpenses = items.filter(activeFilter).filter(dayToDayExpense).filter(accrualFilter).sort(sortByName)
  const dayToDayRevenues = items.filter(activeFilter).filter(dayToDayRevenue).filter(accrualFilter).sort(sortByName)
  const monthlyExpenses = items.filter(activeFilter).filter(pendingMonthly).filter(isExpense).filter(accrualFilter).sort(sortByName)
  const monthlyRevenues = items.filter(activeFilter).filter(pendingMonthly).filter(isRevenue).filter(accrualFilter).sort(sortByName)
  const clearedMonthlyItems = items.filter(activeFilter).filter(clearedMonthly).sort(sortByName)
  const prevMonth = month === 1 ? { month: 12, year: (year - 1) } : { month: (month - 1), year }
  const nextMonth = month === 12 ? { month: 1, year: (year + 1) } : { month: (month + 1), year }

  const shortDateString = DateFormatter({ month, year, day: 1, format: "shortMonthYear" })
  const longDateString = DateFormatter({ month, year, day: 1, format: "monthYear" })
  const firstDate = fromDateString(budget.interval.firstDate)
  const lastDate = fromDateString(budget.interval.lastDate)
  const visitNextUrl = `/budget/${nextMonth.month}/${nextMonth.year}`
  const visitPrevUrl = `/budget/${prevMonth.month}/${prevMonth.year}`
  const isLastDay = isCurrent && daysRemaining === 1
  document.title = shortDateString

  return (
    <div>
      <Header namespace={props.namespace} selectedAccountPath={props.selectedAccountPath} month={month} year={year} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white"}}>
            <div className="w-full p-2 border-b-2 border-blue-900 border-solid">
              <Row styling={{alignItem: "items-start", wrap: "flex-wrap"}}>
                <Row styling={{wrap: "flex-wrap"}}>
                  <Cell styling={{width: "w-full md:w-4/12", wrap: "flex-wrap"}}>
                    <div className="text-2xl w-full">
                      <strong>{copy.title(longDateString)} </strong>
                    </div>
                    <div className="w-full">{copy.dateRange(firstDate, lastDate)}</div>
                    <div className="w-full">
                      {isCurrent && `${titleize(copy.daysRemaining(daysRemaining))}; `}
                      {titleize(copy.totalDays(totalDays))}
                    </div>
                  </Cell>
                  <Cell styling={{width: "w-full md:w-6/12", wrap: "flex-wrap"}}>
                    <div className="w-6/12">
                      <MenuItem copy={accrualLinkText} onClick={toggleAccruals} href="#" />
                      <MenuItem copy={clearedMonthlyLinkText} onClick={toggleClearedMonthly} href="#" />
                      <MenuItem
                        copy={`${includesDeleted ? "Hide" : "Show"} Deleted Items`}
                        onClick={toggleDeleted}
                        href="#"
                      />
                    </div>
                    <div className="w-6/12">
                      <MenuItem copy={adjustItemsFormLinkText} onClick={toggleAdjustItemsForm} href="#" />
                      <MenuItem copy={"Manage Categories"} href="/budget/categories" />
                      {!isSetUp && <MenuItem
                        href={`/budget/set-up/${month}/${year}`}
                        copy={`Set Up ${DateFormatter({ month, year, day: 1, format: 'shortMonthYear' })}`}
                      />}
                      {isLastDay && <MenuItem
                        href={`href=/budget/finalize/${month}/${year}`}
                        copy={`Finalize ${DateFormatter({ month, year, day: 1, format: "shortMonthYear" })}`}
                      />}
                    </div>
                  </Cell>
                </Row>
                <Row styling={{ wrap: "flex-wrap"}}>
                  <Cell styling={{ width: "w-full md:w-4/12" }}>
                    <ButtonStyleInertiaLink href={visitPrevUrl}>
                      <Icon className="fas fa-angle-double-left" />
                      {" "}
                      {DateFormatter({ month: prevMonth.month, year: prevMonth.year, format: "shortMonthYear" })}
                    </ButtonStyleInertiaLink>
                    <ButtonStyleInertiaLink  href={visitNextUrl}>
                      {DateFormatter({ month: nextMonth.month, year: nextMonth.year, format: "shortMonthYear" })}
                      {" "}
                      <Icon className="fas fa-angle-double-right" />
                    </ButtonStyleInertiaLink>
                  </Cell>
                  <Row>
                    <MonthYearSelect baseUrl="/budget" month={month} year={year} />
                  </Row>
                </Row>

              </Row>
            </div>
            {adjustItemsForm.isRendered &&
                <MultiItemAdjustForm
                  availableCategories={[...availableDayToDayCategories, ...availableMonthlyCategories]}
                  clearAdjustItemsForm={clearAdjustItemsForm}
                  items={items}
                  interval={{ month, year }}
                  formData={adjustItemsForm}
                  fns={fns}
                  updateAdjustItemsForm={updateAdjustItemsForm}
                />
            }
            <Section styling={{width: "w-full md:w-1/2", rounded: null, border: null, padding: "pt-2"}}>
              <GroupTitle
                title={titleize(titles.dayToDay)}
                isFormShown={isDayToDayFormShown}
                toggleForm={toggleDayToDayForm}
              />
              <CreateItemForm
                availableCategories={availableDayToDayCategories}
                isFormShown={isDayToDayFormShown}
                fns={fns}
                month={month}
                toggleForm={toggleDayToDayForm}
                year={year}
              />
              <Discretionary data={discretionary} />
              <ItemGroup
                name={titleize(titles.revenues)}
                collection={dayToDayRevenues}
                fns={fns}
                month={month}
                pageState={pageState}
                year={year}
              />
              <ItemGroup
                name={titleize(titles.expenses)}
                collection={dayToDayExpenses}
                fns={fns}
                month={month}
                pageState={pageState}
                year={year}
              />
            </Section>
            <Section styling={{width: "w-full md:w-1/2", rounded: null, border: null, padding: "pt-2"}}>
              <GroupTitle
                title={titleize(titles.monthly)}
                isFormShown={isMonthlyFormShown}
                toggleForm={toggleMonthlyForm}
              />
              <CreateItemForm
                availableCategories={availableMonthlyCategories}
                isFormShown={isMonthlyFormShown}
                fns={fns}
                month={month}
                toggleForm={toggleMonthlyForm}
                year={year}
              />
              <ItemGroup
                name={titleize(titles.revenues)}
                collection={monthlyRevenues}
                fns={fns}
                month={month}
                pageState={pageState}
                year={year}
              />
              <ItemGroup
                name={titleize(titles.expenses)}
                collection={monthlyExpenses}
                fns={fns}
                month={month}
                pageState={pageState}
                year={year}
              />
              {pageState.renderClearedMonthly && <ClearedMonthlySection collection={clearedMonthlyItems} pageState={pageState}/>}
            </Section>
          </Row>
        </div>
      </div>
    </div>
  )
};

const GroupTitle = ({ title, isFormShown, toggleForm }) => {
  const iconClassName = `fa fa-${isFormShown ? "times-circle" : "plus-circle"}`
  const color = `text-${isFormShown ? "red" : "blue"}-800`

  return (
    <Row styling={{padding: "pl-4 pr-4"}}>
      <div className="text-2xl">{title}</div>
      <div className="text-xl">
        <Link onClick={toggleForm} color={color}>
          <Icon className={iconClassName} />
        </Link>
      </div>
    </Row>
  )
}

const ClearedMonthlySection = ({ collection, pageState }) => {
  const expenses = collection.filter(isExpense)
  const revenues = collection.filter(isRevenue)
  return (
    <>
      <div className="w-full text-2xl pt-4 pl-2 mt-4 ml-2 mr-2 mb-2 border-t-2 border-solid border-gray-600">
        {titleize(`${copy.cleared} ${copy.monthly}`)}
      </div>
      <ItemGroup name={titleize(titles.revenues)} collection={revenues} pageState={pageState} />
      <ItemGroup name={titleize(titles.expenses)} collection={expenses} pageState={pageState} />
    </>
  )
}

const MenuItem = ({ copy, ...props }) => (
  <div>
    <InertiaLink {...props} color="text-blue-800">
      <Point>{titleize(copy)}</Point>
    </InertiaLink>
  </div>
)

export default App;
