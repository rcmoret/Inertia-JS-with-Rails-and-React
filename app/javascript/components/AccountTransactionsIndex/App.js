import React from "react";

import { router } from "@inertiajs/react";
import { v4 as uuid } from "uuid";

import DateFormatter, { fromDateString } from "../../lib/DateFormatter"
import MoneyFormatter from "../../lib/MoneyFormatter";
import { sortByClearanceDate } from "../../lib/Functions";
import usePageData from "../../lib/usePageData";

import AccountTabs from "./AccountTabs";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link, { ButtonStyleInertiaLink } from "../shared/Link";
import MonthYearSelect from "../shared/MonthYearSelect";
import PageHeader from "../shared/Header";
import { Point } from "../shared/symbol";
import Row, { StripedRow } from "../shared/Row";
import { Transaction } from "./Transaction";
import { NewForm, newTransaction } from "./TransactionForm";
import { TransferRow } from "./TransferRow";

export const App = ({ accounts, budget, selectedAccount, ...props }) => {
  const { id, balancePriorTo, isCashFlow } = selectedAccount
  const {
    daysRemaining,
    isCurrent,
    items,
    firstDate,
    lastDate,
    month,
    totalDays,
    year,
  } = budget.interval

  const initialBalance = {
    key: 0,
    amount: "",
    balance: balancePriorTo,
    clearanceDate: firstDate,
    description: "Initial Balance",
    details: []
  }

  const [pageState, updatePageState] = usePageData(`accounts/${selectedAccount.slug}/${month}/${year}`, {
    showDetailsForKeys: [],
    showFormForKey: null,
  })
  const { showDetailsForKeys, showFormForKey } = pageState

  const prevMonth = month === 1 ? { month: 12, year: (year - 1) } : { month: (month - 1), year }
  const nextMonth = month === 12 ? { month: 1, year: (year + 1) } : { month: (month + 1), year }
  const visitNextUrl = `/accounts/${selectedAccount.slug}/transactions/${nextMonth.month}/${nextMonth.year}`
  const visitPrevUrl = `/accounts/${selectedAccount.slug}/transactions/${prevMonth.month}/${prevMonth.year}`

  const detailFns = {
    render: key => updatePageState({
      ...pageState,
      showDetailsForKeys: [...pageState.showDetailsForKeys, key],
    }),
    hide: key => updatePageState({
      ...pageState,
      showDetailsForKeys: pageState.showDetailsForKeys.filter(i => i !== key),
    })
  }

  const transactionModel = transaction => {
    const detailModel = detail => ({
      ...detail,
      uuid: uuid(),
      isNew: false,
      updatedAttributes: {},
    })
    const isPending = transaction.clearanceDate === null
    const details = transaction.details.map(detailModel)

    return {
      ...transaction,
      details,
      isCleared: !isPending,
      isEditable: true,
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

  const closeForm = () => updatePageState({ ...pageState, showFormForKey: null })
  const renderForm = id => updatePageState({ ...pageState, showFormForKey: id })

  const toggleNewForm = () => {
    if (showFormForKey === "new") {
      closeForm()
    } else {
      updatePageState({ ...pageState, showFormForKey: "new" })
    }
  }
  document.title = `${selectedAccount.name} - ${DateFormatter({ month, year, day: 1, format: "numericMonthShortYear" })}`

  return (
    <div>
      <PageHeader namespace={props.namespace} />
      <div className="mb-1 h-5/6 rounded">
        <div className="pt-2 pb-2 pr-3 pl-3 bg-blue-900 w-full rounded h-v90 overflow-scroll">
          <Row styling={{align: "items-start", wrap: "flex-wrap", backgroundColor: "bg-white", padding: "pt-1 px-1 pb-24", overflow: "overflow-visible"}}>
            <Row styling={{flexAlign: "flex-start", wrap: "flex-wrap", border: "border-b border-gray-800 border-solid", rounded: null, overflow: "overflow-visible", backgroundColor: "bg-gradient-to-b from-blue-200 to-white"}}>
              <AccountTabs
                accounts={accounts}
                month={month}
                selectedAccount={selectedAccount}
                year={year}
              />
              <Cell styling={{width: "w-full md:w-3/12", wrap: "flex-wrap", margin: "mb-2"}}>
                <div className="w-full text-lg underline">
                  <h3>{DateFormatter({ month, year, format: "monthYear" })}</h3>
                </div>
                {isCurrent && <div className="w-full"><Point>Days Remaining: {daysRemaining}</Point></div>}
                <div className="w-full">
                  <Point>Total Days: {totalDays}</Point>
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
              <Cell styling={{width: "w-full md:w-3/12", wrap: "flex-wrap", margin: "mb-2 ml-2", overflow: "overflow-visible"}}>
                <MonthYearSelect baseUrl={`/accounts/${selectedAccount.slug}/transactions`} month={month} year={year} />
              </Cell>
            </Row>
            {transactions.map(transaction => (
              <Transaction
                key={transaction.key}
                transaction={{...transaction, accountId: selectedAccount.id}}
                accounts={accounts}
                closeForm={closeForm}
                detailFns={detailFns}
                interval={budget.interval}
                isCashFlow={isCashFlow}
                items={items}
                renderForm={renderForm}
                showDetailsForKeys={showDetailsForKeys}
                showFormForKey={showFormForKey}
              />
            ))}
            <NewTransaction
              account={selectedAccount}
              interval={{ isCurrent, firstDate, lastDate, month, year }}
              isCashFlow={isCashFlow}
              items={items}
              showFormForKey={showFormForKey}
              toggleNewForm={toggleNewForm}
            />
            <TransferRow
              accounts={accounts}
              selectedAccount={selectedAccount}
            />
          </Row>
        </div>
      </div>
    </div>
  )
}

const NewTransaction = props => {
  const {
    account,
    interval,
    isCashFlow,
    items,
    showFormForKey,
    toggleNewForm,
  } = props

  const { month, year } = interval
  const makeRequest = (body, callbacks) => {
    router.post(`/accounts/${account.slug}/transactions?month=${month}&year=${year}`,
      { transaction: body },
      { ...callbacks, forceFormData: true },
    )
  }

  if (showFormForKey === "new") {
    const model = newTransaction(account.slug, !account.isCashFlow)

    return (
      <NewForm
        transaction={model}
        account={account}
        interval={interval}
        items={items}
        isCashFlow={isCashFlow}
        makeRequest={makeRequest}
        toggleForm={toggleNewForm}
      />
    )
  } else {
    return (
      <StripedRow styling={{flexAlign: "justify-start"}}>
        <Cell styling={{ width: "w-full", flexAlign: "justify-start" }}>
          <div className="mr-2">
            <Link color="text-blue-700" onClick={toggleNewForm}>
              <Icon className="fas fa-plus" />
            </Link>
          </div>
          <div>
            <Link color="text-blue-700" onClick={toggleNewForm}>
              Add new transaction
            </Link>
          </div>
        </Cell>
      </StripedRow>
    )
  }
};
