import React from "react";

import { v4 as uuid } from "uuid";

import DateFormatter, { fromDateString } from "../../lib/DateFormatter"
import MoneyFormatter from "../../lib/MoneyFormatter";
import { sortByClearanceDate } from "../../lib/Functions";
import usePageData from "../../lib/usePageData";

import AccountTabs from "./AccountTabs";
import AmountSpan from "../shared/AmountSpan";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link, { ButtonStyleInertiaLink } from "../shared/Link";
import PageHeader from "../shared/Header";
import Row, { StripedRow } from "../shared/Row";

export const App = ({ accounts, selectedAccount, ...props }) => {
  const { daysRemaining, firstDate, lastDate, month, totalDays, year } = props.budget.interval
  const initialBalance = {
    id: 0,
    amount: "",
    balance: selectedAccount.balancePriorTo,
    clearanceDate: fromDateString(firstDate),
    description: "Initial Balance",
    details: []
  }
  const selectedAccountId = selectedAccount.id
  const [pageState, updatePageState] = usePageData(`accounts/${selectedAccountId}/${month}/${year}`, {
    showDetailsForIds: [],
  })

  const prevMonth = month === 1 ? { month: 12, year: (year - 1) } : { month: (month - 1), year }
  const nextMonth = month === 12 ? { month: 1, year: (year + 1) } : { month: (month + 1), year }
  const visitNextUrl = `/accounts/${selectedAccount.slug}/transactions/${nextMonth.month}/${nextMonth.year}`
  const visitPrevUrl = `/accounts/${selectedAccount.slug}/transactions/${prevMonth.month}/${prevMonth.year}`

  const detailFns = {
    render: id => updatePageState({
      ...pageState,
      showDetailsForIds: [...pageState.showDetailsForIds, id],
    }),
    hide: id => updatePageState({
      ...pageState,
      showDetailsForIds: pageState.showDetailsForIds.filter(i => i !== id),
    })
  }

  const transactionModel = transaction => {
    const detailModel = detail => ({
      ...detail,
      uuid: uuid(),
      updatedAttributes: {},
    })
    const isPending = transaction.clearanceDate === null
    const clearanceDate = isPending ? "Pending" : fromDateString(transaction.clearanceDate)
    const details = transaction.details.map(detailModel)

    return {
      ...transaction,
      clearanceDate,
      details,
      isCleared: !isPending,
      isPending,
      updatedAttributes: {},
    }
  }
  const transactions = selectedAccount.transactions
    .map(transactionModel)
    .sort(sortByClearanceDate)
    .reduce((array, transaction) => {
      const { balance } = array[array.length - 1]
      return [
        ...array,
        { ...transaction, balance: balance + (transaction.amount || 0) },
      ]
    }, [initialBalance])

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white"}}>
            <AccountTabs
              accounts={accounts}
              month={month}
              selectedAccount={selectedAccount}
              year={year}
            />
            <Cell styling={{width: "w-3/12", wrap: "flex-wrap", margin: "mb-2"}}>
              <div className="w-full text-lg underline"><h3>Transactions</h3></div>
              <div className="w-full">
                {fromDateString(firstDate)} to {fromDateString(lastDate)}
              </div>
              <div className="w-full">
                Total Days: {totalDays}
              </div>
              <div className="w-full">
                Days Remaining: {daysRemaining}
              </div>
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
            {transactions.map(transaction => (
              <Transaction
                key={transaction.id}
                transaction={transaction}
                detailFns={detailFns}
                showDetailsForIds={pageState.showDetailsForIds}
              />
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

const Transaction = ({ transaction, showDetailsForIds, detailFns }) => {
  const {
    id,
    amount,
    balance,
    budgetExclusion,
    checkNumber,
    clearanceDate,
    description,
    details,
    notes,
  } = transaction
  const isDetailShown = showDetailsForIds.includes(id)
  const noteLines = (notes || "").split("<br>")

  return (
    <StripedRow styling={{flexAlign: "justify-start"}}>
      <Cell styling={{ width: "w-4/12", flexAlign: "justify-start" }}>
        <div className="w-1/12">
          {details.length > 1 && <DetailToggleLink id={id} isDetailShown={isDetailShown} detailFns={detailFns} />}
        </div>
        <div className="w-5/12">
          {clearanceDate || "pending"}
        </div>
        <div className="w-5/12">
          {description || <BudgetItems details={details} />}
          {isDetailShown && <BudgetItemList details={details} />}
        </div>
      </Cell>
      <div className="w-1/12 text-right">
        <AmountSpan amount={amount} />
        {isDetailShown && <DetailAmounts key={id} details={details} />}
      </div>
      <div className="w-1/12 text-right">
        <AmountSpan amount={balance} negativeColor="text-red-800" />
      </div>
      <div className="ml-4">
        {description && !isDetailShown ? <BudgetItems details={details} /> : ""}
      </div>
      {checkNumber && <div className="ml-4"><Icon className="fas fa-money-check" /> {checkNumber}</div>}
      {budgetExclusion && <div className="ml-4 italic">budget exclusion</div>}
      {notes && <Notes noteLines={noteLines} />}
    </StripedRow>
  )
}

const DetailToggleLink = ({ id, isDetailShown, detailFns }) => {
  const className = `fas fa-caret-${isDetailShown ? "down" : "right"}`
  const onClick = () => isDetailShown ? detailFns.hide(id) : detailFns.render(id)

  return (
    <Link onClick={onClick}>
      <Icon className={className} />
    </Link>
  )
}

const DetailAmounts = ({ details }) => (
 details.map(detail => (
   <div key={detail.id} className="w-full text-sm">
     {MoneyFormatter(detail.amount)}
   </div>
 ))
)

const BudgetItems = ({ details }) => (
  details.map((detail, n) => {
    return (
      <span key={detail.id}>
        { n > 0 && "; "}
        {detail.categoryName || "Petty Cash"}
        {" "}
        <Icon className={detail.iconClassName} />
      </span>
    )
  })
)

const BudgetItemList = ({ details }) => (
  details.map(detail => (
    <div key={detail.id} className="w-full text-sm">
      {detail.categoryName || "Petty Cash"}
      {" "}
      <Icon className={detail.iconClassName} />
    </div>
  ))
)

const Notes = ({ noteLines }) => (
  <div className="ml-4 w-4/12">
    {noteLines.map((note, index) => (
      <div key={index} className="w=full">
        {index === 0 && <Icon className="fas fa-sticky-note" />}
        {" "}
        {note}
      </div>
    ))}
  </div>
)

export default App;
