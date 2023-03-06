import React, { useState } from "react";

import { shared, index as copy } from "../../lib/copy/budget";
import { eventAndTransactionDetailSort } from "./Functions";

import AmountSpan from "../shared/AmountSpan";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import { Point } from "../shared/symbol";
import Section from "../shared/Section";
import Row, { TitleRow } from "../shared/Row";
import { titleize } from "../../lib/copy/functions";
import { TransactionDetail } from "./shared";

const Discretionary = ({ data, dispatch }) => {
  const {
    deposited,
    spent,
  } = shared
  const {
    hideTransactions,
    overBudget,
    remaining,
    showTransactions,
    underBudget,
  } = copy
  const [state, setState] = useState({ showDiscretionaryTransactions: false })
  const toggleTransactions = () => setState({ showDiscretionaryTransactions: !state.showDiscretionaryTransactions })
  const { amount, transactionDetails, transactionsTotal, overUnderBudget } = data
  const total = amount - transactionsTotal - overUnderBudget
  const depositedOrSpent = transactionsTotal <= 0 ? spent : deposited
  const overOrUnderBudget = overUnderBudget < 0 ? overBudget : underBudget
  const transactionsLabel = state.showDiscretionaryTransactions ? hideTransactions : showTransactions

  return (
    <Section styling={{border: null, margin: null, padding: "pt-0.5 pb-0.5 pl-1 pr1"}}>
      <TitleRow styling={{backgroundColor: "bg-gradient-to-r from-green-300 to-green-600"}}>
        <div>
          <Point>
            <span className="underline">
              {titleize(shared.discretionary)}
            </span>
          </Point>
        </div>
      </TitleRow>
      <Row styling={{padding: "pl-1 pr-1"}}>
        <div className="w-6/12">
          <span className="italic">
            {titleize(shared.total)}
          </span>
        </div>
        <div className="w-4/12 text-right"><AmountSpan amount={total} /></div>
      </Row>
      <Row styling={{padding: "pl-1 pr-1"}}>
        <div className="w-6/12">
          <span className="italic">
            {titleize(depositedOrSpent)}
          </span>
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={transactionsTotal}
            color="text-green-800"
            negativeColor="text-red-700"
            zeroColor="text-black"
          />
        </div>
      </Row>
      <Row styling={{padding: "pl-1 pr-1"}}>
        <div className="w-6/12">
          <span className="italic">
            {titleize(overOrUnderBudget)}
          </span>
        </div>
        <div className="w-4/12 text-right">
          <AmountSpan amount={overUnderBudget}
            color="text-green-800"
            negativeColor="text-red-700"
            zeroColor="text-black"
          />
        </div>
      </Row>
      <Row styling={{padding: "pl-1 pr-1"}}>
        <div className="w-6/12">
          <span className="italic">
            {titleize(remaining)}
          </span>
        </div>
        <div className="w-4/12 text-right"><AmountSpan amount={amount} negativeColor="text-red-700" /></div>
      </Row>
      <Transactions
        toggleTransactions={toggleTransactions}
        label={transactionsLabel}
        transactionDetails={transactionDetails}
        showDiscretionaryTransactions={state.showDiscretionaryTransactions}
      />
   </Section>
  )
}

const Transactions = ({ label, toggleTransactions, transactionDetails, showDiscretionaryTransactions }) => {
  const caretName = showDiscretionaryTransactions ? "fas fa-caret-down" : "fas fa-caret-right"

  if (transactionDetails.length === 0) {
    return null
  } else {
    return (
      <>
        <Row>
          <Link color="text-blue-700" hoverColor="text-blue-900" onClick={toggleTransactions}>
            <Icon className={caretName} />
            {" "}
            <span className="underline">{label}</span>
          </Link>
        </Row>
        {showDiscretionaryTransactions && <TransactionDetails transactionDetails={transactionDetails} />}
      </>
    )
  }
}

const TransactionDetails = ({ transactionDetails }) => (
  <Row styling={{rounded: null, wrap: "flex-wrap", border: "border-t border-gray-500 border-solid"}}>
    <div className="w-full"><strong>Transaction Details</strong></div>
    {transactionDetails.sort(eventAndTransactionDetailSort).map(transactionDetail => (
      <TransactionDetail key={transactionDetail.key} model={transactionDetail} />
    ))}
  </Row>
)


export default Discretionary;
