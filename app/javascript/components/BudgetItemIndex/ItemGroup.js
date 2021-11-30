import React, { useState } from "react";

import { pendingMonthly } from "../../lib/Functions";
import { shared } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions";

import AmountSpan from "../shared/AmountSpan";
import BudgetItemDetails from "./ItemDetails";
import Cell from "../shared/Cell";
import { eventAndTransactionDetailSort, eventTransactionReducer } from "./Functions";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import { StripedRow, TitleRow } from "../shared/Row"
import Section from "../shared/Section";
import { TransactionDetail } from "./shared";

const ItemGroup = ({ collection, name }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <Section styling={{border: null}}>
        <TitleRow styling={{backgroundColor: "bg-gradient-to-r from-green-300 to-green-600"}}>
          <div>
            &#8226;
            {" "}
            <span className="underline">
              {name}
            </span>
          </div>
        </TitleRow>
        {collection.map(model => (
          <BudgetItem key={model.id} model={model} />
        ))}
      </Section>
    )
  }
};

const BudgetItem = ({ model }) => {
  if (pendingMonthly(model)) {
    return (
      <PendingMonthlyItem model={model} />
    )
  } else if (model.isMonthly) {
    return (
      <ClearedMonthlyItem model={model} />
    )
  } else {
    return (
      <DayToDayItem model={model} />
    )
  }
}

const DayToDayItem = ({ model }) => {
  const [state, setState] = useState({ showDetails: model.showDetails })

  const {
    id,
    amount,
    iconClassName,
    isExpense,
    difference,
    name,
    spent,
    transactionDetails,
  } = model
  const toggleDetail = () => setState({ showDetails: !state.showDetails })
  const caretClassName = state.showDetails ? "fas fa-caret-down" : "fas fa-caret-right"
  const combinedTransactionsAndEvents = [
    ...model.events,
    ...model.transactionDetails,
  ].sort(eventAndTransactionDetailSort)
  .reduce(eventTransactionReducer, [])
  const spentOrDeposited = isExpense ? shared.spent : shared.deposited
  const remainingOrDifference = (Math.abs(spent) > Math.abs(amount)) ? shared.difference : shared.remaining

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <Cell styling={{width: "w-full"}}>
        <div className="w-6/12">
          <Link onClick ={toggleDetail} color="text-blue-800" hoverColor="text-blue-800">
            <span className="text-sm">
              <Icon className={caretClassName} />
            </span>
            {" "}
            <span className="underline">
                {name}
            </span>
          </Link>
          {" "}
          <span>
            <Icon className={iconClassName} />
          </span>
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={amount} absolute={true} />
        </div>
        <div className="w-1/12">
          <Icon className="far fa-edit" />
        </div>
      </Cell>
      <Cell styling={{width: "w-full"}}>
        <div className="w-6/12">
          {titleize(spentOrDeposited)}
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={spent} absolute={true} prefix="-" />
        </div>
        <div className="w-1/12">
        </div>
      </Cell>
      <Cell styling={{width: "w-full"}}>
        <div className="w-6/12">
          {titleize(remainingOrDifference)}
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={difference} absolute={true} negativeColor="text-red-600" />
        </div>
        <div className="w-1/12">
        </div>
      </Cell>
      {state.showDetails && <BudgetItemDetails id={id} details={combinedTransactionsAndEvents} />}
     </StripedRow>
  )
}

const PendingMonthlyItem = ({ model }) => {
  const events = model.events.reduce(eventTransactionReducer, [])
  const [state, setState] = useState({ showDetails: model.showDetails })
  const toggleDetail = () => setState({ showDetails: !state.showDetails })
  const caretClassName = state.showDetails ? "fas fa-caret-down" : "fas fa-caret-right"
  const { id, iconClassName, name } = model

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <Cell styling={{width: "w-full"}}>
        <div className="w-6/12">
          <Link onClick ={toggleDetail} color="text-blue-800" hoverColor="text-blue-800">
            <span className="text-sm">
              <Icon className={caretClassName} />
            </span>
            {" "}
            <span className="underline">
              {name}
            </span>
          </Link>
          {" "}
          <span>
            <Icon className={iconClassName} />
          </span>
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={model.remaining} />
        </div>
        <div className="w-1/12">
          <Icon className="far fa-edit" />
        </div>
      </Cell>
      {state.showDetails && <BudgetItemDetails id={id} details={events} />}
    </StripedRow>
  )
}

const ClearedMonthlyItem = ({ model }) => {
  const [state, setState] = useState({ showDetails: model.showDetails })
  const { id, difference, iconClassName, isExpense, name, spent, transactionDetails } = model
  const events = model.events.reduce(eventTransactionReducer, [])
  const toggleDetail = () => setState({ showDetails: !state.showDetails })
  const caretClassName = state.showDetails ? "fas fa-caret-down" : "fas fa-caret-right"
  const spentOrDeposited = isExpense ? shared.spent : shared.deposited

  return (
    <StripedRow styling={{ wrap: "flex-wrap"}}>
      <Cell styling={{width: "w-full"}}>
        <div className="w-6/12">
          <Link onClick ={toggleDetail} color="text-blue-800" hoverColor="text-blue-800">
            <span className="text-sm">
              <Icon className={caretClassName} />
            </span>
            {" "}
            <span className="underline">
              {name}
            </span>
          </Link>
          {" "}
          <span>
            <Icon className={iconClassName} />
          </span>
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={model.amount} absolute={true} />
        </div>
      </Cell>
      <Cell styling={{width: "w-full"}}>
        {transactionDetails.map(transactionDetail => (
          <TransactionDetail key={transactionDetail.id} model={transactionDetail} />
        ))}
      </Cell>
      <Cell styling={{width: "w-full"}}>
        <div className="w-6/12">
          Difference
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={difference} absolute={true} negativeColor="text-red-600" />
        </div>
      </Cell>
      {state.showDetails && <BudgetItemDetails id={id} details={events} />}
    </StripedRow>
  )
}

export default ItemGroup;
