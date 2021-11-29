import React, { useState } from "react";

import { itemModel, transactionDetailModel } from "./Functions";
import {
  clearedMonthly,
  dayToDayExpense,
  dayToDayRevenue,
  pendingMonthly,
  isExpense,
  isNonAccural,
  isMatureAccrual,
  isRevenue,
  sortByName,
} from "../../lib/Functions"
import { titles, shared, index as copy } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"

import DateFormatter, { fromDateString } from "../../lib/DateFormatter"

import Discretionary from "./Discretionary";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import ItemGroup from "./ItemGroup";
import Link, { ButtonStyleLink } from "../shared/Link";
import Section from "../shared/Section";
import Row from "../shared/Row";

const App = ({ budget }) => {
  const items = budget.interval.items.map(itemModel).sort(sortByName)
  const discretionary = {
    ...budget.interval.discretionary,
    transactionDetails: budget.interval.discretionary.transactionDetails.map(transactionDetailModel)
  }
  const {
    daysRemaining,
    isCurrent,
    month,
    totalDays,
    year
  } = budget.interval
  const [renderAccruals, updateAccrualState] = useState(false);
  const toggleAccruals = () => updateAccrualState(!renderAccruals)
  const accrualLinkText = renderAccruals ? copy.hideAccruals : copy.showAccruals
  const [renderClearedMonthly, updateClearedMonthlyState] = useState(false);
  const clearedMonthlyLinkText = renderClearedMonthly ? copy.hideClearedMonthly : copy.showClearedMonthly
  const toggleClearedMonthly = () => updateClearedMonthlyState(!renderClearedMonthly)

  const accrualFilter = item => {
    if (renderAccruals || isNonAccural(item)) {
      return true
    } else {
      return isMatureAccrual(item, month, year)
    }
  }
  const dayToDayExpenses = items.filter(dayToDayExpense).filter(accrualFilter)
  const dayToDayRevenues = items.filter(dayToDayRevenue).filter(accrualFilter)
  const monthlyExpenses = items.filter(pendingMonthly).filter(isExpense).filter(accrualFilter)
  const monthlyRevenues = items.filter(pendingMonthly).filter(isRevenue).filter(accrualFilter)
  const clearedMonthlyItems = items.filter(clearedMonthly)
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
            <Section styling={{width: "w-1/2", rounded: null}}>
              <div className="w-full text-2xl">{titleize(copy.dayToDay)}</div>
              <Discretionary data={discretionary} />
              <ItemGroup name={titleize(titles.revenues)} collection={dayToDayRevenues} />
              <ItemGroup name={titleize(titles.expenses)} collection={dayToDayExpenses} />
            </Section>
            <Section styling={{width: "w-1/2", rounded: null}}>
              <div className="w-full text-2xl">{titleize(copy.monthly)}</div>
              <ItemGroup name={titleize(titles.revenues)} collection={monthlyRevenues} />
              <ItemGroup name={titleize(titles.expenses)} collection={monthlyExpenses} />
              {renderClearedMonthly && <ClearedMonthlySection collection={clearedMonthlyItems} />}
            </Section>
          </Row>
        </div>
      </div>
    </div>
  )
};

const ClearedMonthlySection = ({ collection }) => {
  const expenses = collection.filter(isExpense)
  const revenues = collection.filter(isRevenue)
  return (
    <>
      <div className="w-full text-2xl">{titleize(`${copy.cleared} ${copy.monthly}`)}</div>
      <ItemGroup name={titleize(titles.revenues)} collection={revenues} />
      <ItemGroup name={titleize(titles.expenses)} collection={expenses} />
    </>
  )
}

export default App;
