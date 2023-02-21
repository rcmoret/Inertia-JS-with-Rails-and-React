import React, { useState } from "react";
import AmountSpan from "../shared/AmountSpan";
import Row from "../shared/Row";

import { shared, finalize as copy } from "../../lib/copy/budget";
import { titleize } from "../../lib/copy/functions";

const titleStyling = {
  border: "border-b-2 border-blue-900 border-solid",
  rounded: null,
  text: "text-2xl",
}

export default ({ dateString, discretionary, extraBalance, rolloverItemName, totalExtra}) => (
  <div className="w-3/10 mb-4 rounded z-50">
    <div className="bg-blue-900 p-2 rounded">
      <div className="bg-white p-4 rounded shadow-lg">
        <Row styling={titleStyling}>
          <div>{titleize(copy.finalize)}</div>
          <div>{dateString}</div>
        </Row>
        <Row styling={{text: "text-xl", flexWrap: "flex-wrap"}}>
          <div className="w-1/2">{titleize(shared.discretionary)}:</div>
          <div className="w-1/2 text-right">
            <AmountSpan amount={discretionary * -1} />
          </div>
          <div className="w-1/2">{titleize(copy.extraFromItems)}:</div>
          <div className="w-1/2 text-right">
            <AmountSpan amount={extraBalance * -1} />
          </div>
          <div className="w-1/2">{titleize(copy.totalToward)}: <span className="underline">{rolloverItemName}</span></div>
          <div className="w-1/2 text-right">
            <AmountSpan amount={totalExtra * -1} />
          </div>
        </Row>
      </div>
    </div>
  </div>
);
