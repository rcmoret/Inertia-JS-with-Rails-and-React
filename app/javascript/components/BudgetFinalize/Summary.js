import React, { useState } from "react";
import AmountSpan from "../shared/AmountSpan";
import Row from "../shared/Row"

const titleStyling = {
  border: 'border-b-2 border-blue-900 border-solid',
  rounded: null,
  text: 'text-2xl',
}

export default ({ dateString, discretionary, extraBalance, rolloverItemName, totalExtra}) => (
  <div className='w-3/10 mb-4 rounded z-50'>
    <div className='bg-blue-900 p-2 rounded'>
      <div className='bg-white p-4 rounded shadow-lg'>
        <Row styling={titleStyling}>
          <div>Finalize</div>
          <div>{dateString}</div>
        </Row>
        <Row styling={{text: 'text-xl', flexWrap: 'flex-wrap'}}>
          <div className='w-1/2'>Disrectionary:</div>
          <div className='w-1/2 text-right'>
            <AmountSpan amount={discretionary * -1} />
          </div>
          <div className='w-1/2'>Extra From Items:</div>
          <div className='w-1/2 text-right'>
            <AmountSpan amount={extraBalance * -1} />
          </div>
          <div className='w-1/2'>Total toward <span className="underline">{rolloverItemName}</span></div>
          <div className='w-1/2 text-right'>
            <AmountSpan amount={totalExtra * -1} />
          </div>
        </Row>
      </div>
    </div>
  </div>
);
