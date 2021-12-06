import React, { useState } from "react";

import { Inertia } from "@inertiajs/inertia";

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
import Icon from "../shared/Icons";
import ItemGroup from "./ItemGroup";
import Link, { ButtonStyleLink } from "../shared/Link";
import Section from "../shared/Section";
import Row from "../shared/Row";

const App = ({ budget }) => {
  const {
    daysRemaining,
    isCurrent,
    month,
    totalDays,
    year
  } = budget.interval

  const [pageState, updatePageState] = usePageData(`budget/index/${month}/${year}`, {
    isDayToDayFormShown: false,
    isMonthlyFormShown: false,
    renderAccruals: true,
    renderClearedMonthly: false,
    showDetailsIds: [],
    showFormId: null,
  })
  const {
    renderAccruals,
    renderClearedMonthly,
    isDayToDayFormShown,
    isMonthlyFormShown,
    showDetailsIds,
    showFormId,
  } = pageState

  const accrualLinkText = renderAccruals ? copy.hideAccruals : copy.showAccruals
  const toggleAccruals = () => updatePageState({
    ...pageState,
    renderAccruals: !renderAccruals,
  })
  const clearedMonthlyLinkText = renderClearedMonthly ? copy.hideClearedMonthly : copy.showClearedMonthly
  const toggleClearedMonthly = () => updatePageState({
    ...pageState,
    renderClearedMonthly: !renderClearedMonthly,
  })
  const renderForm = id => updatePageState({
    ...pageState,
    showFormId: id,
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
  const [discretionary, updateDiscretionary] = useState(discretionaryModel(budget.interval.discretionary))

  const [items, updateItemsState] = useState(budget.interval.items.map(itemModel))

  const existingItemCategoryIds = items.map(item => item.budgetCategoryId)
  const availableDayToDayCategories = budget
    .categories
    .filter(isDayToDay)
    .filter(category => !existingItemCategoryIds.includes(category.id))

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

  const postEvents = (events, suppliedCallbacks = {}) => {
    const defaultCallbacks = { onSuccess: () => null }
    const callbacks = { ...defaultCallbacks, suppliedCallbacks }
    const onSuccess = page =>  {
      const { interval } = page.props.budget
      updateItemsState(interval.items.map(itemModel))
      updateDiscretionary(discretionaryModel(interval.discretionary))
      callbacks.onSuccess(page)
    }

    Inertia.post(
      `/budget/items/events?month=${month}&year=${year}`,
      events,
      { preserveScroll: true , onSuccess: onSuccess }
    )
  }

  const postItemCreateEvent = (budgetCategoryId, amount, callbacks = { onSuccess: () => null }) => {
    const event = {
      budgetCategoryId,
      amount,
      eventType: "item_create",
      month,
      year,
      data: null
    }
    debugger
    postEvents({ events: [event] }, callbacks)
  }

  const postItemAdjustEvent = (id, amount) => {
    const event = {
      budgetItemId: id,
      amount,
      eventType: "item_adjust",
      data: null
    }
    postEvents({ events: [event] }, { onSuccess: closeForm() })
  }

  const postItemDeleteEvent = (id, amount) => {
    const event = {
      budgetItemId: id,
      eventType: "item_delete",
      data: null
    }
    postEvents({ events: [event] })
  }

  const fns = {
    closeForm,
    collapseDetails,
    postItemAdjustEvent,
    postItemCreateEvent,
    postItemDeleteEvent,
    renderForm,
    showDetails,
    toggleDayToDayForm,
    updateItem,
  }

  const accrualFilter = item => {
    if (renderAccruals || isNonAccrual(item)) {
      return true
    } else {
      return isMatureAccrual(item, month, year)
    }
  }
  const dayToDayExpenses = items.filter(dayToDayExpense).filter(accrualFilter).sort(sortByName)
  const dayToDayRevenues = items.filter(dayToDayRevenue).filter(accrualFilter).sort(sortByName)
  const monthlyExpenses = items.filter(pendingMonthly).filter(isExpense).filter(accrualFilter).sort(sortByName)
  const monthlyRevenues = items.filter(pendingMonthly).filter(isRevenue).filter(accrualFilter).sort(sortByName)
  const clearedMonthlyItems = items.filter(clearedMonthly).sort(sortByName)
  const prevMonth = month === 1 ? { month: 12, year: (year - 1) } : { month: (month - 1), year }
  const nextMonth = month === 12 ? { month: 1, year: (year + 1) } : { month: (month + 1), year }

  const shortDateString = DateFormatter({ month, year, day: 1, format: "shortMonthYear" })
  const longDateString = DateFormatter({ month, year, day: 1, format: "monthYear" })
  const firstDate = fromDateString(budget.interval.firstDate)
  const lastDate = fromDateString(budget.interval.lastDate)
  document.title = shortDateString

  return (
    <div>
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-10/12 rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white"}}>
            <div className="w-full p-2 border-b-2 border-blue-900 border-solid">
              <Row>
                <Cell styling={{width: "w-4/12", wrap: "flex-wrap"}}>
                  <div className="text-2xl w-full">
                    <strong>{copy.title(longDateString)} </strong>
                  </div>
                  <div className="w-full">{copy.dateRange(firstDate, lastDate)}</div>
                  <div className="w-full">
                    {isCurrent && `${titleize(copy.daysRemaining(daysRemaining))}; `}
                    {titleize(copy.totalDays(totalDays))}
                  </div>
                  <Row>
                    <ButtonStyleLink  href={`/budget/${prevMonth.month}/${prevMonth.year}`}>
                      <Icon className="fas fa-angle-double-left" />
                      {" "}
                      {DateFormatter({ month: prevMonth.month, year: prevMonth.year, format: "shortMonthYear" })}
                    </ButtonStyleLink>
                    <ButtonStyleLink  href={`/budget/${nextMonth.month}/${nextMonth.year}`}>
                      {DateFormatter({ month: nextMonth.month, year: nextMonth.year, format: "shortMonthYear" })}
                      {" "}
                      <Icon className="fas fa-angle-double-right" />
                    </ButtonStyleLink>
                  </Row>
                </Cell>
                <div className="w-4/12">
                  <div>
                    <Link onClick={toggleAccruals} color="text-blue-800">
                      {titleize(accrualLinkText)}
                    </Link>
                  </div>
                  <div>
                    <Link onClick={toggleClearedMonthly} color="text-blue-800">
                      {titleize(clearedMonthlyLinkText)}
                    </Link>
                  </div>
                </div>
              </Row>
            </div>
            <Section styling={{width: "w-1/2", rounded: null, border: null, padding: "pt-2"}}>
              <GroupTitle
                title={titleize(titles.dayToDay)}
                isFormShown={isDayToDayFormShown}
                toggleForm={toggleDayToDayForm}
              />
              <CreateItemForm
                availableCategories={availableDayToDayCategories}
                isFormShown={isDayToDayFormShown}
                postItemCreateEvent={postItemCreateEvent}
                toggleForm={toggleDayToDayForm}
              />
              <Discretionary data={discretionary} />
              <ItemGroup
                name={titleize(titles.revenues)}
                collection={dayToDayRevenues}
                fns={fns}
                pageState={pageState}
              />
              <ItemGroup name={titleize(titles.expenses)} collection={dayToDayExpenses} fns={fns} pageState={pageState} />
            </Section>
            <Section styling={{width: "w-1/2", rounded: null, border: null, padding: "pt-2"}}>
              <GroupTitle
                title={titleize(titles.monthly)}
                isFormShown={isMonthlyFormShown}
                toggleForm={toggleMonthlyForm}
              />
              <CreateItemForm
                availableCategories={availableMonthlyCategories}
                isFormShown={isMonthlyFormShown}
                postItemCreateEvent={postItemCreateEvent}
                toggleForm={toggleMonthlyForm}
              />
              <ItemGroup name={titleize(titles.revenues)} collection={monthlyRevenues} fns={fns} pageState={pageState} />
              <ItemGroup name={titleize(titles.expenses)} collection={monthlyExpenses} fns={fns} pageState={pageState} />
              {pageState.renderClearedMonthly && <ClearedMonthlySection collection={clearedMonthlyItems} pageState={pageState}/>}
            </Section>
          </Row>
        </div>
      </div>
    </div>
  )
};

const GroupTitle = ({ title, isFormShown, toggleForm }) => (
  <Row styling={{padding: "pl-4 pr-4"}}>
    <div className="text-2xl">{title}</div>
    <div className="text-xl">
      <Link onClick={toggleForm}>
        <Icon className={`fa fa-${isFormShown ? "times-circle" : "plus-circle"}`} />
      </Link>
    </div>
  </Row>
)
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

export default App;
