import React, { useState } from "react";

import AmountSpan from "../shared/AmountSpan";
import Cell from "../shared/Cell";
import Icon from "../shared/Icons";
import Link from "../shared/Link";
import Row from "../shared/Row"
import { TransactionDetail } from "./shared"
import { shared, index as copy } from "../../lib/copy/budget"
import { titleize } from "../../lib/copy/functions"

const BudgetItemDetails = ({ id, details }) => {
  return (
    <>
      <Row styling={{rounded: null, wrap: "flex-wrap", border: "border-t border-gray-500 border-solid"}}>
        <div className="w-8/12">
          <strong>{titleize(copy.detailsTitle)}</strong>
        </div>
        <div className="w-4/12 text-right">
          <strong>{copy.id}: {id}</strong>
        </div>
      </Row>
      <Row styling={{rounded: null, wrap: "flex-wrap", border: "border-t border-gray-500 border-solid"}}>
        {details.map(model => (
          <BudgetItemDetail key={model.id} model={model} />
        ))}
      </Row>
    </>
  )
}

const BudgetItemDetail = ({ model }) => {
  if (model.isTransactionDetail) {
    return (
      <TransactionDetail model={model}>
        <Row styling={{fontSize: "text-xs"}}>
          <Cell styling={{width: "w-6/12"}}>
            <div>{titleize(shared.budgeted)}:</div>
            <div><AmountSpan amount={model.budgeted} /></div>
          </Cell>
          <Cell styling={{width: "w-6/12"}}>
            <div>{titleize(shared.remaining)}:</div>
            <div><AmountSpan amount={model.remaining} /></div>
          </Cell>
        </Row>
      </TransactionDetail>
    )
  } else {
    return (
      <BudgetItemEvent event={model} />
    )
  }
}

const BudgetItemEvent = ({ event }) => {
  const [eventState, setEventState] = useState({ renderData: false })

  const toggleData = () => setEventState({ renderData: !eventState.renderData })

  const {
    amount,
    budgeted,
    createdAt,
    data,
    prevBudgeted,
    prevRemaining,
    remaining,
    typeDescription,
  } = event

  return (
    <>
      <Row styling={{wrap: "flex-wrap", rounded: null, fontSize: "text-sm", border: "border-b border-gray-500 border-solid"}}>
        <div className="w-3/12">{createdAt}</div>
        <div className="w-6/12">Event: {titleize(typeDescription)}</div>
        <div className="w-3/12 text-right">
          <div><AmountSpan amount={amount} /></div>
        </div>
        <Row styling={{fontSize: "text-xs"}}>
          <Cell styling={{width: "w-6/12", wrap: "flex-wrap"}}>
            <Row>
              <div>Budgeted:</div>
              <div><AmountSpan amount={prevBudgeted} /></div>
            </Row>
            <Row>
              <div>Amount:</div>
              <div> + <AmountSpan amount={amount} /></div>
            </Row>
            <Row>
              <div>Updated Budgeted:</div>
              <div><AmountSpan amount={budgeted} /></div>
            </Row>
          </Cell>
          <Cell styling={{width: "w-6/12", wrap: "flex-wrap"}}>
            <Row>
              <div>Remaining:</div>
              <div><AmountSpan amount={prevRemaining} /></div>
            </Row>
            <Row>
              <div>Amount:</div>
              <div> + <AmountSpan amount={amount} /></div>
            </Row>
            <Row>
              <div>Updated Remaining:</div>
              <div><AmountSpan amount={remaining} /></div>
            </Row>
          </Cell>
        </Row>
        <Row styling={{fontSize: "text-xs"}}>
          {data && <BudgetItemData data={data} renderData={eventState.renderData} toggleData={toggleData} />}
        </Row>
      </Row>
    </>
  )
}

const BudgetItemData = ({ data, renderData, toggleData }) => {
  const caretClassName = renderData ? "fas fa-caret-down" : "fas fa-caret-right"

  if (renderData) {
    return (
      <div className="w-full">
        <Link onClick={toggleData} color="text-blue-800" hoverColor="text-blue-800">
          <Icon className={caretClassName} />
          {" "}
          {copy.hideData}
        </Link>
        <pre className="p-2 text-purple-700 border border-solid border-purple-700 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  } else {
    return (
      <div>
        <Link onClick={toggleData} color="text-blue-800" hoverColor="text-blue-800">
          <Icon className={caretClassName} />
          {" "}
          {copy.showData}
        </Link>
      </div>
    )
  }
}

export default BudgetItemDetails;