import React, { useState } from "react";

import { pendingMonthly } from "../../lib/Functions";
import { shared } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions";

import AmountSpan from "../shared/AmountSpan";
import BudgetItemDetails from "./ItemDetails";
import Cell from "../shared/Cell";
import DayToDayItem from "./DayToDayItem";
import { eventAndTransactionDetailSort, eventTransactionReducer } from "./Functions";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import PendingMonthlyItem from "./PendingMonthlyItem";
import { StripedRow, TitleRow } from "../shared/Row"
import Section from "../shared/Section";
import { TransactionDetail } from "./shared";


const ItemGroup = ({ collection, name, fns, pageState }) => {
  if (collection.length === 0) {
    return null
  } else {
    return (
      <Section styling={{border: null, margin: null, padding: "pt-0.5 pb-0.5 pl-1 pr1"}}>
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
          <BudgetItem key={model.id} model={model} fns={fns} pageState={pageState} />
        ))}
      </Section>
    )
  }
};

const BudgetItem = ({ model, fns, pageState }) => {
  const item = {
    ...model,
    showDetails: pageState.showDetailsIds.includes(model.id),
    showForm: (model.id === pageState.showFormId),
  }

  if (pendingMonthly(item)) {
    return (
      <PendingMonthlyItem model={item} fns={fns} />
    )
  } else if (item.isMonthly) {
    return (
      <ClearedMonthlyItem model={item} />
    )
  } else {
    return (
      <DayToDayItem model={item} fns={fns} />
    )
  }
}

const ClearedMonthlyItem = ({ model }) => {
  const [state, setState] = useState({ showDetails: model.showDetails })
  const { id, difference, iconClassName, isExpense, name, spent, transactionDetails } = model
  const events = model.events.sort(eventAndTransactionDetailSort).reduce(eventTransactionReducer, [])
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
          <AmountSpan amount={model.amount} absolute={true}
          />
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
          <AmountSpan
            amount={difference}
            absolute={true}
            color="text-green-700"
            negativeColor="text-red-700"
            zeroColor="text-black"
          />
        </div>
      </Cell>
      {state.showDetails && <BudgetItemDetails id={id} details={events} />}
    </StripedRow>
  )
}

export default ItemGroup;
