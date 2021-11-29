import React from "react";

import AmountSpan from "../shared/AmountSpan";
import Icon from "../shared/Icons";
import Row from "../shared/Row";

import { fromDateString } from "../../lib/DateFormatter";

export const TransactionDetail = ({ model, ...suppliedProps }) => {
  const props = {
    children: [],
    ...suppliedProps,
  }
  const {
    accountName,
    amount,
    clearanceDate,
    description,
    iconClassName,
    isPending
  } = model

  return (
    <Row styling={{wrap: "flex-wrap", rounded: null, fontSize: "text-sm", border: "border-b border-gray-500 border-solid"}}>
      <div className="w-3/12">
        <div>{clearanceDate}</div>
        <div className="text-sm">{accountName}</div>
      </div>
      <div className="w-6/12">
        {description}
        {" "}
        {iconClassName && <Icon className={iconClassName} />}
      </div>
      <div className="w-3/12 text-right">
        <AmountSpan amount={amount} />
      </div>
      {props.children}
    </Row>
  )
};


